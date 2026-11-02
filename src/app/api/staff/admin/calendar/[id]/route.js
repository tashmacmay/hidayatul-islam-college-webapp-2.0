import { NextResponse } from "next/server";
import {
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getPostgresConnection } from "@/lib/db-postgres";
import { requireAdmin } from "@/lib/auth";
import { getS3Client, STORAGE_BUCKET } from "@/lib/object-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const isCalendarObjectKey = (value) =>
  typeof value === "string" &&
  /^calendar\/[a-f0-9-]+\.(?:pdf|png)$/i.test(value);

async function deleteStoredCalendar(fileUrl) {
  // Never send legacy local paths or arbitrary values to Object Storage.
  if (!isCalendarObjectKey(fileUrl)) {
    return;
  }

  await getS3Client().send(
    new DeleteObjectCommand({
      Bucket: STORAGE_BUCKET,
      Key: fileUrl,
    })
  );
}

function validateId(id) {
  return Boolean(
    id &&
      /^\d+$/.test(String(id)) &&
      Number.isSafeInteger(Number(id)) &&
      Number(id) > 0
  );
}

// DELETE calendar
export async function DELETE(req, { params }) {
  try {
    await requireAdmin(req);

    const { id } = await params;

    if (!validateId(id)) {
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

    // The database row is deleted. Clean up the private object if applicable.
    try {
      await deleteStoredCalendar(calendar.file_url);
    } catch (storageError) {
      console.error(
        "Calendar row deleted, but Object Storage cleanup failed:",
        storageError
      );
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

    if (!validateId(id)) {
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

    // New uploads must use a valid private Object Storage key.
    if (!isCalendarObjectKey(file_url)) {
      return NextResponse.json(
        { error: "Invalid calendar storage key. Please upload the file again." },
        { status: 400 }
      );
    }

    const pool = getPostgresConnection();

    // Read the existing key so we can clean it up after a successful update.
    const existingResult = await pool.query(
      `
        SELECT id, file_url
        FROM "dbo"."TermCalendars"
        WHERE id = $1
      `,
      [Number(id)]
    );

    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Calendar not found." },
        { status: 404 }
      );
    }

    const oldFileUrl = existingResult.rows[0].file_url;

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

    // Only remove the old object after the database update succeeds.
    if (
      oldFileUrl &&
      oldFileUrl !== file_url &&
      isCalendarObjectKey(oldFileUrl)
    ) {
      try {
        await deleteStoredCalendar(oldFileUrl);
      } catch (storageError) {
        console.error(
          "Calendar updated, but previous Object Storage cleanup failed:",
          storageError
        );
      }
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