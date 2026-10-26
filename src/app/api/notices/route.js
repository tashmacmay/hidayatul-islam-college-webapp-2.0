// app/api/notices/route.js

import { NextResponse } from "next/server";
import { getPostgresConnection } from "@/lib/db-postgres";
import { verifyUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req) {
  console.log("🔍 GET /api/notices called");

  try {
    // ---------------------------------------------------------
    // Verify logged-in user
    // ---------------------------------------------------------

    const user = await verifyUser(req);

    console.log("✅ User verified:", {
      uid: user.uid,
      role: user.role,
    });

    // ---------------------------------------------------------
    // Read filters
    // ---------------------------------------------------------

    const url = new URL(req.url);

    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");
    const grade = url.searchParams.get("grade");

    console.log("🔍 Filters:", {
      status,
      search,
      grade,
    });

    // ---------------------------------------------------------
    // Connect to database
    // ---------------------------------------------------------

    const pool = getPostgresConnection();

    // ---------------------------------------------------------
    // Build GET query
    // ---------------------------------------------------------

    let query = `
      SELECT
        id,
        title,
        type,
        content,
        grade,
        status,
        scheduled_for,
        created_at,
        updated_at
      FROM "dbo"."Notices"
      WHERE status = 'Published'
    `;

    const values = [];

    // ---------------------------------------------------------
    // Status filter
    //
    // Normal users should only see Published notices.
    //
    // If the API is explicitly asked for another status,
    // allow it for future flexibility.
    // ---------------------------------------------------------

    if (status && status !== "All") {
      values.push(status);
      query += ` AND status = $${values.length}`;
    }

    // ---------------------------------------------------------
    // Grade filter
    // ---------------------------------------------------------

    if (grade && grade !== "All") {
      values.push(grade);
      query += `
        AND (
          grade = $${values.length}
          OR grade = 'All Grades'
        )
      `;
    }

    // ---------------------------------------------------------
    // Search
    // ---------------------------------------------------------

    if (search?.trim()) {
      values.push(`%${search.trim()}%`);
      query += `
        AND (
          title ILIKE $${values.length}
          OR content ILIKE $${values.length}
          OR type ILIKE $${values.length}
          OR grade ILIKE $${values.length}
        )
      `;
    }

    // ---------------------------------------------------------
    // Sort newest first
    // ---------------------------------------------------------

    query += `
      ORDER BY created_at DESC
    `;

    // ---------------------------------------------------------
    // Execute query
    // ---------------------------------------------------------

    const result = await pool.query(query, values);

    console.log(
      `✅ Found ${result.rows.length} published notices`
    );

    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("❌ GET /api/notices error:", err);

    if (
      err.message === "User not found in database" ||
      err.message === "Invalid token" ||
      err.message ===
        "Missing or invalid Authorization header"
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}