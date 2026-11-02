import { NextResponse } from "next/server";
import { getPostgresConnection } from "@/lib/db-postgres";
import { verifyUser } from "@/lib/auth";

// GET the logged-in staff member's profile
export async function GET(request) {
  try {
    const user = await verifyUser(request);

    // Only staff members can access this endpoint.
    if (user.role !== "staff") {
      return NextResponse.json(
        { error: "Staff access required." },
        { status: 403 }
      );
    }

    const pool = getPostgresConnection();

    // Find the profile associated with the authenticated Firebase UID.
    const result = await pool.query(
      `
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
        FROM "dbo"."Users"
        WHERE firebase_uid = $1
      `,
      [user.uid]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "User profile not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Staff profile GET error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to retrieve staff profile." },
      { status: error.statusCode || 500 }
    );
  }
}
