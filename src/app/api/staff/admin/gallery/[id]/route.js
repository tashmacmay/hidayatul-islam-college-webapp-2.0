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

// GET /api/staff/admin/gallery/[id]
export async function GET(req, { params }) {
  try {
    await requireAdmin(req);

    const id = Number(params.id);

    if (!Number.isInteger(id)) {
      return NextResponse.json(
        { error: "Invalid gallery image ID" },
        { status: 400 }
      );
    }

    const pool = await getConnection();

    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query(`
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
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json(
        { error: "Gallery image not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.recordset[0]);
  } catch (error) {
    console.error(
      "GET /api/staff/admin/gallery/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch gallery image",
        message: error.message,
      },
      {
        status: error.message === "Admin access required" ? 403 : 500,
      }
    );
  }
}


// PUT /api/staff/admin/gallery/[id]
export async function PUT(req, { params }) {
  try {
    await requireAdmin(req);

    const id = Number(params.id);

    if (!Number.isInteger(id)) {
      return NextResponse.json(
        { error: "Invalid gallery image ID" },
        { status: 400 }
      );
    }

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

    const existing = await pool
      .request()
      .input("id", sql.Int, id)
      .query(`
        SELECT id
        FROM GalleryImages
        WHERE id = @id
      `);

    if (existing.recordset.length === 0) {
      return NextResponse.json(
        { error: "Gallery image not found" },
        { status: 404 }
      );
    }

    const result = await pool
      .request()
      .input("id", sql.Int, id)
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
      .query(`
        UPDATE GalleryImages
        SET
          image_url = @image_url,
          title = @title,
          caption = @caption,
          alt_text = @alt_text,
          category = @category,
          photo_type = @photo_type,
          consent_confirmed = @consent_confirmed,
          published = @published,
          updated_at = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    return NextResponse.json({
      success: true,
      image: result.recordset[0],
    });
  } catch (error) {
    console.error(
      "PUT /api/staff/admin/gallery/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to update gallery image",
        message: error.message,
      },
      {
        status: error.message === "Admin access required" ? 403 : 500,
      }
    );
  }
}


// DELETE /api/staff/admin/gallery/[id]
export async function DELETE(req, { params }) {
  try {
    await requireAdmin(req);

    const id = Number(params.id);

    if (!Number.isInteger(id)) {
      return NextResponse.json(
        { error: "Invalid gallery image ID" },
        { status: 400 }
      );
    }

    const pool = await getConnection();

    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query(`
        DELETE FROM GalleryImages
        OUTPUT DELETED.*
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json(
        { error: "Gallery image not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Gallery image deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE /api/staff/admin/gallery/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to delete gallery image",
        message: error.message,
      },
      {
        status: error.message === "Admin access required" ? 403 : 500,
      }
    );
  }
}