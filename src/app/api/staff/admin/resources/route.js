import { NextResponse } from "next/server";
import sql from "mssql";
import { getConnection } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// GET all learning resources
export async function GET(req) {
  try {
    await requireAdmin(req);

    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT
        lr.id,
        lr.title,
        lr.caption,
        lr.description,
        lr.category,
        lr.grade,
        lr.resource_type,
        lr.youtube_url,
        lr.is_published,
        lr.created_by,
        lr.created_at,
        lr.updated_at,
        u.display_name AS created_by_name
      FROM LearningResources AS lr
      LEFT JOIN Users AS u
        ON lr.created_by = u.id
      ORDER BY lr.created_at DESC
    `);

    return NextResponse.json({
      resources: result.recordset,
    });
  } catch (error) {
    console.error("Learning Resources GET error:", error);

    return NextResponse.json(
      { error: "Failed to fetch learning resources." },
      { status: 500 }
    );
  }
}

// POST a new learning resource
export async function POST(req) {
  try {
    const user = await requireAdmin(req);

    const body = await req.json();

    const {
      title,
      caption,
      description,
      category,
      grade,
      resource_type,
      youtube_url,
      is_published,
    } = body;

    // Required fields
    if (
      !title ||
      !caption ||
      !category ||
      !grade ||
      !resource_type ||
      !youtube_url
    ) {
      return NextResponse.json(
        {
          error:
            "Title, caption, topic, grade, resource type and YouTube URL are required.",
        },
        { status: 400 }
      );
    }

    const pool = await getConnection();

    const result = await pool
      .request()
      .input("title", sql.NVarChar(200), title.trim())
      .input("caption", sql.NVarChar(500), caption.trim())
      .input(
        "description",
        sql.NVarChar(1000),
        description?.trim() || null
      )
      .input("category", sql.NVarChar(100), category.trim())
      .input("grade", sql.NVarChar(20), grade.trim())
      .input(
        "resource_type",
        sql.NVarChar(50),
        resource_type.trim()
      )
      .input(
        "youtube_url",
        sql.NVarChar(1000),
        youtube_url.trim()
      )
      .input(
        "is_published",
        sql.Bit,
        is_published === true
      )
      .input("created_by", sql.Int, user.id)
      .query(`
        INSERT INTO LearningResources (
          title,
          caption,
          description,
          category,
          grade,
          resource_type,
          youtube_url,
          is_published,
          created_by
        )
        OUTPUT INSERTED.*
        VALUES (
          @title,
          @caption,
          @description,
          @category,
          @grade,
          @resource_type,
          @youtube_url,
          @is_published,
          @created_by
        )
      `);

    return NextResponse.json(
      {
        message: "Learning resource created successfully.",
        resource: result.recordset[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Learning Resources POST error:", error);

    return NextResponse.json(
      { error: "Failed to create learning resource." },
      { status: 500 }
    );
  }
}

// PUT / Edit an existing learning resource
export async function PUT(req) {
  try {
    await requireAdmin(req);

    const body = await req.json();

    const {
      id,
      title,
      caption,
      description,
      category,
      grade,
      resource_type,
      youtube_url,
      is_published,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Resource ID is required." },
        { status: 400 }
      );
    }

    if (
      !title ||
      !caption ||
      !category ||
      !grade ||
      !resource_type ||
      !youtube_url
    ) {
      return NextResponse.json(
        {
          error:
            "Title, caption, topic, grade, resource type and YouTube URL are required.",
        },
        { status: 400 }
      );
    }

    const pool = await getConnection();

    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("title", sql.NVarChar(200), title.trim())
      .input("caption", sql.NVarChar(500), caption.trim())
      .input(
        "description",
        sql.NVarChar(1000),
        description?.trim() || null
      )
      .input("category", sql.NVarChar(100), category.trim())
      .input("grade", sql.NVarChar(20), grade.trim())
      .input(
        "resource_type",
        sql.NVarChar(50),
        resource_type.trim()
      )
      .input(
        "youtube_url",
        sql.NVarChar(1000),
        youtube_url.trim()
      )
      .input(
        "is_published",
        sql.Bit,
        is_published === true
      )
      .query(`
        UPDATE LearningResources
        SET
          title = @title,
          caption = @caption,
          description = @description,
          category = @category,
          grade = @grade,
          resource_type = @resource_type,
          youtube_url = @youtube_url,
          is_published = @is_published,
          updated_at = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json(
        { error: "Learning resource not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Learning resource updated successfully.",
      resource: result.recordset[0],
    });
  } catch (error) {
    console.error("Learning Resources PUT error:", error);

    return NextResponse.json(
      { error: "Failed to update learning resource." },
      { status: 500 }
    );
  }
}

// DELETE a learning resource
export async function DELETE(req) {
  try {
    await requireAdmin(req);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Resource ID is required." },
        { status: 400 }
      );
    }

    const pool = await getConnection();

    const result = await pool
      .request()
      .input("id", sql.Int, parseInt(id))
      .query(`
        DELETE FROM LearningResources
        WHERE id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json(
        { error: "Learning resource not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Learning resource deleted successfully.",
    });
  } catch (error) {
    console.error("Learning Resources DELETE error:", error);

    return NextResponse.json(
      { error: "Failed to delete learning resource." },
      { status: 500 }
    );
  }
}