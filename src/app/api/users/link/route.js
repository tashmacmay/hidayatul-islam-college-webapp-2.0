import { NextResponse } from "next/server";
import { getPostgresConnection } from "@/lib/db-postgres";
import { verifyFirebaseToken } from "@/lib/verifyToken";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Links an authenticated Firebase account to an existing Neon invitation.
 *
 * Important:
 * - The user must already exist in Neon.
 * - The email must match the administrator-created invitation.
 * - The Firebase UID is obtained from the verified token.
 * - A different Firebase UID must never overwrite an existing link.
 * - Email verification is intentionally not required in this prototype.
 */
export async function POST(request) {
  // Step 1: Extract the Firebase ID token from the Authorization header.
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

  // Step 2: Verify the token's signature, issuer and audience.
  let decoded;

  try {
    decoded = await verifyFirebaseToken(token);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid or expired Firebase authentication token." },
      { status: 401 }
    );
  }

  // Firebase ID tokens use "sub" as the user's UID.
  const uid = decoded.sub;
  const email =
    typeof decoded.email === "string"
      ? decoded.email.trim().toLowerCase()
      : "";

  if (!uid || !email) {
    return NextResponse.json(
      {
        error:
          "The Firebase account is missing its required UID or email address.",
      },
      { status: 400 }
    );
  }

  let client;

  try {
    const pool = getPostgresConnection();

    // Use a dedicated connection because the linking operation is transactional.
    client = await pool.connect();

    await client.query("BEGIN");

    /*
     * Step 3: Check whether this Firebase UID is already linked.
     *
     * If it is linked, only accept the request if the Firebase email
     * still matches the email stored in the linked Neon record.
     */
    const existingUidResult = await client.query(
      `
        SELECT
          id,
          email,
          display_name,
          role,
          is_admin
        FROM "dbo"."Users"
        WHERE firebase_uid = $1
        LIMIT 1
        FOR UPDATE
      `,
      [uid]
    );

    if (existingUidResult.rows.length > 0) {
      const existingUser = existingUidResult.rows[0];

      const existingEmail = String(existingUser.email || "")
        .trim()
        .toLowerCase();

      if (existingEmail !== email) {
        await client.query("ROLLBACK");

        return NextResponse.json(
          {
            error:
              "This Firebase account is already linked to a different email address. Please contact an administrator.",
          },
          { status: 409 }
        );
      }

      await client.query("COMMIT");

      return NextResponse.json({
        success: true,
        linked: false,
        message: "Firebase account is already linked.",
        user: existingUser,
      });
    }

    /*
     * Step 4: Find the administrator-created invitation.
     *
     * The browser cannot choose the user's role or create its own
     * Neon record. The matching invitation supplies those details.
     *
     * FOR UPDATE locks the invitation row during this transaction.
     */
    const invitedResult = await client.query(
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
        FOR UPDATE
      `,
      [email]
    );

    if (invitedResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          error:
            "No Hidayatul account exists for this email address. Please contact an administrator.",
        },
        { status: 403 }
      );
    }

    const invitedUser = invitedResult.rows[0];

    /*
     * Step 5: Prevent an invitation from being claimed by another
     * Firebase account.
     */
    if (
      invitedUser.firebase_uid &&
      invitedUser.firebase_uid !== uid
    ) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          error:
            "This invitation is already linked to another Firebase account.",
        },
        { status: 409 }
      );
    }

    /*
     * Step 6: Link the Firebase UID to the invitation.
     *
     * The WHERE condition provides an additional safeguard:
     * only an unlinked invitation or one already linked to this
     * same UID can be updated.
     */
    const updateResult = await client.query(
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
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          error:
            "The account could not be linked because its invitation has changed. Please try again or contact an administrator.",
        },
        { status: 409 }
      );
    }

    // Commit the successful link.
    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      linked: true,
      message: "Firebase account successfully linked.",
      user: updateResult.rows[0],
    });
  } catch (error) {
    // Roll back any incomplete database operation.
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("User-link rollback failed:", rollbackError.message);
      }
    }

    console.error("POST /api/users/link failed:", {
      code: error?.code,
      message: error?.message,
    });

    if (error?.code === "23505") {
      return NextResponse.json(
        {
          error:
            "This Firebase account is already linked to another user record.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to link Firebase account." },
      { status: 500 }
    );
  } finally {
    // Always release the connection back to the PostgreSQL pool.
    if (client) {
      client.release();
    }
  }
}