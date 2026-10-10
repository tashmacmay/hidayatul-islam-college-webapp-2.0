import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
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

    // ---------------------------------------------------------
    // Validate file
    // ---------------------------------------------------------

    if (!file || typeof file === "string") {
      return NextResponse.json(
        {
          error: "Please select a calendar file to upload.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------
    // Validate file type
    // ---------------------------------------------------------

    if (!ALLOWED_TYPES[file.type]) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only PNG and PDF files are allowed.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------
    // Validate file size
    // ---------------------------------------------------------

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "File size cannot exceed 10 MB.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------
    // Generate unique filename
    // ---------------------------------------------------------

    const extension = ALLOWED_TYPES[file.type];

    const fileId = crypto.randomUUID();

    const filename = `${fileId}${extension}`;

    // ---------------------------------------------------------
    // Create calendar upload directory
    // ---------------------------------------------------------

    const uploadDirectory = path.join(
      process.cwd(),
      "public",
      "uploads",
      "calendar"
    );

    await mkdir(uploadDirectory, {
      recursive: true,
    });

    // ---------------------------------------------------------
    // Save file
    // ---------------------------------------------------------

    const filePath = path.join(
      uploadDirectory,
      filename
    );

    const fileBuffer = Buffer.from(
      await file.arrayBuffer()
    );

    await writeFile(
      filePath,
      fileBuffer
    );

    // ---------------------------------------------------------
    // Public URL
    // ---------------------------------------------------------

    const fileUrl =
      `/uploads/calendar/${filename}`;

    console.log("Calendar uploaded:", {
      filename,
      type: file.type,
      size: file.size,
      fileUrl,
    });

    // ---------------------------------------------------------
    // Return upload information
    // ---------------------------------------------------------

    return NextResponse.json({
      success: true,
      file_url: fileUrl,
      file_name: file.name,
      file_type:
        file.type === "application/pdf"
          ? "PDF"
          : "PNG",
    });
  } catch (error) {
    console.error(
      "Calendar upload error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error.message ||
          "Failed to upload calendar.",
      },
      { status: 500 }
    );
  }
}