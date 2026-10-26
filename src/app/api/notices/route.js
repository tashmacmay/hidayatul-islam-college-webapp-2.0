import { NextResponse } from "next/server";
import { getPostgresConnection } from "@/lib/db-postgres";
import { verifyUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req) {
  try {
    await verifyUser(req);

    const url = new URL(req.url);
    const search = url.searchParams.get("search");
    const grade = url.searchParams.get("grade");

    const pool = getPostgresConnection();

    let query = `
      SELECT
        id,
        title,
        type,
        content,
        grade,
        status,
        scheduled_for,
        created_at,
        updated_at,
        published_at
      FROM "dbo"."Notices"
      WHERE status = 'Published'
    `;

    const values = [];

    if (grade && grade !== "All") {
      values.push(grade);
      query += `
        AND (
          grade = $${values.length}
          OR grade = 'All Grades'
        )
      `;
    }

    if (search?.trim()) {
      values.push(`%${search.trim()}%`);
      query += `
        AND (
          title ILIKE $${values.length}
          OR content ILIKE $${values.length}
          OR type ILIKE $${values.length}
          OR grade ILIKE $${values.length}
        )
      `;
    }

    query += `
      ORDER BY published_at DESC NULLS LAST, created_at DESC
    `;

    const result = await pool.query(query, values);

    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("GET /api/notices error:", err);

    return NextResponse.json(
      { error: "Failed to fetch notices" },
      { status: 500 }
    );
  }
}
