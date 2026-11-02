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
    const resourceId = Number(body?.resourceId);

    if (!Number.isSafeInteger(resourceId) || resourceId <= 0) {
      return NextResponse.json(
        { error: "A valid resource ID is required." },
        { status: 400 }
      );
    }

    const pool = getPostgresConnection();

    const result = await pool.query(
      `
        SELECT id, file_url, is_published
        FROM "dbo"."LearningResources"
        WHERE id = $1
        LIMIT 1
      `,
      [resourceId]
    );

    const resource = result.rows[0];

    // Public visitors can access published resources only.
    if (!resource || !resource.is_published) {
      return NextResponse.json(
        { error: "Resource not found." },
        { status: 404 }
      );
    }

    // Only allow application-managed resource file URLs.
    // Expected: /api/storage/resources/<filename>.<extension>
    const match =
      /^\/api\/storage\/resources\/([a-f0-9-]+\.(?:pdf|png|jpg|jpeg))$/i.exec(
        String(resource.file_url || "")
      );

    if (!match) {
      return NextResponse.json(
        {
          error:
            "This resource has an old or unsupported file URL. Please update its stored file URL.",
        },
        { status: 400 }
      );
    }

    const objectKey = `resources/${match[1]}`;

    const signedUrl = await getSignedUrl(
      getS3Client(),
      new GetObjectCommand({
        Bucket: STORAGE_BUCKET,
        Key: objectKey,
      }),
      { expiresIn: 300 }
    );

    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error("Signed resource URL error:", error);

    return NextResponse.json(
      { error: "Unable to prepare this resource." },
      { status: 500 }
    );
  }
}
