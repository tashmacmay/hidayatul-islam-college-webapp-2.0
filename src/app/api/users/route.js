import { NextResponse } from "next/server";
import sql from "mssql";
import { getConnection } from "@/lib/db";
import { verifyUser } from "@/lib/auth";

/*
|--------------------------------------------------------------------------
| Verify that the authenticated Firebase user is an administrator
|--------------------------------------------------------------------------
|
| Authentication:
|   Firebase verifies who the user is.
|
| Authorization:
|   Azure SQL determines whether that user is an administrator.
|
*/
async function verifyAdmin(request) {
  const firebaseUser = await verifyUser(request);
  const pool = await getConnection();

  const result = await pool
    .request()
    .input("uid", sql.NVarChar(255), firebaseUser.uid)
    .query(` SELECT id, role, is_admin FROM Users WHERE firebase_uid = @uid `);

  if (result.recordset.length === 0) {
    throw new Error("User not found in database");
  }

  const user = result.recordset[0];

  if (!user.is_admin) {
    throw new Error("Forbidden");
  }

  return {
    firebaseUser,
    databaseUser: user,
  };
}

/*
|--------------------------------------------------------------------------
| GET - Fetch all users
|--------------------------------------------------------------------------
*/
export async function GET(request) {
  try {
    await verifyAdmin(request);

    const pool = await getConnection();
    const result = await pool
      .request()
      .query(` SELECT id, firebase_uid, email, display_name, role, is_admin, created_at, updated_at FROM Users ORDER BY display_name ASC `);

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error("❌ GET /api/users error:", error);

    if (
      error.message === "Missing or invalid Authorization header" ||
      error.message === "Invalid token" ||
      error.message === "User not found in database"
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (error.message === "Forbidden") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch users." },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| POST - Create a user
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| The admin does NOT provide a Firebase UID.
| The user has not created their Firebase account yet.
| Therefore firebase_uid is deliberately stored as NULL.
|
*/
export async function POST(request) {
  try {
    await verifyAdmin(request);

    const body = await request.json();
    const {
      email,
      display_name,
      role,
      is_admin,
    } = body;

    /*
     * Validate required fields
     */
    if (!email || !display_name || !role) {
      return NextResponse.json(
        { error: "Email, display name and role are required." },
        { status: 400 }
      );
    }

    const pool = await getConnection();

    /*
     * Check whether email already exists
     */
    const existingUser = await pool
      .request()
      .input("email", sql.NVarChar(255), email.trim().toLowerCase())
      .query(` SELECT id, firebase_uid FROM Users WHERE email = @email `);

    if (existingUser.recordset.length > 0) {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 409 }
      );
    }

    /*
     * Create the database user.
     *
     * firebase_uid is intentionally NULL.
     *
     * The user will create their Firebase account later.
     */
    const result = await pool
      .request()
      .input("email", sql.NVarChar(255), email.trim().toLowerCase())
      .input("display_name", sql.NVarChar(255), display_name.trim())
      .input("role", sql.NVarChar(50), role)
      .input("is_admin", sql.Bit, Boolean(is_admin))
      .query(` INSERT INTO Users ( firebase_uid, email, display_name, role, is_admin, created_at, updated_at ) OUTPUT INSERTED.id, INSERTED.firebase_uid, INSERTED.email, INSERTED.display_name, INSERTED.role, INSERTED.is_admin, INSERTED.created_at, INSERTED.updated_at VALUES ( NULL, @email, @display_name, @role, @is_admin, GETDATE(), GETDATE() ) `);

    return NextResponse.json(
      result.recordset[0],
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ POST /api/users error:", error);

    if (
      error.message === "Missing or invalid Authorization header" ||
      error.message === "Invalid token" ||
      error.message === "User not found in database"
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (error.message === "Forbidden") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create user." },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| PUT - Update a user
|--------------------------------------------------------------------------
*/
export async function PUT(request) {
  try {
    await verifyAdmin(request);

    const body = await request.json();
    const {
      id,
      email,
      display_name,
      role,
      is_admin,
    } = body;

    /*
     * Validate ID
     */
    if (!id) {
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 }
      );
    }

    /*
     * Validate required fields
     */
    if (!email || !display_name || !role) {
      return NextResponse.json(
        { error: "Email, display name and role are required." },
        { status: 400 }
      );
    }

    const pool = await getConnection();

    /*
     * Check whether another user already uses
     * this email address.
     */
    const duplicateEmail = await pool
      .request()
      .input("email", sql.NVarChar(255), email.trim().toLowerCase())
      .input("id", sql.Int, Number(id))
      .query(` SELECT id FROM Users WHERE email = @email AND id <> @id `);

    if (duplicateEmail.recordset.length > 0) {
      return NextResponse.json(
        { error: "Another user already uses this email." },
        { status: 409 }
      );
    }

    /*
     * IMPORTANT:
     *
     * We do NOT allow the admin UI to manually change
     * firebase_uid.
     *
     * Once linked, firebase_uid belongs to the Firebase
     * identity established by the user.
     */
    const result = await pool
      .request()
      .input("id", sql.Int, Number(id))
      .input("email", sql.NVarChar(255), email.trim().toLowerCase())
      .input("display_name", sql.NVarChar(255), display_name.trim())
      .input("role", sql.NVarChar(50), role)
      .input("is_admin", sql.Bit, Boolean(is_admin))
      .query(` UPDATE Users SET email = @email, display_name = @display_name, role = @role, is_admin = @is_admin, updated_at = GETDATE() OUTPUT INSERTED.id, INSERTED.firebase_uid, INSERTED.email, INSERTED.display_name, INSERTED.role, INSERTED.is_admin, INSERTED.created_at, INSERTED.updated_at WHERE id = @id `);

    /*
     * User does not exist
     */
    if (result.recordset.length === 0) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(result.recordset[0]);
  } catch (error) {
    console.error("❌ PUT /api/users error:", error);

    if (
      error.message === "Missing or invalid Authorization header" ||
      error.message === "Invalid token" ||
      error.message === "User not found in database"
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (error.message === "Forbidden") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update user." },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| DELETE - Delete a user
|--------------------------------------------------------------------------
*/
export async function DELETE(request) {
  try {
    await verifyAdmin(request);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 }
      );
    }

    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", sql.Int, Number(id))
      .query(` DELETE FROM Users WHERE id = @id `);

    /*
     * User does not exist
     */
    if (result.rowsAffected[0] === 0) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("❌ DELETE /api/users error:", error);

    if (
      error.message === "Missing or invalid Authorization header" ||
      error.message === "Invalid token" ||
      error.message === "User not found in database"
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (error.message === "Forbidden") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete user." },
      { status: 500 }
    );
  }
}