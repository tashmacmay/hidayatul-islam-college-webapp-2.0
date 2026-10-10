import { NextResponse } from "next/server";
import sql from "mssql";
import { getConnection } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// GET all gallery images
export async function GET(req) {
  try {
    await requireAdmin(req);

    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT
        g.id,
        g.image_url,
        g.title,
        g.caption,
        g.alt_text,
        g.category,
        g.consent_confirmed,
        g.published,
        g.uploaded_by,
        g.created_at,
        g.updated_at,
        g.photo_type,
        u.display_name AS uploaded_by_name
      FROM GalleryImages AS g
      LEFT JOIN Users AS u
        ON g.uploaded_by = u.id
      ORDER BY g.created_at DESC
    `);

    return NextResponse.json({
      gallery: result.recordset,
    });
   } catch (error) {
    console.error("Admin Gallery GET error:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to fetch gallery images.",
      },
      { status: 500 }
    );
  }
}

// POST new gallery image
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
        { error: "An image is required." },
        { status: 400 }
      );
    }

    if (!alt_text?.trim()) {
      return NextResponse.json(
        { error: "Alt text is required." },
        { status: 400 }
      );
    }

    const photoType = photo_type?.trim().toLowerCase() || "general";
    const consentConfirmed = consent_confirmed === true;
    const isPublished = published === true;
    const isLearnerPhoto = photoType === "learners";

    // Consent is only required when the photo contains learners.
    if (isLearnerPhoto && isPublished && !consentConfirmed) {
      return NextResponse.json(
        {
          error:
            "Learner photos require confirmed consent before they can be published.",
        },
        { status: 400 }
      );
    }

    const pool = await getConnection();

    const result = await pool
      .request()
      .input("image_url", sql.NVarChar(1000), image_url.trim())
      .input("title", sql.NVarChar(255), title?.trim() || null)
      .input("caption", sql.NVarChar(1000), caption?.trim() || null)
      .input("alt_text", sql.NVarChar(500), alt_text.trim())
      .input(
        "category",
        sql.NVarChar(100),
        category?.trim() || "School Events"
      )
      .input("photo_type", sql.NVarChar(50), photoType)
      .input("consent_confirmed", sql.Bit, consentConfirmed)
      .input("published", sql.Bit, isPublished)
      .input("uploaded_by", sql.Int, user.id)
      .query(`
        INSERT INTO GalleryImages (
          image_url,
          title,
          caption,
          alt_text,
          category,
          consent_confirmed,
          published,
          uploaded_by,
          photo_type
        )
        OUTPUT INSERTED.*
        VALUES (
          @image_url,
          @title,
          @caption,
          @alt_text,
          @category,
          @consent_confirmed,
          @published,
          @uploaded_by,
          @photo_type
        )
      `);

    return NextResponse.json(
      {
        message: "Gallery image uploaded successfully.",
        gallery: result.recordset[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin Gallery POST error:", error);

    return NextResponse.json(
      { error: "Failed to create gallery image." },
      { status: 500 }
    );
  }
}

// PUT update gallery image
export async function PUT(req) {
  try {
    const user = await requireAdmin(req);
    const body = await req.json();

    const {
      id,
      image_url,
      title,
      caption,
      alt_text,
      category,
      photo_type,
      consent_confirmed,
      published,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Gallery image ID is required." },
        { status: 400 }
      );
    }

    if (!image_url?.trim()) {
      return NextResponse.json(
        { error: "An image is required." },
        { status: 400 }
      );
    }

    if (!alt_text?.trim()) {
      return NextResponse.json(
        { error: "Alt text is required." },
        { status: 400 }
      );
    }

    const photoType = photo_type?.trim().toLowerCase() || "general";
    const consentConfirmed = consent_confirmed === true;
    const isPublished = published === true;
    const isLearnerPhoto = photoType === "learners";

    // Consent is only required when the photo contains learners.
    if (isLearnerPhoto && isPublished && !consentConfirmed) {
      return NextResponse.json(
        {
          error:
            "Learner photos require confirmed consent before they can be published.",
        },
        { status: 400 }
      );
    }

    const pool = await getConnection();

    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("image_url", sql.NVarChar(1000), image_url.trim())
      .input("title", sql.NVarChar(255), title?.trim() || null)
      .input("caption", sql.NVarChar(1000), caption?.trim() || null)
      .input("alt_text", sql.NVarChar(500), alt_text.trim())
      .input(
        "category",
        sql.NVarChar(100),
        category?.trim() || "School Events"
      )
      .input("photo_type", sql.NVarChar(50), photoType)
      .input("consent_confirmed", sql.Bit, consentConfirmed)
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

    if (result.recordset.length === 0) {
      return NextResponse.json(
        { error: "Gallery image not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Gallery image updated successfully.",
      gallery: result.recordset[0],
    });
  } catch (error) {
    console.error("Admin Gallery PUT error:", error);

    return NextResponse.json(
      { error: "Failed to update gallery image." },
      { status: 500 }
    );
  }
}

// DELETE gallery image
export async function DELETE(req) {
  try {
    await requireAdmin(req);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Gallery image ID is required." },
        { status: 400 }
      );
    }

    const pool = await getConnection();

    const result = await pool
      .request()
      .input("id", sql.Int, parseInt(id))
      .query(`
        DELETE FROM GalleryImages
        WHERE id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json(
        { error: "Gallery image not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Gallery image deleted successfully.",
    });
  } catch (error) {
    console.error("Admin Gallery DELETE error:", error);

    return NextResponse.json(
      { error: "Failed to delete gallery image." },
      { status: 500 }
    );
  }
}