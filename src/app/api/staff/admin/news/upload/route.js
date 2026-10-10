import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { requireAdmin } from "@/lib/auth";

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
        {
          error: "File size cannot exceed 10 MB.",
        },
        { status: 400 }
      );
    }

    const extension = ALLOWED_TYPES[file.type];
    const fileId = crypto.randomUUID();
    const filename = `${fileId}${extension}`;

    const uploadDirectory = path.join(
      process.cwd(),
      "public",
      "uploads",
      "news"
    );

    await mkdir(uploadDirectory, { recursive: true });

    const filePath = path.join(uploadDirectory, filename);

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    await writeFile(filePath, fileBuffer);

    const fileUrl = `/uploads/news/${filename}`;

    return NextResponse.json({
      success: true,
      file_url: fileUrl,
    });
  } catch (error) {
    console.error("News image upload error:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to upload news image.",
      },
      { status: 500 }
    );
  }
}