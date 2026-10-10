import { NextResponse } from "next/server";
import sql from "mssql";
import { getConnection } from "@/lib/db";
import { verifyUser } from "@/lib/auth";

export const runtime = "nodejs";

// ==========================================================
// GET - Parent Calendar
// ==========================================================

export async function GET(req) {
  try {
    // ------------------------------------------------------
    // Verify logged-in parent
    // ------------------------------------------------------

    await verifyUser(req);

    const pool = await getConnection();

    // ------------------------------------------------------
    // Get all calendars
    // ------------------------------------------------------

    const result = await pool.request().query(`
      SELECT
        id,
        term,
        grade,
        file_name,
        file_url,
        file_type,
        created_at,
        updated_at
      FROM dbo.TermCalendars
      ORDER BY
        term ASC,
        CASE
          WHEN grade = 'All Grades' THEN 0
          ELSE 1
        END,
        grade ASC
    `);

    return NextResponse.json({
      success: true,
      calendars: result.recordset,
    });
  } catch (error) {
    console.error("Parent calendar GET error:", error);

    if (
      error.message?.toLowerCase().includes("unauthorized") ||
      error.message?.toLowerCase().includes("authentication")
    ) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error:
          error.message ||
          "Failed to load calendars.",
      },
      { status: 500 }
    );
  }
}