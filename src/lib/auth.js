// src/lib/auth.js

import { verifyFirebaseToken } from "./verifyToken";
import { getConnection } from "./db";
import { isParentAllowlisted } from "./authorization/parentAllowlist";
import sql from "mssql";

function createAuthError(message, code) {
  const error = new Error(message);
  error.code = code;
  return error;
}

async function getAuthenticatedFirebaseUser(req) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw createAuthError(
      "Missing or invalid Authorization header",
      "MISSING_AUTH_HEADER"
    );
  }

  const token = authHeader.slice("Bearer ".length).trim();

  if (!token) {
    throw createAuthError(
      "Authorization token is missing",
      "EMPTY_TOKEN"
    );
  }

  let decoded;

  try {
    decoded = await verifyFirebaseToken(token);
  } catch {
    throw createAuthError(
      "Invalid or expired authentication token",
      "INVALID_TOKEN"
    );
  }

  const uid = decoded.uid || decoded.sub;

  if (!uid) {
    throw createAuthError(
      "Firebase token is missing a UID",
      "NO_UID_IN_TOKEN"
    );
  }

  return {
    ...decoded,
    uid,
    email: String(decoded.email || "").trim().toLowerCase(),
    emailVerified: decoded.email_verified === true,
  };
}

/**
 * Existing SQL-backed authorization.
 * Keep using this for staff/admin routes and routes that require Users.id.
 */
export async function verifyUser(req) {
  const firebaseUser = await getAuthenticatedFirebaseUser(req);

  let result;

  try {
    const pool = await getConnection();

    result = await pool
      .request()
      .input("uid", sql.NVarChar, firebaseUser.uid)
      .query(`
        SELECT id, role, is_admin
        FROM Users
        WHERE firebase_uid = @uid
      `);
  } catch (error) {
    console.error("verifyUser SQL lookup failed:", error.message);

    throw createAuthError(
      "Database lookup failed",
      "DB_LOOKUP_FAILED"
    );
  }

  if (result.recordset.length === 0) {
    throw createAuthError(
      "User not found in database",
      "USER_NOT_FOUND"
    );
  }

  const { id, role, is_admin } = result.recordset[0];

  return {
    ...firebaseUser,
    id,
    role,
    isAdmin: Boolean(is_admin),
  };
}

/**
 * Parent authorization does not require a matching SQL Users row.
 * Firebase proves identity; the private CSV grants parent access.
 */
export async function verifyParentAccess(req) {
  const firebaseUser = await getAuthenticatedFirebaseUser(req);

  if (!firebaseUser.email) {
    throw createAuthError(
      "A verified email address is required.",
      "EMAIL_REQUIRED"
    );
  }

  if (!firebaseUser.emailVerified) {
    throw createAuthError(
      "Please verify your email address before accessing the parent portal.",
      "EMAIL_NOT_VERIFIED"
    );
  }

  const allowed = await isParentAllowlisted(firebaseUser.email);

  if (!allowed) {
    throw createAuthError(
      "This email is not authorized for the parent portal.",
      "PARENT_NOT_ALLOWLISTED"
    );
  }

  return {
    ...firebaseUser,
    role: "parent",
    isAdmin: false,
  };
}

/**
 * Login role resolution:
 * - SQL remains authoritative for staff/admin.
 * - The CSV is authoritative for parents.
 * - A SQL parent row alone does not grant parent access.
 * - If SQL is temporarily unavailable, an allowlisted parent can still
 *   resolve as a parent; no staff/admin privileges are granted by fallback.
 */
export async function resolveApplicationRole(req) {
  const firebaseUser = await getAuthenticatedFirebaseUser(req);

  let sqlUser = null;
  let sqlLookupFailed = false;

  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("uid", sql.NVarChar, firebaseUser.uid)
      .query(`
        SELECT id, role, is_admin
        FROM Users
        WHERE firebase_uid = @uid
      `);

    sqlUser = result.recordset[0] || null;
  } catch (error) {
    sqlLookupFailed = true;
    console.error(
      "Role resolver SQL lookup failed; checking parent allowlist:",
      error.message
    );
  }

  // Staff/admin role is resolved only from SQL.
  if (sqlUser && sqlUser.role === "staff") {
    return {
      role: "staff",
      is_admin: Boolean(sqlUser.is_admin),
    };
  }

  // A SQL row with another role does not override the CSV.
  // Parent access still requires a verified email and active CSV entry.
  if (!firebaseUser.email || !firebaseUser.emailVerified) {
    if (sqlUser && sqlUser.role && sqlUser.role !== "parent") {
      throw createAuthError(
        "This account does not have a valid application role.",
        "INVALID_ROLE"
      );
    }

    throw createAuthError(
      "A verified email address is required.",
      "EMAIL_NOT_VERIFIED"
    );
  }

  const allowed = await isParentAllowlisted(firebaseUser.email);

  if (allowed) {
    return {
      role: "parent",
      is_admin: false,
    };
  }

  if (sqlLookupFailed) {
    throw createAuthError(
      "Unable to resolve your application role.",
      "DB_LOOKUP_FAILED"
    );
  }

  throw createAuthError(
    "This account is not authorized to access the application.",
    "USER_NOT_AUTHORIZED"
  );
}

export async function requireAdmin(req) {
  const user = await verifyUser(req);

  if (user.role !== "staff" || !user.isAdmin) {
    throw createAuthError("Admin access required", "NOT_ADMIN");
  }

  return user;
}