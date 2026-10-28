import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getPostgresConnection } from "@/lib/db-postgres";
import { getS3Client, STORAGE_BUCKET } from "@/lib/object-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    const gallery = await Promise.all(
      result.rows.map(async (image) => {
        const key = image.image_url;

        // Only sign objects stored in the gallery folder.
        if (
          typeof key !== "string" ||
          !/^gallery\/[a-f0-9-]+\.(?:png|jpg|webp)$/i.test(key)
        ) {
          return { ...image, image_url: null };
        }

        const signedUrl = await getSignedUrl(
          getS3Client(),
          new GetObjectCommand({
            Bucket: STORAGE_BUCKET,
            Key: key,
          }),
          { expiresIn: 60 }
        );

        return { ...image, image_url: signedUrl };
      })
    );

    return NextResponse.json({ gallery });
  } catch (error) {
    console.error("Public Gallery GET error:", error);

    return NextResponse.json(
      { error: "Failed to fetch gallery images." },
      { status: 500 }
    );
  }
}
