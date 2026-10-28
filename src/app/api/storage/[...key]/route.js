import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getPostgresConnection } from "@/lib/db-postgres";
import { verifyUser } from "@/lib/auth";
import { getS3Client, STORAGE_BUCKET } from "@/lib/object-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req, context) {
  try {
    const { key } = await context.params;

    // Allow only files directly inside approved resource folders.
    const allowedPrefixes = ["resources", "resource-thumbnails"];

    if (
      !Array.isArray(key) ||
      key.length !== 2 ||
      !allowedPrefixes.includes(key[0]) ||
      !/^[a-f0-9-]+\.(?:pdf|png|jpg|jpeg)$/i.test(key[1]) ||
      (key[0] === "resource-thumbnails" &&
        !/\.(?:png|jpg|jpeg)$/i.test(key[1]))
    ) {
      return NextResponse.json(
        { error: "Resource not found." },
        { status: 404 }
      );
    }

    const objectKey = key.join("/");
    const fileUrl = `/api/storage/${objectKey}`;
    const pool = getPostgresConnection();

    // Only serve files linked to a resource in the database.
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

    // Published resources are public. Drafts require an admin.
    if (!resource.is_published) {
      const user = await verifyUser(req);

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
      { expiresIn: 300 }
    );

    return NextResponse.redirect(signedUrl);
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

    if (error?.code === "NOT_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden." },
        { status: 403 }
      );
    }

    console.error("Resource delivery error:", error);

    return NextResponse.json(
      { error: "Unable to open this resource." },
      { status: 500 }
    );
  }
}
