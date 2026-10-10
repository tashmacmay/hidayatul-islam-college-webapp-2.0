// app/api/notices/route.js

import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import { verifyUser } from "@/lib/auth";
import sql from "mssql";

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

    const pool = await getConnection();

    // ---------------------------------------------------------
    // Publish scheduled notices whose time has arrived
    //
    // Example:
    //
    // status = Scheduled
    // scheduled_for = 2026-10-08 10:20
    //
    // Current time = 2026-10-08 10:26
    //
    // The notice becomes Published.
    // ---------------------------------------------------------

    await pool.request().query(`
      UPDATE dbo.Notices
      SET
        status = 'Published',
        updated_at = GETDATE()
      WHERE
        status = 'Scheduled'
        AND scheduled_for IS NOT NULL
        AND scheduled_for <= GETDATE()
    `);

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
      FROM dbo.Notices
      WHERE status = 'Published'
    `;

    const request = pool.request();

    // ---------------------------------------------------------
    // Status filter
    //
    // Normal users should only see Published notices.
    //
    // If the API is explicitly asked for another status,
    // allow it for future flexibility.
    // ---------------------------------------------------------

    if (status && status !== "All") {
      query += ` AND status = @status`;

      request.input(
        "status",
        sql.NVarChar(20),
        status
      );
    }

    // ---------------------------------------------------------
    // Grade filter
    // ---------------------------------------------------------

    if (grade && grade !== "All") {
      query += `
        AND (
          grade = @grade
          OR grade = 'All Grades'
        )
      `;

      request.input(
        "grade",
        sql.NVarChar(50),
        grade
      );
    }

    // ---------------------------------------------------------
    // Search
    // ---------------------------------------------------------

    if (search?.trim()) {
      query += `
        AND (
          title LIKE @search
          OR content LIKE @search
          OR type LIKE @search
          OR grade LIKE @search
        )
      `;

      request.input(
        "search",
        sql.NVarChar(255),
        `%${search.trim()}%`
      );
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

    const result = await request.query(query);

    console.log(
      `✅ Found ${result.recordset.length} published notices`
    );

    return NextResponse.json(result.recordset);
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