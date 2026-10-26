import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getPostgresConnection } from "@/lib/db-postgres";

export const runtime = "nodejs";

export async function GET(req) {
  try {
    await requireAdmin(req);

    const { searchParams } = new URL(req.url);

const status = searchParams.get("status");
const type = searchParams.get("type");
const grade = searchParams.get("grade");
const search = searchParams.get("search");

    const pool = getPostgresConnection();

    const result = await pool.query(`
      SELECT
        id,
        title,
        type,
        content,
        grade,
        status,
        scheduled_for,
        created_by_uid,
        created_at,
        updated_at
      FROM "dbo"."Notices"
      ORDER BY created_at DESC
    `);

    let notices = result.rows;

    if (status) {
      notices = notices.filter(
        (n) => n.status === status
      );
    }

    if (type) {
      notices = notices.filter(
        (n) => n.type === type
      );
    }

    if (grade) {
      notices = notices.filter(
        (n) => n.grade === grade
      );
    }

    if (search) {
      const term = search.toLowerCase();

      notices = notices.filter(
        (n) =>
          n.title?.toLowerCase().includes(term) ||
          n.content?.toLowerCase().includes(term)
      );
    }

    return NextResponse.json({
      notices,
      total: notices.length,
    });
  } catch (error) {
    console.error("GET admin notices error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch notices",
      },
      { status: 500 }
    );
  }
}

// POST /api/staff/admin/notices
export async function POST(req) {
  try {
    const user = await requireAdmin(req);

    const body = await req.json();

const {
  title,
  type,
  content,
  grade,
  status,
  scheduled_for,
} = body;

    // Basic validation
    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

if (!type?.trim())      
    {return NextResponse.json(
        { error: "Type is required" },
        { status: 400 }
      );
    }

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

if (!grade?.trim())      
    {
        return NextResponse.json(
        { error: "Grade is required" },
        { status: 400 }
      );
    }

    if (!["Published", "Scheduled", "Draft"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid notice status" },
        { status: 400 }
      );
    }

    if (status === "Scheduled" && !scheduled_for) {
      return NextResponse.json(
        { error: "Scheduled date and time are required" },
        { status: 400 }
      );
    }

    const pool = getPostgresConnection();

    const result = await pool.query(
      `
        INSERT INTO "dbo"."Notices" (
          title,
          type,
          content,
          grade,
          status,
          scheduled_for,
          created_by_uid,
          created_at,
          updated_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
        RETURNING
          id,
          title,
          type,
          content,
          grade,
          status,
          scheduled_for,
          created_by_uid,
          created_at,
          updated_at
      `,
      [
        title.trim(),
        type.trim(),
        content.trim(),
        grade.trim(),
        status,
        scheduled_for ? new Date(scheduled_for) : null,
        user.uid,
      ]
    );

    return NextResponse.json(
      {
        message: "Notice created successfully",
        notice: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST admin notice error:", error);

    return NextResponse.json(
      { error: "Failed to create notice" },
      { status: 500 }
    );
  }
}