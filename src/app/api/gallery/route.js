import { NextResponse } from "next/server";
import { getPostgresConnection } from "@/lib/db-postgres";

export async function GET() {
  try {
    const pool = getPostgresConnection();

    const result = await pool.query(`
      SELECT
        id,
        image_url,
        title,
        caption,
        alt_text,
        category,
        photo_type,
        consent_confirmed,
        published,
        created_at,
        updated_at
      FROM "dbo"."GalleryImages"
      WHERE published = TRUE
        AND (
          photo_type <> 'learners'
          OR consent_confirmed = TRUE
        )
      ORDER BY created_at DESC
    `);

    return NextResponse.json({
      gallery: result.rows,
    });
  } catch (error) {
    console.error("Public Gallery GET error:", error);

    return NextResponse.json(
      { error: "Failed to fetch gallery images." },
      { status: 500 }
    );
  }
}