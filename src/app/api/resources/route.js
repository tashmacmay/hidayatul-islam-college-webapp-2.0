import { NextResponse } from "next/server";
import { getPostgresConnection } from "@/lib/db-postgres";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
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
    console.error("Public resources GET error:", error);

    return NextResponse.json(
      { error: "Failed to fetch learning resources." },
      { status: 500 }
    );
  }
}
