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

    const pool = await getConnection();

    const result = await pool
      .request()
      .input("slug", sql.NVarChar(255), params.slug)
      .query(`
        SELECT
          id,
          title,
          slug,
          category,
          excerpt,
          content,
          featured_image_url,
          published,
          published_at,
          created_by,
          created_at,
          updated_at
        FROM NewsAnnouncements
        WHERE slug = @slug
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json(
        { error: "News article not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.recordset[0]);
  } catch (error) {
    console.error("GET /api/staff/admin/news/[slug] error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch news article",
        message: error.message,
      },
      {
        status: error.message === "Admin access required" ? 403 : 500,
      }
    );
  }
}


// PUT /api/staff/admin/news/[slug]
export async function PUT(req, { params }) {
  try {
    await requireAdmin(req);

    const body = await req.json();

    const {
      title,
      category,
      excerpt,
      content,
      featured_image_url,
      published,
    } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!content?.trim()) {
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

    const pool = await getConnection();

    const existing = await pool
      .request()
      .input("slug", sql.NVarChar(255), params.slug)
      .query(`
        SELECT *
        FROM NewsAnnouncements
        WHERE slug = @slug
      `);

    if (existing.recordset.length === 0) {
      return NextResponse.json(
        { error: "News article not found" },
        { status: 404 }
      );
    }

    const current = existing.recordset[0];
    const isPublished = Boolean(published);

    let publishedAt = null;

    if (isPublished) {
      // Keep the original publication date if the article
      // was already published.
      publishedAt = current.published_at || new Date();
    }

    const result = await pool
      .request()
      .input("slug", sql.NVarChar(255), params.slug)
      .input("title", sql.NVarChar(255), title.trim())
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
      .input("published", sql.Bit, isPublished)
      .input("published_at", sql.DateTime2, publishedAt)
      .query(`
        UPDATE NewsAnnouncements
        SET
          title = @title,
          category = @category,
          excerpt = @excerpt,
          content = @content,
          featured_image_url = @featured_image_url,
          published = @published,
          published_at = @published_at,
          updated_at = GETDATE()
        OUTPUT INSERTED.*
        WHERE slug = @slug
      `);

    return NextResponse.json({
      success: true,
      article: result.recordset[0],
    });
  } catch (error) {
    console.error("PUT /api/staff/admin/news/[slug] error:", error);

    return NextResponse.json(
      {
        error: "Failed to update news article",
        message: error.message,
      },
      {
        status: error.message === "Admin access required" ? 403 : 500,
      }
    );
  }
}


// DELETE /api/staff/admin/news/[slug]
export async function DELETE(req, { params }) {
  try {
    await requireAdmin(req);

    const pool = await getConnection();

    const result = await pool
      .request()
      .input("slug", sql.NVarChar(255), params.slug)
      .query(`
        DELETE FROM NewsAnnouncements
        OUTPUT DELETED.*
        WHERE slug = @slug
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json(
        { error: "News article not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "News article deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/staff/admin/news/[slug] error:", error);

    return NextResponse.json(
      {
        error: "Failed to delete news article",
        message: error.message,
      },
      {
        status: error.message === "Admin access required" ? 403 : 500,
      }
    );
  }
}