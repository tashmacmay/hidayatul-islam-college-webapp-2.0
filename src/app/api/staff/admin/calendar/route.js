import { NextResponse } from "next/server";
import sql from "mssql";
import { requireAdmin } from "@/lib/auth";
import { getConnection } from "@/lib/db";

export const runtime = "nodejs";

// ============================================================
// GET /api/staff/admin/calendar
//
// Optional filters:
// ?term=1
// ?grade=Grade 4
// ?term=1&grade=Grade 4
// ============================================================

export async function GET(req) {
  try {
    await requireAdmin(req);

    const { searchParams } = new URL(req.url);

    const term = searchParams.get("term");
    const grade = searchParams.get("grade");

    const pool = await getConnection();

    let query = `
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
      WHERE 1 = 1
    `;

    const request = pool.request();

    // ---------------------------------------------------------
    // Term filter
    // ---------------------------------------------------------

    if (term && term !== "All") {
      const termNumber = Number(term);

      if (![1, 2, 3, 4].includes(termNumber)) {
        return NextResponse.json(
          { error: "Invalid term" },
          { status: 400 }
        );
      }

      query += ` AND term = @term`;

      request.input("term", sql.Int, termNumber);
    }

    // ---------------------------------------------------------
    // Grade filter
    // ---------------------------------------------------------

    if (grade && grade !== "All") {
      query += ` AND grade = @grade`;

      request.input(
        "grade",
        sql.NVarChar(50),
        grade
      );
    }

    // ---------------------------------------------------------
    // Sort
    // ---------------------------------------------------------

    query += `
      ORDER BY
        term ASC,
        grade ASC
    `;

    const result = await request.query(query);

    return NextResponse.json({
      calendars: result.recordset,
      total: result.recordset.length,
    });
  } catch (error) {
    console.error("GET admin calendar error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch calendars",
      },
      { status: 500 }
    );
  }
}

// ============================================================
// POST /api/staff/admin/calendar
//
// Creates a calendar record after the file has already been
// uploaded using the generic /api/upload route.
// ============================================================

export async function POST(req) {
  try {
    const user = await requireAdmin(req);

    const body = await req.json();

    const {
      term,
      grade,
      file_name,
      file_url,
      file_type,
    } = body;

    // ---------------------------------------------------------
    // Basic validation
    // ---------------------------------------------------------

    const termNumber = Number(term);

    if (![1, 2, 3, 4].includes(termNumber)) {
      return NextResponse.json(
        {
          error: "Term must be 1, 2, 3 or 4",
        },
        { status: 400 }
      );
    }

    if (!grade?.trim()) {
      return NextResponse.json(
        {
          error: "Grade is required",
        },
        { status: 400 }
      );
    }

    if (!file_name?.trim()) {
      return NextResponse.json(
        {
          error: "File name is required",
        },
        { status: 400 }
      );
    }

    if (!file_url?.trim()) {
      return NextResponse.json(
        {
          error: "File URL is required",
        },
        { status: 400 }
      );
    }

    const normalisedFileType =
      file_type?.toUpperCase();

    if (!["PNG", "PDF"].includes(normalisedFileType)) {
      return NextResponse.json(
        {
          error: "Only PNG and PDF files are allowed",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------
    // Connect to database
    // ---------------------------------------------------------

    const pool = await getConnection();

    // ---------------------------------------------------------
    // Check whether this term + grade already exists
    // ---------------------------------------------------------

    const existing = await pool
      .request()
      .input("term", sql.Int, termNumber)
      .input(
        "grade",
        sql.NVarChar(50),
        grade.trim()
      )
      .query(`
        SELECT id
        FROM dbo.TermCalendars
        WHERE term = @term
          AND grade = @grade
      `);

    if (existing.recordset.length > 0) {
      return NextResponse.json(
        {
          error:
            "A calendar already exists for this term and grade. Please replace the existing calendar.",
        },
        { status: 409 }
      );
    }

    // ---------------------------------------------------------
    // Insert calendar
    // ---------------------------------------------------------

    const result = await pool
      .request()
      .input("term", sql.Int, termNumber)
      .input(
        "grade",
        sql.NVarChar(50),
        grade.trim()
      )
      .input(
        "file_name",
        sql.NVarChar(255),
        file_name.trim()
      )
      .input(
        "file_url",
        sql.NVarChar(500),
        file_url.trim()
      )
      .input(
        "file_type",
        sql.NVarChar(20),
        normalisedFileType
      )
      .query(`
        INSERT INTO dbo.TermCalendars (
          term,
          grade,
          file_name,
          file_url,
          file_type,
          created_at,
          updated_at
        )
        OUTPUT
          INSERTED.id,
          INSERTED.term,
          INSERTED.grade,
          INSERTED.file_name,
          INSERTED.file_url,
          INSERTED.file_type,
          INSERTED.created_at,
          INSERTED.updated_at
        VALUES (
          @term,
          @grade,
          @file_name,
          @file_url,
          @file_type,
          GETDATE(),
          GETDATE()
        )
      `);

    return NextResponse.json(
      {
        message: "Calendar uploaded successfully",
        calendar: result.recordset[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST admin calendar error:", error);

    return NextResponse.json(
      {
        error: "Failed to create calendar",
      },
      { status: 500 }
    );
  }
}