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
        updated_at,
        image_contains_learners,
        consent_confirmed
      FROM NewsAnnouncements
      WHERE published = 1
      ORDER BY
        COALESCE(published_at, created_at) DESC
    `);

    console.log("PUBLIC NEWS RESULT:", result.recordset);

    return NextResponse.json({
      news: result.recordset,
    });
  } catch (error) {
    console.error("PUBLIC NEWS ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch news articles.",
        details: error.message,
      },
      {
        status: 500,
      }
    );
  }
}