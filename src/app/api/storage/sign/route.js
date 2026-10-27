import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getPostgresConnection } from "@/lib/db-postgres";
import { verifyUser } from "@/lib/auth";
import {
  getS3Client,
  STORAGE_BUCKET,
} from "@/lib/object-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    await verifyUser(req);

    const body = await req.json();
    const resourceId = Number(body.resourceId);

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

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Resource not found." },
        { status: 404 }
      );
    }

    const resource = result.rows[0];

    // Drafts must never be accessible through this endpoint.
    if (!resource.is_published) {
      return NextResponse.json(
        { error: "Resource not found." },
        { status: 404 }
      );
    }

    // Accept only URLs for resources uploaded to our application route.
    const match = /^\/api\/storage\/resources\/([a-f0-9-]+\.(?:pdf|png|jpg))$/i
      .exec(resource.file_url || "");

    if (!match) {
      return NextResponse.json(
        { error: "This resource does not use private object storage." },
        { status: 400 }
      );
    }

    const signedUrl = await getSignedUrl(
      getS3Client(),
      new GetObjectCommand({
        Bucket: STORAGE_BUCKET,
        Key: `resources/${match[1]}`,
      }),
      { expiresIn: 60 }
    );

    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    if (
      [
        "MISSING_AUTH_HEADER",
        "EMPTY_TOKEN",
        "INVALID_TOKEN",
        "NO_UID_IN_TOKEN",
        "USER_NOT_FOUND",
      ].includes(error?.code)
    ) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    console.error("Signed resource URL error:", error);

    return NextResponse.json(
      { error: "Unable to prepare this resource." },
      { status: 500 }
    );
  }
}
