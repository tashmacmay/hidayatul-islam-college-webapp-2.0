import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { requireAdmin } from "@/lib/auth";
import { createCanvas } from "canvas";

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
    const fileId = crypto.randomUUID();
    const filename = `${fileId}${extension}`;

    const uploadDirectory = path.join(
      process.cwd(),
      "public",
      "uploads",
      "resources"
    );

    await mkdir(uploadDirectory, { recursive: true });

    const filePath = path.join(uploadDirectory, filename);
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    await writeFile(filePath, fileBuffer);

    const fileUrl = `/uploads/resources/${filename}`;

    let thumbnailUrl = fileUrl;

    // Generate a thumbnail from the first page of a PDF
if (file.type === "application/pdf") {
const pdfjs = await import("pdfjs-dist/legacy/build/pdf.js");

pdfjs.GlobalWorkerOptions.workerSrc = path.join(
  process.cwd(),
  "public",
  "pdf.worker.js"
);

const pdf = await pdfjs.getDocument({
  data: new Uint8Array(fileBuffer),
}).promise;

  const page = await pdf.getPage(1);

  const viewport = page.getViewport({
    scale: 1.2,
  });

  const canvas = createCanvas(
    Math.ceil(viewport.width),
    Math.ceil(viewport.height)
  );

  const context = canvas.getContext("2d");

  await page.render({
    canvasContext: context,
    viewport,
  }).promise;

  const thumbnailFilename = `${fileId}-thumb.png`;

  const thumbnailPath = path.join(
    uploadDirectory,
    thumbnailFilename
  );

  const thumbnailBuffer = canvas.toBuffer("image/png");

  await writeFile(
    thumbnailPath,
    thumbnailBuffer
  );

  thumbnailUrl = `/uploads/resources/${thumbnailFilename}`;
}

    return NextResponse.json({
      success: true,
      file_url: fileUrl,
      thumbnail_url: thumbnailUrl,
    });
  } catch (error) {
    console.error(
      "Learning Resource file upload error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to upload file.",
      },
      { status: 500 }
    );
  }
}