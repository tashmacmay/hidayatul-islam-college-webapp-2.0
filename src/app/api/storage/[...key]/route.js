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

export async function GET(req, context) {
  try {
    const user = await verifyUser(req);
    const { key } = await context.params;

    // Only allow resource objects uploaded under this prefix.
    if (
      !Array.isArray(key) ||
      key.length !== 2 ||
      key[0] !== "resources" ||
      !/^[a-f0-9-]+\.(pdf|png|jpg)$/i.test(key[1])
    ) {
      return NextResponse.json(
        { error: "Resource not found." },
        { status: 404 }
      );
    }

    const objectKey = key.join("/");
    const fileUrl = `/api/storage/${objectKey}`;
    const pool = getPostgresConnection();

    // A published resource may be opened by an authenticated user.
    // Draft resources are restricted to staff administrators.
    const result = await pool.query(
      `
        SELECT id, is_published
        FROM "dbo"."LearningResources"
        WHERE file_url = $1 OR thumbnail_url = $1
        LIMIT 1
      `,
      [fileUrl]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Resource not found." },
        { status: 404 }
      );
    }

    const resource = result.rows[0];

    if (!resource.is_published) {
      if (user.role !== "staff" || !user.isAdmin) {
        return NextResponse.json(
          { error: "Forbidden." },
          { status: 403 }
        );
      }
    }

    const signedUrl = await getSignedUrl(
      getS3Client(),
      new GetObjectCommand({
        Bucket: STORAGE_BUCKET,
        Key: objectKey,
      }),
      { expiresIn: 60 }
    );

    return NextResponse.redirect(signedUrl);
  } catch (error) {
    if (
      error?.code === "MISSING_AUTH_HEADER" ||
      error?.code === "EMPTY_TOKEN" ||
      error?.code === "INVALID_TOKEN" ||
      error?.code === "NO_UID_IN_TOKEN" ||
      error?.code === "USER_NOT_FOUND"
    ) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    if (error?.code === "NOT_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden." },
        { status: 403 }
      );
    }

    console.error("Private resource delivery error:", error);

    return NextResponse.json(
      { error: "Unable to open this resource." },
      { status: 500 }
    );
  }
}
