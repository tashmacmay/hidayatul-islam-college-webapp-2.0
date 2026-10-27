import { NextResponse } from "next/server";
import crypto from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { requireAdmin } from "@/lib/auth";
import { getS3Client, STORAGE_BUCKET } from "@/lib/object-storage";

// TEMPORARY VERCEL BUILD FIX:
// PDF thumbnail generation is disabled because the previous pdfjs-dist
// implementation required the unavailable "canvas" module.
// Revisit this once a Vercel-compatible renderer is chosen.

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_TYPES = {
  "application/pdf": ".pdf",
  "image/png": ".png",
  "image/jpeg": ".jpg",
};

export async function POST(req) {
  try {
    await requireAdmin(req);

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "Please select a file to upload." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES[file.type]) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only PDF, PNG and JPG/JPEG files are allowed.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size cannot exceed 10 MB." },
        { status: 400 }
      );
    }

    const extension = ALLOWED_TYPES[file.type];
    const filename = `${crypto.randomUUID()}${extension}`;
    const objectKey = `resources/${filename}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    await getS3Client().send(
      new PutObjectCommand({
        Bucket: STORAGE_BUCKET,
        Key: objectKey,
        Body: fileBuffer,
        ContentType: file.type,
      })
    );

    // Stable application URL; a server route will resolve private objects.
    const fileUrl = `/api/storage/${objectKey}`;

    // PDF thumbnail generation remains disabled.
    const thumbnailUrl = fileUrl;

    return NextResponse.json({
      success: true,
      file_url: fileUrl,
      thumbnail_url: thumbnailUrl,
    });
  } catch (error) {
    console.error("Learning Resource file upload error:", error);

    return NextResponse.json(
      { error: "Failed to upload file." },
      { status: 500 }
    );
  }
}
