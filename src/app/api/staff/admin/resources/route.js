import { NextResponse } from "next/server";
import { getPostgresConnection } from "@/lib/db-postgres";
import { requireAdmin } from "@/lib/auth";

function handleError(error, operation) {
  console.error(`Learning Resources ${operation} error:`, error);

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

  return NextResponse.json(
    { error: `Failed to ${operation.toLowerCase()} learning resource(s).` },
    { status: 500 }
  );
}

function validateResource(body) {
  const {
    title,
    caption,
    category,
    grade,
    resource_type,
    youtube_url,
    file_url,
  } = body;

  if (
    typeof title !== "string" || !title.trim() ||
    typeof caption !== "string" || !caption.trim() ||
    typeof category !== "string" || !category.trim() ||
    typeof grade !== "string" || !grade.trim() ||
    typeof resource_type !== "string" || !resource_type.trim()
  ) {
    return "Title, caption, topic, grade and resource type are required.";
  }

  if (resource_type.trim() === "Video" && !youtube_url?.trim()) {
    return "A YouTube URL is required for video resources.";
  }

  if (
    resource_type.trim() !== "Video" &&
    !youtube_url?.trim() &&
    !file_url?.trim()
  ) {
    return "Please provide a YouTube URL or upload a document/image for this resource.";
  }

  return null;
}

function resourceValues(body) {
  return [
    body.title.trim(),
    body.caption.trim(),
    typeof body.description === "string" && body.description.trim()
      ? body.description.trim()
      : null,
    body.category.trim(),
    body.grade.trim(),
    body.resource_type.trim(),
    typeof body.youtube_url === "string" && body.youtube_url.trim()
      ? body.youtube_url.trim()
      : null,
    typeof body.file_url === "string" && body.file_url.trim()
      ? body.file_url.trim()
      : null,
    typeof body.thumbnail_url === "string" && body.thumbnail_url.trim()
      ? body.thumbnail_url.trim()
      : null,
    body.is_published === true,
  ];
}

// GET all learning resources
export async function GET(req) {
  try {
    await requireAdmin(req);

    const pool = getPostgresConnection();

    const result = await pool.query(`
      SELECT
        lr.id,
        lr.title,
        lr.caption,
        lr.description,
        lr.category,
        lr.grade,
        lr.resource_type,
        lr.youtube_url,
        lr.file_url,
        lr.thumbnail_url,
        lr.is_published,
        lr.created_by,
        lr.created_at,
        lr.updated_at,
        u.display_name AS created_by_name
      FROM "dbo"."LearningResources" AS lr
      LEFT JOIN "dbo"."Users" AS u
        ON lr.created_by = u.id
      ORDER BY lr.created_at DESC
    `);

    return NextResponse.json({ resources: result.rows });
  } catch (error) {
    return handleError(error, "GET");
  }
}

// POST a new learning resource
export async function POST(req) {
  try {
    const user = await requireAdmin(req);
    const body = await req.json();

    const validationError = validateResource(body);

    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    const pool = getPostgresConnection();
    const values = resourceValues(body);

    const result = await pool.query(
      `
        INSERT INTO "dbo"."LearningResources" (
          title,
          caption,
          description,
          category,
          grade,
          resource_type,
          youtube_url,
          file_url,
          thumbnail_url,
          is_published,
          created_by,
          created_at,
          updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        RETURNING *
      `,
      [...values, user.id]
    );

    return NextResponse.json(
      {
        message: "Learning resource created successfully.",
        resource: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error, "POST");
  }
}

// PUT / edit an existing learning resource
export async function PUT(req) {
  try {
    await requireAdmin(req);
    const body = await req.json();

    const id = Number.parseInt(body.id, 10);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "A valid resource ID is required." },
        { status: 400 }
      );
    }

    const validationError = validateResource(body);

    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    const pool = getPostgresConnection();
    const values = resourceValues(body);

    const result = await pool.query(
      `
        UPDATE "dbo"."LearningResources"
        SET
          title = $1,
          caption = $2,
          description = $3,
          category = $4,
          grade = $5,
          resource_type = $6,
          youtube_url = $7,
          file_url = $8,
          thumbnail_url = $9,
          is_published = $10,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $11
        RETURNING *
      `,
      [...values, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Learning resource not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Learning resource updated successfully.",
      resource: result.rows[0],
    });
  } catch (error) {
    return handleError(error, "PUT");
  }
}

// DELETE a learning resource
export async function DELETE(req) {
  try {
    await requireAdmin(req);

    const { searchParams } = new URL(req.url);
    const rawId = searchParams.get("id");
    const id = Number.parseInt(rawId, 10);

    if (!rawId || !Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "A valid resource ID is required." },
        { status: 400 }
      );
    }

    const pool = getPostgresConnection();

    const result = await pool.query(
      `
        DELETE FROM "dbo"."LearningResources"
        WHERE id = $1
        RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Learning resource not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Learning resource deleted successfully.",
    });
  } catch (error) {
    return handleError(error, "DELETE");
  }
}