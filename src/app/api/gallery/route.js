import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

export async function GET() {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`
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
      FROM GalleryImages
      WHERE published = 1
        AND (
          photo_type <> 'learners'
          OR consent_confirmed = 1
        )
      ORDER BY created_at DESC
    `);

    return NextResponse.json({
      gallery: result.recordset,
    });
  } catch (error) {
    console.error("Public Gallery GET error:", error);

    return NextResponse.json(
      { error: "Failed to fetch gallery images." },
      { status: 500 }
    );
  }
}