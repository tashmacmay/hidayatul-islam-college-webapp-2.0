import { NextResponse } from "next/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getPostgresConnection } from "@/lib/db-postgres";
import {
  getS3Client,
  STORAGE_BUCKET,
} from "@/lib/object-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const isNewsObjectKey = (value) =>
  typeof value === "string" &&
  /^news\/[a-f0-9-]+\.(?:png|jpg|webp)$/i.test(value);

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

    const news = result.rows[0];
    let previewUrl = null;

    if (isNewsObjectKey(news.featured_image_url)) {
      previewUrl = await getSignedUrl(
        getS3Client(),
        new GetObjectCommand({
          Bucket: STORAGE_BUCKET,
          Key: news.featured_image_url,
        }),
        { expiresIn: 300 }
      );
    } else if (
      typeof news.featured_image_url === "string" &&
      /^https?:\/\//i.test(news.featured_image_url)
    ) {
      // Preserve existing externally hosted images.
      previewUrl = news.featured_image_url;
    } else if (
      typeof news.featured_image_url === "string" &&
      news.featured_image_url.startsWith("/uploads/news/")
    ) {
      // Preserve legacy local image paths.
      previewUrl = news.featured_image_url;
    }

    return NextResponse.json({
      news: {
        ...news,
        preview_url: previewUrl,
      },
    });
  } catch (error) {
    console.error("PUBLIC NEWS SLUG ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch news article.",
      },
      { status: 500 }
    );
  }
}
