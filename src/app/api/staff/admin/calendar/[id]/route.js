import { NextResponse } from "next/server";
import sql from "mssql";
import { unlink } from "fs/promises";
import path from "path";
import { getConnection } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

// ==========================================================
// DELETE
// ==========================================================

export async function DELETE(req, { params }) {
  try {
    await requireAdmin(req);

    const { id } = await params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: "Invalid calendar ID." },
        { status: 400 }
      );
    }

    const pool = await getConnection();

    // ------------------------------------------------------
    // Get calendar record first
    // ------------------------------------------------------

    const result = await pool
      .request()
      .input("id", sql.Int, Number(id))
      .query(`
        SELECT
          id,
          file_url,
          file_name,
          file_type
        FROM dbo.TermCalendars
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json(
        { error: "Calendar not found." },
        { status: 404 }
      );
    }

    const calendar = result.recordset[0];

    // ------------------------------------------------------
    // Delete database record
    // ------------------------------------------------------

    await pool
      .request()
      .input("id", sql.Int, Number(id))
      .query(`
        DELETE FROM dbo.TermCalendars
        WHERE id = @id
      `);

    // ------------------------------------------------------
    // Delete physical file
    // ------------------------------------------------------

    if (calendar.file_url) {
      try {
        const relativePath = calendar.file_url.replace(
          /^\/+/,
          ""
        );

        const filePath = path.join(
          process.cwd(),
          "public",
          relativePath
        );

        await unlink(filePath);

        console.log(
          "Calendar file deleted:",
          filePath
        );
      } catch (fileError) {
        // The database record has already been deleted.
        // If the physical file is missing, don't fail
        // the whole delete operation.
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
    console.error(
      "Calendar DELETE error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error.message ||
          "Failed to delete calendar.",
      },
      { status: 500 }
    );
  }
}

// ==========================================================
// PUT
// ==========================================================

export async function PUT(req, { params }) {
  try {
    await requireAdmin(req);

    const { id } = await params;

    if (!id || isNaN(Number(id))) {
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

    const pool = await getConnection();

    const result = await pool
      .request()
      .input("id", sql.Int, Number(id))
      .input("term", sql.Int, Number(term))
      .input("grade", sql.NVarChar(50), grade)
      .input("file_name", sql.NVarChar(255), file_name)
      .input("file_url", sql.NVarChar(500), file_url)
      .input("file_type", sql.NVarChar(20), file_type)
      .query(`
        UPDATE dbo.TermCalendars
        SET
          term = @term,
          grade = @grade,
          file_name = @file_name,
          file_url = @file_url,
          file_type = @file_type,
          updated_at = GETDATE()
        OUTPUT
          INSERTED.id,
          INSERTED.term,
          INSERTED.grade,
          INSERTED.file_name,
          INSERTED.file_url,
          INSERTED.file_type,
          INSERTED.created_at,
          INSERTED.updated_at
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json(
        { error: "Calendar not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      calendar: result.recordset[0],
    });
  } catch (error) {
    console.error(
      "Calendar PUT error:",
      error
    );

    // Handle duplicate term + grade
    if (error.number === 2627 || error.number === 2601) {
      return NextResponse.json(
        {
          error:
            "A calendar already exists for this term and grade.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error:
          error.message ||
          "Failed to update calendar.",
      },
      { status: 500 }
    );
  }
}