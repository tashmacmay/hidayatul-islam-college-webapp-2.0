import { NextResponse } from "next/server";
import { GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getPostgresConnection } from "@/lib/db-postgres";
import { requireAdmin } from "@/lib/auth";
import { getS3Client, STORAGE_BUCKET } from "@/lib/object-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GALLERY_KEY_PATTERN =
  /^gallery\/[a-f0-9-]+\.(?:png|jpg|webp)$/i;

async function signGalleryImage(item) {
  const key = item.image_url || "";

  if (!GALLERY_KEY_PATTERN.test(key)) {
    return { ...item, preview_url: null };
  }

  const previewUrl = await getSignedUrl(
    getS3Client(),
    new GetObjectCommand({
      Bucket: STORAGE_BUCKET,
      Key: key,
    }),
    { expiresIn: 300 }
  );

  // Keep image_url as the persistent object key.
  // preview_url is temporary and only returned by the admin API.
  return { ...item, preview_url: previewUrl };
}

// GET all gallery images (admin only)
export async function GET(req) {
  try {
    await requireAdmin(req);

    const pool = getPostgresConnection();

    const result = await pool.query(`
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
      FROM "dbo"."GalleryImages" AS g
      LEFT JOIN "dbo"."Users" AS u
        ON g.uploaded_by = u.id
      ORDER BY g.created_at DESC
    `);

    const gallery = await Promise.all(
      result.rows.map((item) => signGalleryImage(item))
    );

    return NextResponse.json({ gallery });
  } catch (error) {
    console.error("Admin Gallery GET error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to fetch gallery images." },
      { status: error.statusCode || 500 }
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

    if (
      typeof image_url !== "string" ||
      !GALLERY_KEY_PATTERN.test(image_url.trim())
    ) {
      return NextResponse.json(
        { error: "A valid gallery image is required." },
        { status: 400 }
      );
    }

    if (typeof alt_text !== "string" || !alt_text.trim()) {
      return NextResponse.json(
        { error: "Alt text is required." },
        { status: 400 }
      );
    }

    const photoType = photo_type?.trim().toLowerCase() || "general";
    const consentConfirmed = consent_confirmed === true;
    const isPublished = published === true;

    if (
      photoType === "learners" &&
      isPublished &&
      !consentConfirmed
    ) {
      return NextResponse.json(
        {
          error:
            "Learner photos require confirmed consent before they can be published.",
        },
        { status: 400 }
      );
    }

    const pool = getPostgresConnection();

    const result = await pool.query(
      `
        INSERT INTO "dbo"."GalleryImages" (
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
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `,
      [
        image_url.trim(),
        title?.trim() || null,
        caption?.trim() || null,
        alt_text.trim(),
        category?.trim() || "School Events",
        consentConfirmed,
        isPublished,
        user.id,
        photoType,
      ]
    );

    const galleryImage = await signGalleryImage(result.rows[0]);

    return NextResponse.json(
      {
        message: "Gallery image uploaded successfully.",
        gallery: galleryImage,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin Gallery POST error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to create gallery image." },
      { status: error.statusCode || 500 }
    );
  }
}

// PUT update gallery image
export async function PUT(req) {
  try {
    await requireAdmin(req);
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

    if (!id || !Number.isSafeInteger(Number(id)) || Number(id) <= 0) {
      return NextResponse.json(
        { error: "A valid gallery image ID is required." },
        { status: 400 }
      );
    }

    if (
      typeof image_url !== "string" ||
      !GALLERY_KEY_PATTERN.test(image_url.trim())
    ) {
      return NextResponse.json(
        { error: "A valid gallery image is required." },
        { status: 400 }
      );
    }

    if (typeof alt_text !== "string" || !alt_text.trim()) {
      return NextResponse.json(
        { error: "Alt text is required." },
        { status: 400 }
      );
    }

    const photoType = photo_type?.trim().toLowerCase() || "general";
    const consentConfirmed = consent_confirmed === true;
    const isPublished = published === true;

    if (
      photoType === "learners" &&
      isPublished &&
      !consentConfirmed
    ) {
      return NextResponse.json(
        {
          error:
            "Learner photos require confirmed consent before they can be published.",
        },
        { status: 400 }
      );
    }

    const pool = getPostgresConnection();

    const result = await pool.query(
      `
        UPDATE "dbo"."GalleryImages"
        SET
          image_url = $1,
          title = $2,
          caption = $3,
          alt_text = $4,
          category = $5,
          photo_type = $6,
          consent_confirmed = $7,
          published = $8,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $9
        RETURNING *
      `,
      [
        image_url.trim(),
        title?.trim() || null,
        caption?.trim() || null,
        alt_text.trim(),
        category?.trim() || "School Events",
        photoType,
        consentConfirmed,
        isPublished,
        Number(id),
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Gallery image not found." },
        { status: 404 }
      );
    }

    const galleryImage = await signGalleryImage(result.rows[0]);

    return NextResponse.json({
      message: "Gallery image updated successfully.",
      gallery: galleryImage,
    });
  } catch (error) {
    console.error("Admin Gallery PUT error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to update gallery image." },
      { status: error.statusCode || 500 }
    );
  }
}

// DELETE gallery image and its private object
export async function DELETE(req) {
  try {
    await requireAdmin(req);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !/^\d+$/.test(id) || Number(id) <= 0) {
      return NextResponse.json(
        { error: "A valid gallery image ID is required." },
        { status: 400 }
      );
    }

    const pool = getPostgresConnection();

    const result = await pool.query(
      `
        SELECT image_url
        FROM "dbo"."GalleryImages"
        WHERE id = $1
        LIMIT 1
      `,
      [Number(id)]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Gallery image not found." },
        { status: 404 }
      );
    }

    const key = result.rows[0].image_url;

    // Delete only validated keys within the gallery folder.
    if (typeof key === "string" && GALLERY_KEY_PATTERN.test(key)) {
      await getS3Client().send(
        new DeleteObjectCommand({
          Bucket: STORAGE_BUCKET,
          Key: key,
        })
      );
    }

    await pool.query(
      `
        DELETE FROM "dbo"."GalleryImages"
        WHERE id = $1
      `,
      [Number(id)]
    );

    return NextResponse.json({
      message: "Gallery image deleted successfully.",
    });
  } catch (error) {
    console.error("Admin Gallery DELETE error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to delete gallery image." },
      { status: error.statusCode || 500 }
    );
  }
}
