import { NextResponse } from "next/server";
import sql from "mssql";
import { getConnection } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const GALLERY_CATEGORIES = [
  "Sport",
  "Islamic Events",
  "Academic",
  "School Events",
  "Outings",
];

const PHOTO_TYPES = [
  "general",
  "learners",
];

// GET /api/staff/admin/gallery
// Returns all gallery photos, including unpublished photos.
export async function GET(req) {
  try {
    await requireAdmin(req);

    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT
        id,
        image_url,
        title,
        caption,
        alt_text,
        category,
        photo_type,
        consent_confirmed,
        published,
        uploaded_by,
        created_at,
        updated_at
      FROM GalleryImages
      ORDER BY created_at DESC
    `);

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error("GET /api/staff/admin/gallery error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch gallery images",
        message: error.message,
      },
      {
        status: error.message === "Admin access required" ? 403 : 500,
      }
    );
  }
}


// POST /api/staff/admin/gallery
// Creates a new gallery photo.
export async function POST(req) {
  try {
    const user = await requireAdmin(req);
    const body = await req.json();

    const {
      image_url,
      title,
      caption,
      alt_text,
      category,
      photo_type,
      consent_confirmed,
      published,
    } = body;

    if (!image_url?.trim()) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    if (!alt_text?.trim()) {
      return NextResponse.json(
        { error: "Alt text is required" },
        { status: 400 }
      );
    }

    if (!GALLERY_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: "Invalid gallery category" },
        { status: 400 }
      );
    }

    if (!PHOTO_TYPES.includes(photo_type)) {
      return NextResponse.json(
        { error: "Invalid photo type" },
        { status: 400 }
      );
    }

    const isPublished = Boolean(published);
    const hasConsent = Boolean(consent_confirmed);

    // Learner photos cannot be published without
    // confirmed parent/guardian consent.
    if (photo_type === "learners" && isPublished && !hasConsent) {
      return NextResponse.json(
        {
          error:
            "Parent/guardian consent is required before publishing a learner photo",
        },
        { status: 400 }
      );
    }

    const pool = await getConnection();

    const result = await pool
      .request()
      .input("image_url", sql.NVarChar(500), image_url.trim())
      .input(
        "title",
        sql.NVarChar(255),
        title?.trim() || null
      )
      .input(
        "caption",
        sql.NVarChar(500),
        caption?.trim() || null
      )
      .input("alt_text", sql.NVarChar(255), alt_text.trim())
      .input("category", sql.NVarChar(50), category)
      .input("photo_type", sql.NVarChar(20), photo_type)
      .input("consent_confirmed", sql.Bit, hasConsent)
      .input("published", sql.Bit, isPublished)
      .input("uploaded_by", sql.Int, user.id)
      .query(`
        INSERT INTO GalleryImages (
          image_url,
          title,
          caption,
          alt_text,
          category,
          photo_type,
          consent_confirmed,
          published,
          uploaded_by
        )
        OUTPUT INSERTED.*
        VALUES (
          @image_url,
          @title,
          @caption,
          @alt_text,
          @category,
          @photo_type,
          @consent_confirmed,
          @published,
          @uploaded_by
        )
      `);

    return NextResponse.json(
      {
        success: true,
        image: result.recordset[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/staff/admin/gallery error:", error);

    return NextResponse.json(
      {
        error: "Failed to create gallery image",
        message: error.message,
      },
      {
        status: error.message === "Admin access required" ? 403 : 500,
      }
    );
  }
}