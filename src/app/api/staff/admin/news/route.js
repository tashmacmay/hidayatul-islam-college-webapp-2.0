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

// GET /api/staff/admin/news
// Returns all news articles, including drafts.
export async function GET(req) {
  try {
    await requireAdmin(req);

    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT
        id,
        title,
        slug,
        category,
        excerpt,
        content,
        featured_image_url,
        image_contains_learners,
        consent_confirmed,
        published,
        published_at,
        created_by,
        created_at,
        updated_at
      FROM NewsAnnouncements
      ORDER BY created_at DESC
    `);

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error("GET /api/staff/admin/news error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch news articles",
        message: error.message,
      },
      {
        status: error.message === "Admin access required" ? 403 : 500,
      }
    );
  }
}

// POST /api/staff/admin/news
// Creates a new news article.
export async function POST(req) {
  try {
    const user = await requireAdmin(req);
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
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!slug?.trim()) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      );
    }

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Validate category
    if (!NEWS_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: "Invalid news category" },
        { status: 400 }
      );
    }

    // Normalise image and consent values
    const hasImage = Boolean(featured_image_url?.trim());
    const containsLearners = image_contains_learners === true;
    const consentConfirmed = consent_confirmed === true;
    const isPublished = published === true;

    // Learners cannot be marked as present if there is no image.
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
    // Drafts are allowed without consent so they can be completed later.
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

    // Check if slug already exists
const existing = await pool
  .request()
  .input("slug", sql.NVarChar(255), slug.trim())
  .query(`
    SELECT id
    FROM NewsAnnouncements
    WHERE slug = @slug
  `);

    if (existing.recordset.length > 0) {
      return NextResponse.json(
        {
          error: "A news article with this slug already exists",
        },
        { status: 409 }
      );
    }

    const result = await pool
      .request()
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
      .input("created_by", sql.Int, user.id)
      .query(`
        INSERT INTO NewsAnnouncements (
          title,
          slug,
          category,
          excerpt,
          content,
          featured_image_url,
          image_contains_learners,
          consent_confirmed,
          published,
          published_at,
          created_by
        )
        OUTPUT INSERTED.*
        VALUES (
          @title,
          @slug,
          @category,
          @excerpt,
          @content,
          @featured_image_url,
          @image_contains_learners,
          @consent_confirmed,
          @published,
          @published_at,
          @created_by
        )
      `);

    return NextResponse.json(
      {
        success: true,
        article: result.recordset[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/staff/admin/news error:", error);

    return NextResponse.json(
      {
        error: "Failed to create news article",
        message: error.message,
      },
      {
        status: error.message === "Admin access required" ? 403 : 500,
      }
    );
  }
}