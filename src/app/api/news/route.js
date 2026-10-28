import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getPostgresConnection } from "@/lib/db-postgres";
import { getS3Client, STORAGE_BUCKET } from "@/lib/object-storage";

export const runtime = "nodejs";

const isNewsObjectKey = (value) =>
  typeof value === "string" &&
  /^news\/[a-f0-9-]+\.(?:png|jpg|webp)$/i.test(value);

async function addSignedImageUrl(article) {
  if (!isNewsObjectKey(article.featured_image_url)) {
    // Preserve existing URLs while legacy images are reviewed.
    return article;
  }

  const imageUrl = await getSignedUrl(
    getS3Client(),
    new GetObjectCommand({
      Bucket: STORAGE_BUCKET,
      Key: article.featured_image_url,
    }),
    { expiresIn: 300 }
  );

  return {
    ...article,
    featured_image_url: imageUrl,
  };
}

export async function GET() {
  try {
    const pool = getPostgresConnection();

    const result = await pool.query(`
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
      WHERE published = TRUE
        AND (
          image_contains_learners = FALSE
          OR consent_confirmed = TRUE
        )
      ORDER BY published_at DESC
    `);

    const news = await Promise.all(
      result.rows.map(addSignedImageUrl)
    );

    return NextResponse.json({ news });
  } catch (err) {
    console.error("NEWS GET ERROR:", err.message);

    return NextResponse.json(
      {
        error: "Failed to load news",
        message: "Unable to retrieve news at this time.",
      },
      { status: 500 }
    );
  }
}
