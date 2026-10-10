import { NextResponse } from "next/server";
import sql from "mssql";
import { requireAdmin } from "@/lib/auth";
import { getConnection } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req) {
  try {
    await requireAdmin(req);

    const { searchParams } = new URL(req.url);

const status = searchParams.get("status");
const type = searchParams.get("type");
const grade = searchParams.get("grade");
const search = searchParams.get("search");

    const pool = await getConnection();

    const result = await pool.request().query(`
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
      FROM dbo.Notices
      ORDER BY created_at DESC
    `);

    let notices = result.recordset;

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

    const pool = await getConnection();

    const result = await pool
      .request()
      .input("title", sql.NVarChar(255), title.trim())
      .input("type", sql.NVarChar(50), type.trim())
      .input("content", sql.NVarChar(sql.MAX), content.trim())
      .input("grade", sql.NVarChar(100), grade.trim())
      .input("status", sql.NVarChar(20), status)
      .input(   
        "scheduled_for",
        sql.DateTime,
        scheduled_for ? new Date(scheduled_for) : null
      )
      .input("created_by_uid", sql.NVarChar(128), user.uid)
      .query(`
        INSERT INTO dbo.Notices (
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
        OUTPUT
          INSERTED.id,
          INSERTED.title,
          INSERTED.type,
          INSERTED.content,
          INSERTED.grade,
          INSERTED.status,
          INSERTED.scheduled_for,
          INSERTED.created_by_uid,
          INSERTED.created_at,
          INSERTED.updated_at
        VALUES (
          @title,
          @type,
          @content,
          @grade,
          @status,
          @scheduled_for,
          @created_by_uid,
          GETDATE(),
          GETDATE()
        )
      `);

    return NextResponse.json(
      {
        message: "Notice created successfully",
        notice: result.recordset[0],
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