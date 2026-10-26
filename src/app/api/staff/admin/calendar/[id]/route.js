import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { getPostgresConnection } from "@/lib/db-postgres";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

// DELETE calendar
export async function DELETE(req, { params }) {
  try {
    await requireAdmin(req);

    const { id } = await params;

    if (!id || !/^\d+$/.test(String(id)) || Number(id) <= 0) {
      return NextResponse.json(
        { error: "Invalid calendar ID." },
        { status: 400 }
      );
    }

    const pool = getPostgresConnection();

    const result = await pool.query(
      `
        SELECT id, file_url, file_name, file_type
        FROM "dbo"."TermCalendars"
        WHERE id = $1
      `,
      [Number(id)]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Calendar not found." },
        { status: 404 }
      );
    }

    const calendar = result.rows[0];

    await pool.query(
      `
        DELETE FROM "dbo"."TermCalendars"
        WHERE id = $1
      `,
      [Number(id)]
    );

    // Preserve the existing local-file cleanup behaviour.
    if (calendar.file_url) {
      try {
        const relativePath = calendar.file_url.replace(/^\/+/, "");
        const filePath = path.join(
          process.cwd(),
          "public",
          relativePath
        );

        await unlink(filePath);
        console.log("Calendar file deleted:", filePath);
      } catch (fileError) {
        console.warn(
          "Could not delete calendar file:",
          fileError.message
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Calendar deleted successfully.",
    });
  } catch (error) {
    console.error("Calendar DELETE error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to delete calendar." },
      { status: error.statusCode || 500 }
    );
  }
}

// UPDATE calendar
export async function PUT(req, { params }) {
  try {
    await requireAdmin(req);

    const { id } = await params;

    if (!id || !/^\d+$/.test(String(id)) || Number(id) <= 0) {
      return NextResponse.json(
        { error: "Invalid calendar ID." },
        { status: 400 }
      );
    }

    const body = await req.json();

    const {
      term,
      grade,
      file_name,
      file_url,
      file_type,
    } = body;

    if (
      !term ||
      !grade ||
      !file_name ||
      !file_url ||
      !file_type
    ) {
      return NextResponse.json(
        { error: "Missing required calendar information." },
        { status: 400 }
      );
    }

    if (![1, 2, 3, 4].includes(Number(term))) {
      return NextResponse.json(
        { error: "Invalid term." },
        { status: 400 }
      );
    }

    if (!["PNG", "PDF"].includes(file_type)) {
      return NextResponse.json(
        { error: "Invalid file type." },
        { status: 400 }
      );
    }

    const pool = getPostgresConnection();

    const result = await pool.query(
      `
        UPDATE "dbo"."TermCalendars"
        SET
          term = $1,
          grade = $2,
          file_name = $3,
          file_url = $4,
          file_type = $5,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
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
        Number(term),
        grade,
        file_name,
        file_url,
        file_type,
        Number(id),
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Calendar not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      calendar: result.rows[0],
    });
  } catch (error) {
    console.error("Calendar PUT error:", error);

    if (error.code === "23505") {
      return NextResponse.json(
        {
          error:
            "A calendar already exists for this term and grade.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to update calendar." },
      { status: error.statusCode || 500 }
    );
  }
}
