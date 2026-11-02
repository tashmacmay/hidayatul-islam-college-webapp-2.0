import { verifyFirebaseToken } from './verifyToken';
import { getPostgresConnection } from './db-postgres';

function createAuthError(message, code, statusCode) {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  return error;
}

function toBoolean(value) {
  return (
    value === true ||
    value === 1 ||
    value === '1' ||
    String(value).toLowerCase() === 'true'
  );
}

/**
 * Verifies Firebase identity and retrieves the current
 * user's role from Neon PostgreSQL.
 *
 * The database is authoritative for authorisation.
 */
export async function verifyUser(req) {
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createAuthError(
      'Missing or invalid Authorization header',
      'MISSING_AUTH_HEADER',
      401
    );
  }

  const token = authHeader.slice('Bearer '.length).trim();

  if (!token) {
    throw createAuthError(
      'Authorization token is missing',
      'EMPTY_TOKEN',
      401
    );
  }

  let decoded;

  try {
    decoded = await verifyFirebaseToken(token);
  } catch (error) {
    console.error(
      'Firebase token verification failed:',
      error.message
    );

    throw createAuthError(
      'Invalid or expired authentication token',
      'INVALID_TOKEN',
      401
    );
  }

  const uid = decoded.uid || decoded.sub;

  if (!uid) {
    throw createAuthError(
      'Firebase token is missing a UID',
      'NO_UID_IN_TOKEN',
      401
    );
  }

  let result;

  try {
    const pool = getPostgresConnection();

    // ADDED: display_name to the SELECT query
    result = await pool.query(
      `SELECT id, role, is_admin, display_name
       FROM "dbo"."Users"
       WHERE firebase_uid = $1
       LIMIT 1`,
      [uid]
    );
  } catch (error) {
    console.error(
      'Neon PostgreSQL user lookup failed:',
      error.message
    );

    const databaseError = createAuthError(
      'Database lookup failed',
      'DB_LOOKUP_FAILED',
      500
    );

    databaseError.cause = error;
    throw databaseError;
  }

  if (result.rows.length === 0) {
    throw createAuthError(
      'User not found in database',
      'USER_NOT_FOUND',
      401
    );
  }

  const row = result.rows[0];

  const databaseRole = String(row.role || '')
    .trim()
    .toLowerCase();

  if (!databaseRole) {
    throw createAuthError(
      'User role is not configured',
      'ROLE_NOT_CONFIGURED',
      403
    );
  }

  // Canonical admin model:
  // role = staff AND is_admin = true.
  //
  // Also support the existing UI's "admin" role value
  // by normalising it to effective staff/admin privileges.
  const role =
    databaseRole === 'admin'
      ? 'staff'
      : databaseRole;

  const isAdmin =
    databaseRole === 'admin' ||
    (role === 'staff' && toBoolean(row.is_admin));

  return {
    ...decoded,
    uid,
    id: row.id,
    role,
    isAdmin,
    display_name: row.display_name || null, // ADDED: Return the display name
  };
}

/**
 * Requires one of the specified database roles.
 */
export async function requireRoles(req, allowedRoles) {
  const user = await verifyUser(req);

  const normalizedRoles = allowedRoles.map((role) =>
    String(role).trim().toLowerCase()
  );

  if (!normalizedRoles.includes(user.role)) {
    throw createAuthError(
      'You do not have permission to access this resource.',
      'FORBIDDEN_ROLE',
      403
    );
  }

  return user;
}

/**
 * Parent-only access.
 */
export async function requireParent(req) {
  return requireRoles(req, ['parent']);
}

/**
 * Staff-only access.
 */
export async function requireStaff(req) {
  return requireRoles(req, ['staff']);
}

/**
 * Administrator-only access.
 */
export async function requireAdmin(req) {
  const user = await requireStaff(req);

  if (!user.isAdmin) {
    throw createAuthError(
      'Admin access required',
      'NOT_ADMIN',
      403
    );
  }

  return user;
}