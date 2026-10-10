import { NextResponse } from "next/server";
import sql from "mssql";
import { getConnection } from "@/lib/db";

import { verifyUser } from "@/lib/auth";


/*
|--------------------------------------------------------------------------
| GET - Fetch the logged-in staff member's profile
|--------------------------------------------------------------------------
|
| The Firebase UID from the authenticated user is used to find
| the matching record in the Users table.
|
| This means a staff member can only retrieve their own profile.
|
|--------------------------------------------------------------------------
*/
export async function GET(request) {
    try {
        /*
         * Verify that the user is authenticated.
         */
        const user = await verifyUser(request);

        /*
         * Only staff members can access this endpoint.
         */
        if (user.role !== "staff") {
            return NextResponse.json(
                {
                    error: "Staff access required.",
                },
                { status: 403 }
            );
        }

        const pool = await getConnection();

        /*
         * Find the current user using their Firebase UID.
         */
        const result = await pool
            .request()
            .input(
                "firebase_uid",
                sql.NVarChar(128),
                user.uid
            )
            .query(`
                SELECT
                    id,
                    firebase_uid,
                    email,
                    display_name,
                    role,
                    is_admin,
                    profile_picture_url,
                    created_at,
                    updated_at
                FROM Users
                WHERE firebase_uid = @firebase_uid
            `);

        /*
         * User does not exist in the Users table.
         */
        if (result.recordset.length === 0) {
            return NextResponse.json(
                {
                    error: "User profile not found.",
                },
                { status: 404 }
            );
        }

        /*
         * Return the user's profile.
         */
        return NextResponse.json({
            user: result.recordset[0],
        });

    } catch (error) {
        console.error("❌ GET /api/profile error:", error);

        return NextResponse.json(
            {
                error: "Failed to fetch profile.",
                details: error.message,
            },
            { status: 500 }
        );
    }
}


/*
|--------------------------------------------------------------------------
| PUT - Update the logged-in staff member's profile
|--------------------------------------------------------------------------
|
| Staff members are only allowed to change:
|
|   - display_name
|   - profile_picture_url
|
| They CANNOT change:
|
|   - id
|   - firebase_uid
|   - email
|   - role
|   - is_admin
|   - created_at
|   - updated_at
|
| updated_at is automatically updated by the database.
|
|--------------------------------------------------------------------------
*/
export async function PUT(request) {
    try {
        /*
         * Verify that the user is authenticated.
         */
        const user = await verifyUser(request);

        /*
         * Only staff members can update their profile.
         */
        if (user.role !== "staff") {
            return NextResponse.json(
                {
                    error: "Staff access required.",
                },
                { status: 403 }
            );
        }

        /*
         * Read the request body.
         */
        const body = await request.json();

        const {
            display_name,
            profile_picture_url,
        } = body;

        /*
         * Validate display name.
         */
        if (
            !display_name ||
            typeof display_name !== "string" ||
            !display_name.trim()
        ) {
            return NextResponse.json(
                {
                    error: "Display name is required.",
                },
                { status: 400 }
            );
        }

        const pool = await getConnection();

        /*
         * Update ONLY the editable profile fields.
         *
         * Notice that role and is_admin are NOT included.
         */
        const result = await pool
            .request()
            .input(
                "firebase_uid",
                sql.NVarChar(128),
                user.uid
            )
            .input(
                "display_name",
                sql.NVarChar(255),
                display_name.trim()
            )
            .input(
                "profile_picture_url",
                sql.NVarChar(500),
                profile_picture_url &&
                typeof profile_picture_url === "string"
                    ? profile_picture_url.trim()
                    : null
            )
            .query(`
                UPDATE Users

                SET
                    display_name = @display_name,
                    profile_picture_url = @profile_picture_url,
                    updated_at = GETDATE()

                OUTPUT
                    INSERTED.id,
                    INSERTED.firebase_uid,
                    INSERTED.email,
                    INSERTED.display_name,
                    INSERTED.role,
                    INSERTED.is_admin,
                    INSERTED.profile_picture_url,
                    INSERTED.created_at,
                    INSERTED.updated_at

                WHERE firebase_uid = @firebase_uid
            `);

        /*
         * User does not exist.
         */
        if (result.recordset.length === 0) {
            return NextResponse.json(
                {
                    error: "User profile not found.",
                },
                { status: 404 }
            );
        }

        /*
         * Return the updated profile.
         */
        return NextResponse.json({
            message: "Profile updated successfully.",
            user: result.recordset[0],
        });

    } catch (error) {
        console.error("❌ PUT /api/profile error:", error);

        return NextResponse.json(
            {
                error: "Failed to update profile.",
                details: error.message,
            },
            { status: 500 }
        );
    }
}