import { NextResponse } from "next/server";
import { getPostgresConnection } from "@/lib/db-postgres";
import { verifyFirebaseToken } from "@/lib/verifyToken";

export async function POST(request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  const token = authHeader.slice("Bearer ".length).trim();

  if (!token) {
    return NextResponse.json(
      { error: "Authentication token is missing." },
      { status: 401 }
    );
  }

  let decoded;

  try {
    decoded = await verifyFirebaseToken(token);
  } catch {
    return NextResponse.json(
      { error: "Invalid or expired authentication token." },
      { status: 401 }
    );
  }

  const uid = decoded.sub;
  const email = decoded.email?.trim().toLowerCase();

  if (decoded.email_verified !== true) {
    return NextResponse.json(
      {
        error:
          "Please verify your email address before activating your Hidayatul account.",
      },
      { status: 403 }
    );
  }

  if (!uid || !email) {
    return NextResponse.json(
      {
        error:
          "Firebase account is missing required identity details.",
      },
      { status: 400 }
    );
  }

  try {
    const pool = getPostgresConnection();

    // Check whether this Firebase UID is already linked.
    const existingUid = await pool.query(
      `
        SELECT id, email, display_name, role, is_admin
        FROM "dbo"."Users"
        WHERE firebase_uid = $1
      `,
      [uid]
    );

    if (existingUid.rows.length > 0) {
      return NextResponse.json({
        success: true,
        linked: false,
        message: "Firebase account is already linked.",
        user: existingUid.rows[0],
      });
    }

    // Locate the administrator-created invitation by email.
    const invitedResult = await pool.query(
      `
        SELECT
          id,
          firebase_uid,
          email,
          display_name,
          role,
          is_admin
        FROM "dbo"."Users"
        WHERE LOWER(BTRIM(email)) = $1
        LIMIT 1
      `,
      [email]
    );

    if (invitedResult.rows.length === 0) {
      return NextResponse.json(
        {
          error:
            "No Hidayatul account exists for this email address. Please contact an administrator.",
        },
        { status: 403 }
      );
    }

    const invitedUser = invitedResult.rows[0];

    // Never replace a different Firebase identity.
    if (
      invitedUser.firebase_uid &&
      invitedUser.firebase_uid !== uid
    ) {
      return NextResponse.json(
        {
          error:
            "This invitation is already linked to another Firebase account.",
        },
        { status: 409 }
      );
    }

    // Link only if the invitation is still unclaimed
    // or already linked to this same UID.
    const updateResult = await pool.query(
      `
        UPDATE "dbo"."Users"
        SET
          firebase_uid = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
          AND (
            firebase_uid IS NULL
            OR firebase_uid = $1
          )
        RETURNING
          id,
          email,
          display_name,
          role,
          is_admin
      `,
      [uid, invitedUser.id]
    );

    if (updateResult.rows.length === 0) {
      return NextResponse.json(
        {
          error:
            "The account could not be linked because its invitation has changed. Please try again or contact an administrator.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      linked: true,
      message: "Firebase account successfully linked.",
      user: updateResult.rows[0],
    });
  } catch (error) {
    console.error("POST /api/users/link failed:", {
      code: error?.code,
      message: error?.message,
    });

    return NextResponse.json(
      { error: "Failed to link Firebase account." },
      { status: 500 }
    );
  }
}