import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getPostgresConnection } from "@/lib/db-postgres";
import { verifyUser } from "@/lib/auth";
import { getS3Client, STORAGE_BUCKET } from "@/lib/object-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const isCalendarObjectKey = (value) =>
  typeof value === "string" &&
  /^calendar\/[a-f0-9-]+\.(?:pdf|png)$/i.test(value);

async function addPreviewUrl(calendar) {
  if (!isCalendarObjectKey(calendar.file_url)) {
    return {
      ...calendar,
      preview_url: null,
    };
  }

  const previewUrl = await getSignedUrl(
    getS3Client(),
    new GetObjectCommand({
      Bucket: STORAGE_BUCKET,
      Key: calendar.file_url,
    }),
    { expiresIn: 300 }
  );

  return {
    ...calendar,
    preview_url: previewUrl,
  };
}

// ==========================================================
// GET - Parent Calendar
// ==========================================================

export async function GET(req) {
  try {
    // Verify the logged-in user.
    await verifyUser(req);

    const pool = getPostgresConnection();

    // Retrieve calendars in the existing order.
    const result = await pool.query(`
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
      ORDER BY
        term ASC,
        CASE
          WHEN grade = 'All Grades' THEN 0
          ELSE 1
        END,
        grade ASC
    `);

    // Generate short-lived preview links for private stored files.
    const calendars = await Promise.all(
      result.rows.map(addPreviewUrl)
    );

    return NextResponse.json({
      success: true,
      calendars,
    });
  } catch (error) {
    console.error("Parent calendar GET error:", error);

    if (
      error.message?.toLowerCase().includes("unauthorized") ||
      error.message?.toLowerCase().includes("authentication")
    ) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to load calendars.",
      },
      { status: 500 }
    );
  }
}