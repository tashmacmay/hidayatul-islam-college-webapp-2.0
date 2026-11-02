import { NextResponse } from "next/server";
import { verifyUser } from "@/lib/auth";
import { getPostgresConnection } from "@/lib/db-postgres";

export async function GET(request) {
  try {
    let user;

    try {
      user = await verifyUser(request);
    } catch (error) {
      return NextResponse.json(
        { error: error.message || "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.role !== "staff" || !user.isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const pool = getPostgresConnection();
    const result = await pool.query(`
      SELECT
        MAX(synced_at) AS synced_at,
        COUNT(*) AS total
      FROM "dbo"."bookings"
    `);

    const row = result.rows[0];

    return NextResponse.json({
      syncedAt: row.synced_at
        ? new Date(row.synced_at).toISOString()
        : null,
      total: Number(row.total),
    });
  } catch (error) {
    console.error("LAST SYNC ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve sync status" },
      { status: 500 }
    );
  }
}
