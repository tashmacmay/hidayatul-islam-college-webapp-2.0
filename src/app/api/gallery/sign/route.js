import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getPostgresConnection } from "@/lib/db-postgres";
import { getS3Client, STORAGE_BUCKET } from "@/lib/object-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json();
    const imageId = Number(body.imageId);

    if (!Number.isSafeInteger(imageId) || imageId <= 0) {
      return NextResponse.json(
        { error: "A valid gallery image ID is required." },
        { status: 400 }
      );
    }

    const pool = getPostgresConnection();

    const result = await pool.query(
      `
        SELECT image_url
        FROM "dbo"."GalleryImages"
        WHERE id = $1
          AND published = TRUE
          AND (
            photo_type <> 'learners'
            OR consent_confirmed = TRUE
          )
        LIMIT 1
      `,
      [imageId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Gallery image not found." },
        { status: 404 }
      );
    }

    const key = result.rows[0].image_url;

    // Only sign keys from the gallery folder.
    if (
      typeof key !== "string" ||
      !/^gallery\/[a-f0-9-]+\.(?:png|jpg|webp)$/i.test(key)
    ) {
      return NextResponse.json(
        { error: "This image does not use private object storage." },
        { status: 400 }
      );
    }

    const url = await getSignedUrl(
      getS3Client(),
      new GetObjectCommand({
        Bucket: STORAGE_BUCKET,
        Key: key,
      }),
      { expiresIn: 60 }
    );

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Gallery signing error:", error);

    return NextResponse.json(
      { error: "Unable to prepare this gallery image." },
      { status: 500 }
    );
  }
}
