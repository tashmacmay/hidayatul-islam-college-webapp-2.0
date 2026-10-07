import { NextResponse } from "next/server";
import sql from "mssql";
import { getConnection } from "@/lib/db";

/*
|--------------------------------------------------------------------------
| GET - Fetch all users
|--------------------------------------------------------------------------
*/
export async function GET() {
    try {
        const pool = await getConnection();

        const result = await pool.request().query(`
            SELECT
                id,
                firebase_uid,
                email,
                display_name,
                role,
                is_admin,
                created_at,
                updated_at
            FROM Users
            ORDER BY display_name ASC
        `);

        return NextResponse.json(result.recordset);

    } catch (error) {
        console.error("❌ GET /api/users error:", error);

        return NextResponse.json(
            {
                error: "Failed to fetch users.",
                details: error.message,
            },
            { status: 500 }
        );
    }
}


/*
|--------------------------------------------------------------------------
| POST - Create a user
|--------------------------------------------------------------------------
*/
export async function POST(request) {
    try {
        const body = await request.json();

        const {
            firebase_uid,
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
                {
                    error:
                        "Email, display name and role are required.",
                },
                { status: 400 }
            );
        }

        const pool = await getConnection();

        /*
         * Check whether email already exists
         */
        const existingUser = await pool
            .request()
            .input("email", sql.NVarChar(255), email)
            .query(`
                SELECT id
                FROM Users
                WHERE email = @email
            `);

        if (existingUser.recordset.length > 0) {
            return NextResponse.json(
                {
                    error: "A user with this email already exists.",
                },
                { status: 409 }
            );
        }

        /*
         * Insert new user
         */
        const result = await pool
            .request()
            .input(
                "firebase_uid",
                sql.NVarChar(255),
                firebase_uid || null
            )
            .input(
                "email",
                sql.NVarChar(255),
                email
            )
            .input(
                "display_name",
                sql.NVarChar(255),
                display_name
            )
            .input(
                "role",
                sql.NVarChar(50),
                role
            )
            .input(
                "is_admin",
                sql.Bit,
                Boolean(is_admin)
            )
            .query(`
                INSERT INTO Users (
                    firebase_uid,
                    email,
                    display_name,
                    role,
                    is_admin,
                    created_at,
                    updated_at
                )

                OUTPUT
                    INSERTED.id,
                    INSERTED.firebase_uid,
                    INSERTED.email,
                    INSERTED.display_name,
                    INSERTED.role,
                    INSERTED.is_admin,
                    INSERTED.created_at,
                    INSERTED.updated_at

                VALUES (
                    @firebase_uid,
                    @email,
                    @display_name,
                    @role,
                    @is_admin,
                    GETDATE(),
                    GETDATE()
                )
            `);

        return NextResponse.json(
            result.recordset[0],
            { status: 201 }
        );

    } catch (error) {
        console.error("❌ POST /api/users error:", error);

        return NextResponse.json(
            {
                error: "Failed to create user.",
                details: error.message,
            },
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
        const body = await request.json();

        const {
            id,
            firebase_uid,
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
                {
                    error: "User ID is required.",
                },
                { status: 400 }
            );
        }

        /*
         * Validate required fields
         */
        if (!email || !display_name || !role) {
            return NextResponse.json(
                {
                    error:
                        "Email, display name and role are required.",
                },
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
            .input(
                "email",
                sql.NVarChar(255),
                email
            )
            .input(
                "id",
                sql.Int,
                Number(id)
            )
            .query(`
                SELECT id
                FROM Users
                WHERE email = @email
                AND id <> @id
            `);

        if (duplicateEmail.recordset.length > 0) {
            return NextResponse.json(
                {
                    error:
                        "Another user already uses this email.",
                },
                { status: 409 }
            );
        }

        /*
         * Update user
         */
        const result = await pool
            .request()
            .input(
                "id",
                sql.Int,
                Number(id)
            )
            .input(
                "firebase_uid",
                sql.NVarChar(255),
                firebase_uid || null
            )
            .input(
                "email",
                sql.NVarChar(255),
                email
            )
            .input(
                "display_name",
                sql.NVarChar(255),
                display_name
            )
            .input(
                "role",
                sql.NVarChar(50),
                role
            )
            .input(
                "is_admin",
                sql.Bit,
                Boolean(is_admin)
            )
            .query(`
                UPDATE Users

                SET
                    firebase_uid = @firebase_uid,
                    email = @email,
                    display_name = @display_name,
                    role = @role,
                    is_admin = @is_admin,
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

        /*
         * User does not exist
         */
        if (result.recordset.length === 0) {
            return NextResponse.json(
                {
                    error: "User not found.",
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            result.recordset[0]
        );

    } catch (error) {
        console.error("❌ PUT /api/users error:", error);

        return NextResponse.json(
            {
                error: "Failed to update user.",
                details: error.message,
            },
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
        const { searchParams } =
            new URL(request.url);

        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                {
                    error: "User ID is required.",
                },
                { status: 400 }
            );
        }

        const pool = await getConnection();

        const result = await pool
            .request()
            .input(
                "id",
                sql.Int,
                Number(id)
            )
            .query(`
                DELETE FROM Users
                WHERE id = @id
            `);

        /*
         * User does not exist
         */
        if (result.rowsAffected[0] === 0) {
            return NextResponse.json(
                {
                    error: "User not found.",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "User deleted successfully.",
        });

    } catch (error) {
        console.error("❌ DELETE /api/users error:", error);

        return NextResponse.json(
            {
                error: "Failed to delete user.",
                details: error.message,
            },
            { status: 500 }
        );
    }
}