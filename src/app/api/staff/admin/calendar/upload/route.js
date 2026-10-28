import { NextResponse } from "next/server";
import crypto from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getS3Client, STORAGE_BUCKET } from "@/lib/object-storage";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_TYPES = {
  "image/png": ".png",
  "application/pdf": ".pdf",
};

export async function POST(req) {
  try {
    await requireAdmin(req);

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "Please select a calendar file to upload." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES[file.type]) {
      return NextResponse.json(
        { error: "Invalid file type. Only PNG and PDF files are allowed." },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: "The selected file is empty." },
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
    const objectKey = `calendar/${filename}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    await getS3Client().send(
      new PutObjectCommand({
        Bucket: STORAGE_BUCKET,
        Key: objectKey,
        Body: fileBuffer,
        ContentType: file.type,
      })
    );

    return NextResponse.json({
      success: true,
      file_url: objectKey,
      file_name: file.name,
      file_type: file.type === "application/pdf" ? "PDF" : "PNG",
    });
  } catch (error) {
    console.error("Calendar upload error:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to upload calendar.",
      },
      { status: 500 }
    );
  }
}
