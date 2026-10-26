import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getPostgresConnection } from "@/lib/db-postgres";

export const runtime = "nodejs";

// GET /api/staff/admin/calendar
// Optional filters: ?term=1 and/or ?grade=Grade%204
export async function GET(req) {
  try {
    await requireAdmin(req);

    const { searchParams } = new URL(req.url);
    const term = searchParams.get("term");
    const grade = searchParams.get("grade");

    const conditions = [];
    const values = [];

    if (term && term !== "All") {
      const termNumber = Number(term);

      if (![1, 2, 3, 4].includes(termNumber)) {
        return NextResponse.json(
          { error: "Invalid term" },
          { status: 400 }
        );
      }

      values.push(termNumber);
      conditions.push(`term = $${values.length}`);
    }

    if (grade && grade !== "All") {
      values.push(grade);
      conditions.push(`grade = $${values.length}`);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const pool = getPostgresConnection();

    const result = await pool.query(
      `
        SELECT
          id,
          term,
          grade,
          file_name,
          file_url,
          file_type,
          created_at,
          updated_at
        FROM "dbo"."TermCalendars"
        ${whereClause}
        ORDER BY term ASC, grade ASC
      `,
      values
    );

    return NextResponse.json({
      calendars: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error("GET admin calendar error:", error);

    return NextResponse.json(
      {
        error:
          error.statusCode && error.statusCode < 500
            ? error.message
            : "Failed to fetch calendars",
      },
      { status: error.statusCode || 500 }
    );
  }
}

// POST /api/staff/admin/calendar
// The file is uploaded separately through /api/upload.
export async function POST(req) {
  try {
    await requireAdmin(req);

    const body = await req.json();

    const { term, grade, file_name, file_url, file_type } = body;
    const termNumber = Number(term);
    const normalizedGrade =
      typeof grade === "string" ? grade.trim() : "";
    const normalizedFileName =
      typeof file_name === "string" ? file_name.trim() : "";
    const normalizedFileUrl =
      typeof file_url === "string" ? file_url.trim() : "";
    const normalizedFileType =
      typeof file_type === "string"
        ? file_type.toUpperCase()
        : "";

    if (![1, 2, 3, 4].includes(termNumber)) {
      return NextResponse.json(
        { error: "Term must be 1, 2, 3 or 4" },
        { status: 400 }
      );
    }

    if (!normalizedGrade) {
      return NextResponse.json(
        { error: "Grade is required" },
        { status: 400 }
      );
    }

    if (!normalizedFileName) {
      return NextResponse.json(
        { error: "File name is required" },
        { status: 400 }
      );
    }

    if (!normalizedFileUrl) {
      return NextResponse.json(
        { error: "File URL is required" },
        { status: 400 }
      );
    }

    if (!["PNG", "PDF"].includes(normalizedFileType)) {
      return NextResponse.json(
        { error: "Only PNG and PDF files are allowed" },
        { status: 400 }
      );
    }

    const pool = getPostgresConnection();

    const existing = await pool.query(
      `
        SELECT id
        FROM "dbo"."TermCalendars"
        WHERE term = $1 AND grade = $2
        LIMIT 1
      `,
      [termNumber, normalizedGrade]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        {
          error:
            "A calendar already exists for this term and grade. Please replace the existing calendar.",
        },
        { status: 409 }
      );
    }

    const result = await pool.query(
      `
        INSERT INTO "dbo"."TermCalendars" (
          term,
          grade,
          file_name,
          file_url,
          file_type,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING
          id,
          term,
          grade,
          file_name,
          file_url,
          file_type,
          created_at,
          updated_at
      `,
      [
        termNumber,
        normalizedGrade,
        normalizedFileName,
        normalizedFileUrl,
        normalizedFileType,
      ]
    );

    return NextResponse.json(
      {
        message: "Calendar uploaded successfully",
        calendar: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST admin calendar error:", error);

    if (error.code === "23505") {
      return NextResponse.json(
        {
          error:
            "A calendar already exists for this term and grade. Please replace the existing calendar.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error:
          error.statusCode && error.statusCode < 500
            ? error.message
            : "Failed to create calendar",
      },
      { status: error.statusCode || 500 }
    );
  }
}
