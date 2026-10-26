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

    let query = `
      SELECT
        id,
        title,
        type,
        content,
        grade,
        status,
        TO_CHAR(scheduled_for, 'YYYY-MM-DD HH24:MI:SS') AS scheduled_for,
        created_by_uid,
        created_at,
        updated_at
      FROM "dbo"."Notices"
      WHERE 1 = 1
    `;

    const values = [];

    if (status && status !== "All") {
      values.push(status);
      query += ` AND status = $${values.length}`;
    }

    if (type && type !== "All") {
      values.push(type);
      query += ` AND type = $${values.length}`;
    }

    if (grade && grade !== "All") {
      values.push(grade);
      query += ` AND grade = $${values.length}`;
    }

    if (search) {
      values.push(`%${search}%`);
      const searchParameter = `$${values.length}`;

      query += ` AND (
        title ILIKE ${searchParameter}
        OR content ILIKE ${searchParameter}
        OR type ILIKE ${searchParameter}
      )`;
    }

    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, values);

    return NextResponse.json({
      notices: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error("GET admin notices error:", error);

    return NextResponse.json(
      { error: "Failed to fetch notices" },
      { status: 500 }
    );
  }
}

// POST /api/staff/admin/notices
export async function POST(req) {
  try {
    const user = await requireAdmin(req);
    const body = await req.json();

    const { title, type, content, grade, action } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!type?.trim()) {
      return NextResponse.json(
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

    if (!grade?.trim()) {
      return NextResponse.json(
        { error: "Grade is required" },
        { status: 400 }
      );
    }

    if (!["publish", "draft"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid notice action" },
        { status: 400 }
      );
    }

    const createdStatus = action === "publish" ? "Published" : "Draft";
    const pool = getPostgresConnection();

    const result = await pool.query(
      `
        INSERT INTO "dbo"."Notices" (
          title,
          type,
          content,
          grade,
          status,
          created_by_uid,
          created_at,
          updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6,
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
        createdStatus,
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
