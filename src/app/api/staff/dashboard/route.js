import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import { verifyUser } from "@/lib/auth";
import sql from "mssql";

export async function GET(req) {
  try {
    const user = await verifyUser(req);

    // Only staff/admin users should access the staff dashboard
    if (user.role !== "staff") {
      return NextResponse.json(
        { error: "Staff access required" },
        { status: 403 }
      );
    }

    const pool = await getConnection();

    // --------------------------------------------------
    // BOOKINGS TODAY
    // --------------------------------------------------

    const bookingsResult = await pool.request().query(`
      SELECT
        id,
        title,
        booking_date,
        start_time,
        end_time,
        status
      FROM Bookings
      WHERE CAST(booking_date AS DATE) = CAST(GETDATE() AS DATE)
      ORDER BY start_time ASC
    `);

    // --------------------------------------------------
    // NOTICES
    // --------------------------------------------------

    const noticesResult = await pool.request().query(`
      SELECT TOP 5
        id,
        title,
        category,
        status,
        created_at
      FROM Notices
      WHERE status = 'Published'
      ORDER BY created_at DESC
    `);

    // --------------------------------------------------
    // RESOURCE COUNT
    // --------------------------------------------------

    const resourcesResult = await pool.request().query(`
      SELECT COUNT(*) AS total
      FROM Resources
    `);

    // --------------------------------------------------
    // PARENT COUNT
    // --------------------------------------------------

    const parentsResult = await pool.request().query(`
      SELECT COUNT(*) AS total
      FROM Users
      WHERE role = 'parent'
    `);

    return NextResponse.json({
      bookings: bookingsResult.recordset,
      notices: noticesResult.recordset,
      resourceCount: resourcesResult.recordset[0]?.total || 0,
      parentCount: parentsResult.recordset[0]?.total || 0,
    });

  } catch (error) {
    console.error("❌ Staff dashboard error:", error);

    return NextResponse.json(
      {
        error: "Failed to load staff dashboard",
        details: error.message,
      },
      { status: 500 }
    );
  }
}