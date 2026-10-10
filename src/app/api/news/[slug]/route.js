import { NextResponse } from "next/server";
import sql from "mssql";
import { getConnection } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const slug = decodeURIComponent(params.slug);

    if (!slug) {
      return NextResponse.json(
        { error: "Article slug is required." },
        { status: 400 }
      );
    }

    const pool = await getConnection();

    const result = await pool
      .request()
      .input("slug", sql.NVarChar(255), slug)
      .query(`
        SELECT
          id,
          title,
          slug,
          category,
          excerpt,
          content,
          featured_image_url,
          published_at,
          created_at,
          updated_at
        FROM NewsAnnouncements
        WHERE slug = @slug
          AND published = 1
          AND (image_contains_learners = 0 OR consent_confirmed = 1)
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json(
        { error: "News article not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      news: result.recordset[0],
    });
  } catch (error) {
    console.error("PUBLIC NEWS SLUG ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch news article.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}