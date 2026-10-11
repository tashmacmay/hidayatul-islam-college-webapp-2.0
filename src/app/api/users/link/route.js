//users/link/route.js
import { NextResponse } from "next/server";
import sql from "mssql";
import { getConnection } from "@/lib/db";
import { verifyFirebaseToken } from "@/lib/verifyToken";

export async function POST(request) {
  // Step 1: Authenticate Firebase directly.
  // Do NOT use verifyUser() here because the UID may not
  // have been linked to the SQL user yet.
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

  // Firebase's standard UID claim is "sub".
  const uid = decoded.sub;
  const email = decoded.email?.trim().toLowerCase();

  if (!uid || !email) {
    return NextResponse.json(
      { error: "Firebase account is missing required identity details." },
      { status: 400 }
    );
  }

  /*

// Require the Firebase email address to be verified.
if (decoded.email_verified !== true) {
  return NextResponse.json(
    {
      error:
        "Please verify your email address before activating your account.",
    },
    { status: 403 }
  );
}


   * SECURITY:
   * Before deploying, ensure your activation flow verifies
   * ownership of the email address before allowing it to be
   * linked to an invitation.
   *
   * If your flow already requires Firebase email verification,
   * enforce decoded.email_verified === true here.
   */

  try {
    const pool = await getConnection();

    // Step 2: Is this Firebase account already linked?
    const existingUid = await pool
      .request()
      .input("uid", sql.NVarChar(255), uid)
      .query(`
        SELECT id, email, display_name, role, is_admin
        FROM Users
        WHERE firebase_uid = @uid
      `);

    if (existingUid.recordset.length > 0) {
      return NextResponse.json({
        success: true,
        linked: false,
        message: "Firebase account is already linked.",
        user: existingUid.recordset[0],
      });
    }

    // Step 3: Find the administrator-created invitation.
    const invitedResult = await pool
      .request()
      .input("email", sql.NVarChar(255), email)
      .query(`
        SELECT
          id,
          firebase_uid,
          email,
          display_name,
          role,
          is_admin
        FROM Users
        WHERE LOWER(LTRIM(RTRIM(email))) = @email
      `);

    if (invitedResult.recordset.length === 0) {
      return NextResponse.json(
        {
          error:
            "No Hidayatul account exists for this email address. Please contact an administrator.",
        },
        { status: 403 }
      );
    }

    const invitedUser = invitedResult.recordset[0];

    // Step 4: Never replace another Firebase identity.
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

    // Step 5: Link only if the UID is still unclaimed,
    // or already belongs to this same Firebase account.
    // This also helps prevent simultaneous requests from
    // overwriting a different UID.
    const updateResult = await pool
      .request()
      .input("id", sql.Int, invitedUser.id)
      .input("uid", sql.NVarChar(255), uid)
      .query(`
        UPDATE Users
        SET
          firebase_uid = @uid,
          updated_at = GETDATE()
        OUTPUT
          INSERTED.id,
          INSERTED.email,
          INSERTED.display_name,
          INSERTED.role,
          INSERTED.is_admin
        WHERE id = @id
          AND (
            firebase_uid IS NULL
            OR firebase_uid = @uid
          )
      `);

    if (updateResult.recordset.length === 0) {
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
      user: updateResult.recordset[0],
    });
  } catch (error) {
    // Log diagnostic details on the server without returning
    // database internals to the browser.
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