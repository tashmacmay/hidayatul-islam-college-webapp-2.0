import { NextResponse } from "next/server";
import sql from "mssql";
import { requireAdmin } from "@/lib/auth";
import { getConnection } from "@/lib/db";

export const runtime = "nodejs";


// GET /api/staff/admin/notices/[id]
export async function GET(req, { params }) {
  try {
    const user = await requireAdmin(req);

    const id = Number(params.id);

    if (!Number.isInteger(id)) {
      return NextResponse.json(
        { error: "Invalid notice ID" },
        { status: 400 }
      );
    }

    const pool = await getConnection();

    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query(`
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
        FROM dbo.Notices
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json(
        { error: "Notice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      notice: result.recordset[0],
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

    if (!Number.isInteger(id)) {
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

    const pool = await getConnection();

    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("title", sql.NVarChar(255), title.trim())
      .input("category", sql.NVarChar(50), category.trim())
      .input("content", sql.NVarChar(sql.MAX), content.trim())
      .input("recipients", sql.NVarChar(100), recipients.trim())
      .input("status", sql.NVarChar(20), status)
      .input(
        "scheduled_for",
        sql.DateTime,
        scheduled_for ? new Date(scheduled_for) : null
      )
      .query(`
        UPDATE dbo.Notices
        SET
          title = @title,
          category = @category,
          content = @content,
          recipients = @recipients,
          status = @status,
          scheduled_for = @scheduled_for,
          updated_at = GETDATE()
        OUTPUT
          INSERTED.id,
          INSERTED.title,
          INSERTED.category,
          INSERTED.content,
          INSERTED.recipients,
          INSERTED.status,
          INSERTED.scheduled_for,
          INSERTED.created_by_uid,
          INSERTED.created_at,
          INSERTED.updated_at
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json(
        { error: "Notice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Notice updated successfully",
      notice: result.recordset[0],
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

    if (!Number.isInteger(id)) {
      return NextResponse.json(
        { error: "Invalid notice ID" },
        { status: 400 }
      );
    }

    const pool = await getConnection();

    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query(`
        DELETE FROM dbo.Notices
        OUTPUT
          DELETED.id
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
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