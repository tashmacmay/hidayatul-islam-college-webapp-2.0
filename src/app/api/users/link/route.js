import { NextResponse } from "next/server";
import sql from "mssql";
import { getConnection } from "@/lib/db";
import { verifyUser } from "@/lib/auth";

export async function POST(request) {
  try {
    /*
     * Firebase verifies the user's identity.
     *
     * The UID comes from the verified token.
     * We do NOT accept firebase_uid from the browser.
     */
    const firebaseUser = await verifyUser(request);

    const uid = firebaseUser.uid;
    const email = firebaseUser.email;

    if (!email) {
      return NextResponse.json(
        {
          error: "Authenticated Firebase account has no email address.",
        },
        { status: 400 }
      );
    }

    const pool = await getConnection();

    /*
     * First check whether this Firebase UID is
     * already linked to a database user.
     */
    const existingUid = await pool
      .request()
      .input("uid", sql.NVarChar(255), uid)
      .query(`
        SELECT
          id,
          email,
          display_name,
          role,
          is_admin
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

    /*
     * Find the user created by the administrator
     * using the Firebase account's email address.
     */
    const invitedUser = await pool
      .request()
      .input("email", sql.NVarChar(255), email.trim().toLowerCase())
      .query(`
        SELECT
          id,
          firebase_uid,
          email,
          display_name,
          role,
          is_admin
        FROM Users
        WHERE email = @email
      `);

    /*
     * There is no corresponding application user.
     */
    if (invitedUser.recordset.length === 0) {
      return NextResponse.json(
        {
          error:
            "No Hidayatul account exists for this email address. Please contact an administrator.",
        },
        { status: 403 }
      );
    }

    const databaseUser = invitedUser.recordset[0];

    /*
     * Prevent replacing another Firebase identity.
     */
    if (
      databaseUser.firebase_uid &&
      databaseUser.firebase_uid !== uid
    ) {
      return NextResponse.json(
        {
          error:
            "This email address is already linked to another Firebase account.",
        },
        { status: 409 }
      );
    }

    /*
     * Link the Firebase UID to the existing SQL user.
     */
    const result = await pool
      .request()
      .input("id", sql.Int, databaseUser.id)
      .input("uid", sql.NVarChar(255), uid)
      .query(`
        UPDATE Users

        SET
          firebase_uid = @uid,
          updated_at = GETDATE()

        OUTPUT
          INSERTED.id,
          INSERTED.firebase_uid,
          INSERTED.email,
          INSERTED.display_name,
          INSERTED.role,
          INSERTED.is_admin,
          INSERTED.created_at,
          INSERTED.updated_at

        WHERE id = @id
      `);

    return NextResponse.json({
      success: true,
      linked: true,
      message: "Firebase account successfully linked.",
      user: result.recordset[0],
    });
  } catch (error) {
    console.error("❌ POST /api/users/link error:", error);

    if (
      error.message === "Missing or invalid Authorization header" ||
      error.message === "Invalid token"
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to link Firebase account.",
      },
      { status: 500 }
    );
  }
}