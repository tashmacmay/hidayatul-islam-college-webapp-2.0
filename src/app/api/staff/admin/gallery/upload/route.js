import { NextResponse } from "next/server";
import crypto from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { requireAdmin } from "@/lib/auth";
import { getS3Client, STORAGE_BUCKET } from "@/lib/object-storage";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_TYPES = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
};

export async function POST(req) {
  try {
    await requireAdmin(req);

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "Please select an image to upload." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES[file.type]) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only PNG, JPG/JPEG or WebP images are allowed.",
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
    const objectKey = `gallery/${filename}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    await getS3Client().send(
      new PutObjectCommand({
        Bucket: STORAGE_BUCKET,
        Key: objectKey,
        Body: fileBuffer,
        ContentType: file.type,
      })
    );

    // Keep the existing response contract. The gallery frontend must use
    // this object key with an appropriate storage-serving mechanism.
    const fileUrl = objectKey;

    return NextResponse.json({
      success: true,
      file_url: fileUrl,
    });
  } catch (error) {
    console.error("Gallery image upload error:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to upload gallery image.",
      },
      { status: 500 }
    );
  }
}
