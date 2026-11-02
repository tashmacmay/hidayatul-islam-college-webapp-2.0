import { NextResponse } from "next/server";
import {
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getPostgresConnection } from "@/lib/db-postgres";
import { getS3Client, STORAGE_BUCKET } from "@/lib/object-storage";
import { requireAdmin } from "@/lib/auth";

const NEWS_CATEGORIES = [
  "News",
  "Events",
  "Achievements",
  "Notices",
  "Islamic",
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

async function deleteNewsObject(objectKey) {
  if (!isNewsObjectKey(objectKey)) return;

  await getS3Client().send(
    new DeleteObjectCommand({
      Bucket: STORAGE_BUCKET,
      Key: objectKey,
    })
  );
}

function errorResponse(error, operation) {
  console.error(`${operation} error:`, error);

  if (error?.statusCode === 401 || error?.status === 401) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (
    error?.statusCode === 403 ||
    error?.status === 403 ||
    error?.message === "Admin access required" ||
    error?.message === "Forbidden"
  ) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  if (error?.code === "23505") {
    return NextResponse.json(
      { error: "Another news article already uses this slug." },
      { status: 409 }
    );
  }

  return NextResponse.json(
    {
      error: `Failed to ${operation.toLowerCase()}.`,
      message: error?.message || "An unexpected error occurred.",
    },
    { status: 500 }
  );
}

async function getSlug(params) {
  const resolvedParams = await params;
  return decodeURIComponent(resolvedParams.slug);
}

// GET /api/staff/admin/news/[slug]
export async function GET(req, { params }) {
  try {
    await requireAdmin(req);

    const slug = await getSlug(params);
    const pool = getPostgresConnection();

    const result = await pool.query(
      `
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
        FROM "dbo"."NewsAnnouncements" AS n
        LEFT JOIN "dbo"."Users" AS u
          ON n.created_by = u.id
        WHERE n.slug = $1
        LIMIT 1
      `,
      [slug]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "News article not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      news: await addPreviewUrl(result.rows[0]),
    });
  } catch (error) {
    return errorResponse(error, "GET news article");
  }
}

// PUT /api/staff/admin/news/[slug]
export async function PUT(req, { params }) {
  try {
    await requireAdmin(req);

    const oldSlug = await getSlug(params);
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
        { error: "Title is required." },
        { status: 400 }
      );
    }

    if (typeof slug !== "string" || !slug.trim()) {
      return NextResponse.json(
        { error: "Slug is required." },
        { status: 400 }
      );
    }

    if (typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "Content is required." },
        { status: 400 }
      );
    }

    if (!NEWS_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: "Invalid news category." },
        { status: 400 }
      );
    }

    const hasImage =
      typeof featured_image_url === "string" &&
      Boolean(featured_image_url.trim());

    const newImageKey = hasImage ? featured_image_url.trim() : null;
    const containsLearners = image_contains_learners === true;
    const consentConfirmed = consent_confirmed === true;
    const isPublished = published === true;

    if (hasImage && !isNewsObjectKey(newImageKey)) {
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

    const existing = await pool.query(
      `
        SELECT id, published_at, featured_image_url
        FROM "dbo"."NewsAnnouncements"
        WHERE slug = $1
        LIMIT 1
      `,
      [oldSlug]
    );

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { error: "News article not found." },
        { status: 404 }
      );
    }

    const existingArticle = existing.rows[0];
    const id = existingArticle.id;
    const oldImageKey = existingArticle.featured_image_url;
    const newSlug = slug.trim();

    const duplicateSlug = await pool.query(
      `
        SELECT id
        FROM "dbo"."NewsAnnouncements"
        WHERE slug = $1
          AND id <> $2
        LIMIT 1
      `,
      [newSlug, id]
    );

    if (duplicateSlug.rows.length > 0) {
      return NextResponse.json(
        { error: "Another news article already uses this slug." },
        { status: 409 }
      );
    }

    const result = await pool.query(
      `
        UPDATE "dbo"."NewsAnnouncements"
        SET
          title = $1,
          slug = $2,
          category = $3,
          excerpt = $4,
          content = $5,
          featured_image_url = $6,
          image_contains_learners = $7,
          consent_confirmed = $8,
          published = $9,
          published_at = CASE
            WHEN $9 = TRUE
              THEN COALESCE(published_at, CURRENT_TIMESTAMP)
            ELSE NULL
          END,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
        RETURNING *
      `,
      [
        title.trim(),
        newSlug,
        category,
        typeof excerpt === "string" && excerpt.trim()
          ? excerpt.trim()
          : null,
        content.trim(),
        newImageKey,
        containsLearners,
        consentConfirmed,
        isPublished,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "News article not found." },
        { status: 404 }
      );
    }

    // Remove the old object only after the database update succeeds.
    // Never delete an object if the article still references that same key.
    if (
      isNewsObjectKey(oldImageKey) &&
      oldImageKey !== newImageKey
    ) {
      try {
        await deleteNewsObject(oldImageKey);
      } catch (storageError) {
        console.error(
          "Failed to delete replaced news image:",
          storageError
        );
        // The article update has succeeded. Log the orphaned object
        // for later cleanup rather than reporting the update as failed.
      }
    }

    return NextResponse.json({
      message: "News article updated successfully.",
      news: await addPreviewUrl(result.rows[0]),
    });
  } catch (error) {
    return errorResponse(error, "PUT news article");
  }
}

// DELETE /api/staff/admin/news/[slug]
export async function DELETE(req, { params }) {
  try {
    await requireAdmin(req);

    const slug = await getSlug(params);
    const pool = getPostgresConnection();

    const existing = await pool.query(
      `
        SELECT id, featured_image_url
        FROM "dbo"."NewsAnnouncements"
        WHERE slug = $1
        LIMIT 1
      `,
      [slug]
    );

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { error: "News article not found." },
        { status: 404 }
      );
    }

    const article = existing.rows[0];
    const imageKey = article.featured_image_url;

    // Delete a valid private-storage object before removing the DB row.
    // If storage deletion fails, keep the article record intact.
    if (isNewsObjectKey(imageKey)) {
      await deleteNewsObject(imageKey);
    }

    const result = await pool.query(
      `
        DELETE FROM "dbo"."NewsAnnouncements"
        WHERE id = $1
        RETURNING id
      `,
      [article.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "News article not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "News article deleted successfully.",
    });
  } catch (error) {
    return errorResponse(error, "DELETE news article");
  }
}
