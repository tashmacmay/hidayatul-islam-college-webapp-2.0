import { NextResponse } from "next/server";
import sql from "mssql";
import { getConnection } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const NEWS_CATEGORIES = [
  "News",
  "Events",
  "Achievements",
  "Notices",
  "Islamic",
];

// GET /api/staff/admin/news/[slug]
export async function GET(req, { params }) {
  try {
    await requireAdmin(req);

    const slug = decodeURIComponent(params.slug);

    const pool = await getConnection();

    const result = await pool
      .request()
      .input("slug", sql.NVarChar(255), slug)
      .query(`
        SELECT
          n.id,
          n.title,
          n.slug,
          n.category,
          n.excerpt,
          n.content,
          n.featured_image_url,
          n.image_contains_learners,
          n.consent_confirmed,
          n.published,
          n.published_at,
          n.created_by,
          n.created_at,
          n.updated_at,
          u.display_name AS created_by_name
        FROM NewsAnnouncements AS n
        LEFT JOIN Users AS u
          ON n.created_by = u.id
        WHERE n.slug = @slug
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json(
        { error: "News article not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      news: result.recordset[0],
    });
  } catch (error) {
    console.error("Admin News GET by slug error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch news article.",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT /api/staff/admin/news/[slug]
export async function PUT(req, { params }) {
  try {
    const user = await requireAdmin(req);

    const oldSlug = decodeURIComponent(params.slug);
    const body = await req.json();

    const {
      title,
      slug,
      category,
      excerpt,
      content,
      featured_image_url,
      image_contains_learners,
      consent_confirmed,
      published,
    } = body;

    // Required fields
    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Title is required." },
        { status: 400 }
      );
    }

    if (!slug?.trim()) {
      return NextResponse.json(
        { error: "Slug is required." },
        { status: 400 }
      );
    }

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Content is required." },
        { status: 400 }
      );
    }

    // Validate category
    if (!NEWS_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: "Invalid news category." },
        { status: 400 }
      );
    }

    // Normalise image and consent values
    const hasImage = Boolean(featured_image_url?.trim());
    const containsLearners = image_contains_learners === true;
    const consentConfirmed = consent_confirmed === true;
    const isPublished = published === true;

    // Learners cannot be selected if there is no image.
    if (containsLearners && !hasImage) {
      return NextResponse.json(
        {
          error:
            "An image must be provided if the image is marked as containing learners.",
        },
        { status: 400 }
      );
    }

    // Learner images require consent before publishing.
    // Drafts are allowed without consent.
    if (
      hasImage &&
      containsLearners &&
      isPublished &&
      !consentConfirmed
    ) {
      return NextResponse.json(
        {
          error:
            "Images containing learners require confirmed consent before the article can be published.",
        },
        { status: 400 }
      );
    }

    const pool = await getConnection();

    // Find the article being edited
    const existing = await pool
      .request()
      .input("slug", sql.NVarChar(255), oldSlug)
      .query(`
        SELECT id
        FROM NewsAnnouncements
        WHERE slug = @slug
      `);

    if (existing.recordset.length === 0) {
      return NextResponse.json(
        { error: "News article not found." },
        { status: 404 }
      );
    }

    const id = existing.recordset[0].id;

    // Check whether another article already uses the new slug
    const duplicateSlug = await pool
      .request()
      .input("slug", sql.NVarChar(255), slug.trim())
      .input("id", sql.Int, id)
      .query(`
        SELECT id
        FROM NewsAnnouncements
        WHERE slug = @slug
        AND id <> @id
      `);

    if (duplicateSlug.recordset.length > 0) {
      return NextResponse.json(
        {
          error: "Another news article already uses this slug.",
        },
        { status: 409 }
      );
    }

    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("title", sql.NVarChar(255), title.trim())
      .input("slug", sql.NVarChar(255), slug.trim())
      .input("category", sql.NVarChar(50), category)
      .input(
        "excerpt",
        sql.NVarChar(500),
        excerpt?.trim() || null
      )
      .input("content", sql.NVarChar(sql.MAX), content.trim())
      .input(
        "featured_image_url",
        sql.NVarChar(500),
        featured_image_url?.trim() || null
      )
      .input(
        "image_contains_learners",
        sql.Bit,
        containsLearners
      )
      .input(
        "consent_confirmed",
        sql.Bit,
        consentConfirmed
      )
      .input("published", sql.Bit, isPublished)
      .input(
        "published_at",
        sql.DateTime2,
        isPublished ? new Date() : null
      )
      .input("updated_by", sql.Int, user.id)
      .query(`
        UPDATE NewsAnnouncements
        SET
          title = @title,
          slug = @slug,
          category = @category,
          excerpt = @excerpt,
          content = @content,
          featured_image_url = @featured_image_url,
          image_contains_learners = @image_contains_learners,
          consent_confirmed = @consent_confirmed,
          published = @published,
          published_at = @published_at,
          updated_at = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    return NextResponse.json({
      message: "News article updated successfully.",
      news: result.recordset[0],
    });
  } catch (error) {
    console.error("Admin News PUT by slug error:", error);

    return NextResponse.json(
      {
        error: "Failed to update news article.",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE /api/staff/admin/news/[slug]
export async function DELETE(req, { params }) {
  try {
    await requireAdmin(req);

    const slug = decodeURIComponent(params.slug);

    const pool = await getConnection();

    const result = await pool
      .request()
      .input("slug", sql.NVarChar(255), slug)
      .query(`
        DELETE FROM NewsAnnouncements
        WHERE slug = @slug
      `);

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json(
        { error: "News article not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "News article deleted successfully.",
    });
  } catch (error) {
    console.error("Admin News DELETE by slug error:", error);

    return NextResponse.json(
      {
        error: "Failed to delete news article.",
        message: error.message,
      },
      { status: 500 }
    );
  }
}