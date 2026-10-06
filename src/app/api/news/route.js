import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

export async function GET() {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT
        id,
        title,
        slug,
        category,
        excerpt,
        content,
        featured_image_url,
        published,
        published_at,
        created_at,
        updated_at
      FROM NewsAnnouncements
      WHERE published = 1
      ORDER BY
        COALESCE(published_at, created_at) DESC
    `);

    return NextResponse.json({
      news: result.recordset,
    });
  } catch (error) {
    console.error("Public News GET error:", error);

    return NextResponse.json(
      { error: "Failed to fetch news articles." },
      { status: 500 }
    );
  }
}