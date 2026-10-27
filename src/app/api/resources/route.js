import { NextResponse } from "next/server";
import { getPostgresConnection } from "@/lib/db-postgres";
import { verifyUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await verifyUser(req);

    const pool = getPostgresConnection();

    const result = await pool.query(`
      SELECT
        id,
        title,
        caption,
        description,
        category,
        grade,
        resource_type,
        youtube_url,
        file_url,
        thumbnail_url,
        is_published,
        created_at,
        updated_at
      FROM "dbo"."LearningResources"
      WHERE is_published = TRUE
      ORDER BY created_at DESC
    `);

    return NextResponse.json({
      resources: result.rows,
    });
  } catch (error) {
    if (
      error?.code === "MISSING_AUTH_HEADER" ||
      error?.code === "EMPTY_TOKEN" ||
      error?.code === "INVALID_TOKEN" ||
      error?.code === "NO_UID_IN_TOKEN" ||
      error?.code === "USER_NOT_FOUND"
    ) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    console.error("Resources GET error:", error);

    return NextResponse.json(
      { error: "Failed to fetch learning resources." },
      { status: 500 }
    );
  }
}
