import { NextResponse } from "next/server";
import { getPostgresConnection } from "@/lib/db-postgres";

export async function GET(request, { params }) {
  try {
    const { slug: rawSlug } = await params;
    const slug = decodeURIComponent(rawSlug);

    if (!slug) {
      return NextResponse.json(
        { error: "Article slug is required." },
        { status: 400 }
      );
    }

    const pool = getPostgresConnection();

    const result = await pool.query(
      `
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
        FROM "dbo"."NewsAnnouncements"
        WHERE slug = $1
          AND published = TRUE
          AND (
            image_contains_learners = FALSE
            OR consent_confirmed = TRUE
          )
      `,
      [slug]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "News article not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      news: result.rows[0],
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
