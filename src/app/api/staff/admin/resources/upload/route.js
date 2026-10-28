import { NextResponse } from "next/server";
import crypto from "crypto";
import { createCanvas } from "@napi-rs/canvas";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { requireAdmin } from "@/lib/auth";
import { getS3Client, STORAGE_BUCKET } from "@/lib/object-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_THUMBNAIL_WIDTH = 600;

const ALLOWED_TYPES = {
  "application/pdf": ".pdf",
  "image/png": ".png",
  "image/jpeg": ".jpg",
};

async function generatePdfThumbnail(pdfBuffer) {
  const loadingTask = getDocument({
    data: new Uint8Array(pdfBuffer),
    isEvalSupported: false,
    useSystemFonts: true,
  });

  let pdf;

  try {
    pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);

    const initialViewport = page.getViewport({ scale: 1 });
    const scale = Math.min(
      MAX_THUMBNAIL_WIDTH / initialViewport.width,
      1
    );
    const viewport = page.getViewport({ scale });

    const width = Math.max(1, Math.ceil(viewport.width));
    const height = Math.max(1, Math.ceil(viewport.height));
    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");

    await page.render({
      canvasContext: context,
      viewport,
    }).promise;

    return Buffer.from(await canvas.encode("png"));
  } finally {
    if (pdf) {
      await pdf.destroy();
    } else {
      await loadingTask.destroy();
    }
  }
}

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

    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error:
            "File size must be greater than 0 and cannot exceed 10 MB.",
        },
        { status: 400 }
      );
    }

    const extension = ALLOWED_TYPES[file.type];
    const filename = `${crypto.randomUUID()}${extension}`;
    const objectKey = `resources/${filename}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const s3 = getS3Client();

    await s3.send(
      new PutObjectCommand({
        Bucket: STORAGE_BUCKET,
        Key: objectKey,
        Body: fileBuffer,
        ContentLength: fileBuffer.length,
        ContentType: file.type,
      })
    );

    const fileUrl = `/api/storage/${objectKey}`;
    let thumbnailUrl = null;

    if (file.type.startsWith("image/")) {
      thumbnailUrl = fileUrl;
    } else {
      const thumbnailFilename =
        `${crypto.randomUUID()}.png`;
      const thumbnailKey =
        `resource-thumbnails/${thumbnailFilename}`;

      try {
        const thumbnailBuffer =
          await generatePdfThumbnail(fileBuffer);

        await s3.send(
          new PutObjectCommand({
            Bucket: STORAGE_BUCKET,
            Key: thumbnailKey,
            Body: thumbnailBuffer,
            ContentLength: thumbnailBuffer.length,
            ContentType: "image/png",
          })
        );

        thumbnailUrl = `/api/storage/${thumbnailKey}`;
      } catch (thumbnailError) {
        console.error(
          "PDF thumbnail generation failed:",
          thumbnailError
        );
        // Keep the PDF upload successful if preview generation fails.
      }
    }

    return NextResponse.json({
      success: true,
      file_url: fileUrl,
      thumbnail_url: thumbnailUrl,
    });
  } catch (error) {
    console.error("Learning Resource file upload error:", error);

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

    return NextResponse.json(
      { error: "Failed to upload file." },
      { status: 500 }
    );
  }
}
