import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getPostgresConnection } from "@/lib/db-postgres";

export const runtime = "nodejs";

// Validate the notice ID used by GET, PUT, and DELETE.
function getValidNoticeId(rawId) {
  if (!/^\d+$/.test(String(rawId))) {
    return null;
  }

  const id = Number(rawId);

  if (!Number.isSafeInteger(id) || id < 1) {
    return null;
  }

  return id;
}

// GET /api/staff/admin/notices/[id]
export async function GET(req, { params }) {
  try {
    await requireAdmin(req);

    const id = getValidNoticeId(params.id);

    if (id === null) {
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
          type,
          content,
          grade,
          status,
          TO_CHAR(
            scheduled_for,
            'YYYY-MM-DD HH24:MI:SS'
          ) AS scheduled_for,
          published_at,
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
    await requireAdmin(req);

    const id = getValidNoticeId(params.id);

    if (id === null) {
      return NextResponse.json(
        { error: "Invalid notice ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { title, type, content, grade, action } = body;

    // Validate the required fields.
    if (
      typeof title !== "string" ||
      !title.trim()
    ) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (
      typeof type !== "string" ||
      !type.trim()
    ) {
      return NextResponse.json(
        { error: "Type is required" },
        { status: 400 }
      );
    }

    if (
      typeof content !== "string" ||
      !content.trim()
    ) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    if (
      typeof grade !== "string" ||
      !grade.trim()
    ) {
      return NextResponse.json(
        { error: "Grade is required" },
        { status: 400 }
      );
    }

    // "save" preserves the existing publication status and timestamp.
    // "publish" publishes or republishes the notice.
    // "draft" converts the notice back to a draft.
    if (!["save", "publish", "draft"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid notice action" },
        { status: 400 }
      );
    }

    const updatedStatus =
      action === "publish"
        ? "Published"
        : action === "draft"
          ? "Draft"
          : null;

    const pool = getPostgresConnection();

    const result = await pool.query(
      `
        UPDATE "dbo"."Notices"
        SET
          title = $1,
          type = $2,
          content = $3,
          grade = $4,

          status = CASE
            WHEN $5 = 'save' THEN status
            ELSE $6
          END,

          published_at = CASE
            WHEN $5 = 'publish'
              THEN CURRENT_TIMESTAMP
            WHEN $5 = 'draft'
              THEN NULL
            ELSE published_at
          END,

          updated_at = CURRENT_TIMESTAMP

        WHERE id = $7

        RETURNING
          id,
          title,
          type,
          content,
          grade,
          status,
          scheduled_for,
          published_at,
          created_by_uid,
          created_at,
          updated_at
      `,
      [
        title.trim(),
        type.trim(),
        content.trim(),
        grade.trim(),
        action,
        updatedStatus,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Notice not found" },
        { status: 404 }
      );
    }

    const message =
      action === "publish"
        ? "Notice published successfully"
        : action === "draft"
          ? "Notice converted to draft successfully"
          : "Notice changes saved successfully";

    return NextResponse.json({
      message,
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
    await requireAdmin(req);

    const id = getValidNoticeId(params.id);

    if (id === null) {
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
