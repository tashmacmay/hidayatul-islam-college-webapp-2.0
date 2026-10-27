// src/app/api/admin/upload-parents/route.js

import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { verifyUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    // 1. Authenticate Firebase Admin
    const authResult = await verifyUser(request);
    if (!authResult || !authResult.is_admin) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required." },
        { status: 403 }
      );
    }

    // 2. Read File from Form Data
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 3. Ensure "private" folder exists in root
    const privateDir = path.resolve(process.cwd(), "private");
    await fs.mkdir(privateDir, { recursive: true });

    // 4. Write to private/school_parents.csv
    const csvPath = path.join(privateDir, "school_parents.csv");
    await fs.writeFile(csvPath, buffer);

    return NextResponse.json({
      success: true,
      message: "school_parents.csv updated successfully.",
    });
  } catch (error) {
    console.error("CSV File Upload Error:", error);
    return NextResponse.json(
      { error: "Failed to upload and update parent CSV file." },
      { status: 500 }
    );
  }
}