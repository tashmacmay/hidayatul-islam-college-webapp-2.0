import { NextResponse } from "next/server";
import { getPostgresConnection } from "@/lib/db-postgres";
import { requireAdmin } from "@/lib/auth";

export async function GET(request) {
  try {
    await requireAdmin(request);

    const pool = getPostgresConnection();

    const result = await pool.query(`
      SELECT
        id,
        firebase_uid,
        email,
        display_name,
        role,
        is_admin,
        created_at,
        updated_at
      FROM "dbo"."Users"
      ORDER BY display_name ASC NULLS LAST, email ASC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("GET /api/users error:", error);

    const status =
      error.statusCode ||
      (error.message === "Forbidden" ? 403 :
       error.message === "Unauthorized" ? 401 : 500);

    return NextResponse.json(
      { error: status === 500 ? "Failed to fetch users." : error.message },
      { status }
    );
  }
}
