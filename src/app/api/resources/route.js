import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

export async function GET() {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`
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
      FROM LearningResources
      WHERE is_published = 1
      ORDER BY created_at DESC
    `);

    return NextResponse.json({
      resources: result.recordset,
    });
  } catch (error) {
    console.error("Public Resources GET error:", error);

    return NextResponse.json(
      { error: "Failed to fetch learning resources." },
      { status: 500 }
    );
  }
}