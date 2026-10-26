import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getPostgresConnection } from "@/lib/db-postgres";

export const runtime = "nodejs";


// GET /api/staff/admin/notices/[id]
export async function GET(req, { params }) {
  try {
    const user = await requireAdmin(req);

    const id = Number(params.id);

    if (!/^\d+$/.test(params.id) || !Number.isSafeInteger(id) || id < 1) {
      return NextResponse.json(
        { error: "Invalid notice ID" },
        { status: 400 }
      );
    }

    const pool = getPostgresConnection();

    const result = await pool.query(
      `
        SELECT
          id,
          title,
          category,
          content,
          recipients,
          status,
          scheduled_for,
          created_by_uid,
          created_at,
          updated_at
        FROM "dbo"."Notices"
        WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Notice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      notice: result.rows[0],
    });
  } catch (error) {
    console.error("GET notice error:", error);

    return NextResponse.json(
      { error: "Failed to fetch notice" },
      { status: 500 }
    );
  }
}


// PUT /api/staff/admin/notices/[id]
export async function PUT(req, { params }) {
  try {
    const user = await requireAdmin(req);

    const id = Number(params.id);

    if (!/^\d+$/.test(params.id) || !Number.isSafeInteger(id) || id < 1) {
      return NextResponse.json(
        { error: "Invalid notice ID" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const {
      title,
      category,
      content,
      recipients,
      status,
      scheduled_for,
    } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!category?.trim()) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    if (!recipients?.trim()) {
      return NextResponse.json(
        { error: "Recipients are required" },
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
        UPDATE "dbo"."Notices"
        SET
          title = $1,
          category = $2,
          content = $3,
          recipients = $4,
          status = $5,
          scheduled_for = $6,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING
          id,
          title,
          category,
          content,
          recipients,
          status,
          scheduled_for,
          created_by_uid,
          created_at,
          updated_at
      `,
      [
        title.trim(),
        category.trim(),
        content.trim(),
        recipients.trim(),
        status,
        scheduled_for ? new Date(scheduled_for) : null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Notice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Notice updated successfully",
      notice: result.rows[0],
    });
  } catch (error) {
    console.error("PUT notice error:", error);

    return NextResponse.json(
      { error: "Failed to update notice" },
      { status: 500 }
    );
  }
}


// DELETE /api/staff/admin/notices/[id]
export async function DELETE(req, { params }) {
  try {
    const user = await requireAdmin(req);

    const id = Number(params.id);

    if (!/^\d+$/.test(params.id) || !Number.isSafeInteger(id) || id < 1) {
      return NextResponse.json(
        { error: "Invalid notice ID" },
        { status: 400 }
      );
    }

    const pool = getPostgresConnection();

    const result = await pool.query(
      `
        DELETE FROM "dbo"."Notices"
        WHERE id = $1
        RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Notice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Notice deleted successfully",
    });
  } catch (error) {
    console.error("DELETE notice error:", error);

    return NextResponse.json(
      { error: "Failed to delete notice" },
      { status: 500 }
    );
  }
}