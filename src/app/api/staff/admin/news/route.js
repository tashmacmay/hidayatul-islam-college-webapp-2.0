import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getPostgresConnection } from "@/lib/db-postgres";
import { getS3Client, STORAGE_BUCKET } from "@/lib/object-storage";
import { requireAdmin } from "@/lib/auth";

const NEWS_CATEGORIES = [
  "News",
  "Announcements",
  "Events",
  "Achievements",
  "Islamic Life",
];

const SIGNED_URL_EXPIRY_SECONDS = 300;

function isNewsObjectKey(value) {
  return (
    typeof value === "string" &&
    /^news\/[a-f0-9-]+\.(?:png|jpg|webp)$/i.test(value)
  );
}

async function addPreviewUrl(article) {
  if (!article || !isNewsObjectKey(article.featured_image_url)) {
    return {
      ...article,
      preview_url: null,
    };
  }

  const previewUrl = await getSignedUrl(
    getS3Client(),
    new GetObjectCommand({
      Bucket: STORAGE_BUCKET,
      Key: article.featured_image_url,
    }),
    { expiresIn: SIGNED_URL_EXPIRY_SECONDS }
  );

  return {
    ...article,
    preview_url: previewUrl,
  };
}

// GET /api/staff/admin/news
// Returns all news articles, including drafts.
export async function GET(req) {
  try {
    await requireAdmin(req);

    const pool = getPostgresConnection();

    const result = await pool.query(`
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
      FROM "dbo"."NewsAnnouncements"
      ORDER BY created_at DESC
    `);

    const articles = await Promise.all(
      result.rows.map(addPreviewUrl)
    );

    return NextResponse.json(articles);
  } catch (error) {
    console.error("GET /api/staff/admin/news error:", error);

    const status =
      error.statusCode ||
      (error.message === "Admin access required" ||
      error.message === "Forbidden"
        ? 403
        : error.message === "Unauthorized"
          ? 401
          : 500);

    return NextResponse.json(
      {
        error:
          status === 401 || status === 403
            ? error.message
            : "Failed to fetch news articles",
        ...(status === 500 ? { message: error.message } : {}),
      },
      { status }
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

    if (typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (typeof slug !== "string" || !slug.trim()) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      );
    }

    if (typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    if (!NEWS_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: "Invalid news category" },
        { status: 400 }
      );
    }

    const hasImage =
      typeof featured_image_url === "string" &&
      Boolean(featured_image_url.trim());

    const containsLearners = image_contains_learners === true;
    const consentConfirmed = consent_confirmed === true;
    const isPublished = published === true;

    if (
      hasImage &&
      !isNewsObjectKey(featured_image_url.trim())
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid news image reference. Please upload the image again.",
        },
        { status: 400 }
      );
    }

    if (containsLearners && !hasImage) {
      return NextResponse.json(
        {
          error:
            "An image must be provided if the image is marked as containing learners.",
        },
        { status: 400 }
      );
    }

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

    const pool = getPostgresConnection();
    const articleSlug = slug.trim();

    const existing = await pool.query(
      `
        SELECT id
        FROM "dbo"."NewsAnnouncements"
        WHERE slug = $1
        LIMIT 1
      `,
      [articleSlug]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "A news article with this slug already exists" },
        { status: 409 }
      );
    }

    const result = await pool.query(
      `
        INSERT INTO "dbo"."NewsAnnouncements" (
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
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          CASE WHEN $9 = TRUE THEN CURRENT_TIMESTAMP ELSE NULL END,
          $10
        )
        RETURNING *
      `,
      [
        title.trim(),
        articleSlug,
        category,
        typeof excerpt === "string" ? excerpt.trim() || null : null,
        content.trim(),
        hasImage ? featured_image_url.trim() : null,
        containsLearners,
        consentConfirmed,
        isPublished,
        user.id,
      ]
    );

    const article = await addPreviewUrl(result.rows[0]);

    return NextResponse.json(
      {
        success: true,
        article,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/staff/admin/news error:", error);

    if (error.code === "23505") {
      return NextResponse.json(
        { error: "A news article with this slug already exists" },
        { status: 409 }
      );
    }

    const status =
      error.statusCode ||
      (error.message === "Admin access required" ||
      error.message === "Forbidden"
        ? 403
        : error.message === "Unauthorized"
          ? 401
          : 500);

    return NextResponse.json(
      {
        error:
          status === 401 || status === 403
            ? error.message
            : "Failed to create news article",
        ...(status === 500 ? { message: error.message } : {}),
      },
      { status }
    );
  }
}
