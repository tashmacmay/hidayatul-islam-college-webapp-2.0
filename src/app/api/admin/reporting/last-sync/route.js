import { NextResponse } from "next/server";

import { verifyUser } from "@/lib/auth";
import { getConnection } from "@/lib/db";

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

    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT
        MAX(synced_at) AS synced_at,
        COUNT(*) AS total
      FROM dbo.bookings
    `);
    const row = result.recordset[0];

    return NextResponse.json({
      syncedAt: row.synced_at ? new Date(row.synced_at).toISOString() : null,
      total: row.total,
    });
  } catch (error) {
    console.error("LAST SYNC ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve sync status" },
      { status: 500 }
    );
  }
}
