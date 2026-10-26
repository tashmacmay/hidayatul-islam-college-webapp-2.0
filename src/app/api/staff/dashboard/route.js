// app/api/staff/dashboard/route.js

import { NextResponse } from "next/server";
import { getPostgresConnection } from "@/lib/db-postgres";
import { verifyUser } from "@/lib/auth";
import {
  initializeGraphForAppOnlyAuth,
  getBookingsAsync,
  getStaffMemberLookupAsync,
  formatParentBooking,
} from "@/lib/graph/graphHelper";

export const runtime = "nodejs";

export async function GET(req) {
  console.log("🔔 GET /api/staff/dashboard called");

  try {
    // ---------------------------------------------------------
    // Verify caller is staff
    // ---------------------------------------------------------

    const user = await verifyUser(req);

    if (user.role !== "staff") {
      return NextResponse.json(
        { error: "Staff access required" },
        { status: 403 }
      );
    }

    console.log("✅ Staff verified:", user.uid);

    // ---------------------------------------------------------
    // BOOKINGS — continue using Microsoft Graph
    // ---------------------------------------------------------

    initializeGraphForAppOnlyAuth();

    const [graphResponse, staffLookup] = await Promise.all([
      getBookingsAsync(),
      getStaffMemberLookupAsync().catch((err) => {
        console.error("Staff lookup fetch failed:", err);
        return null;
      }),
    ]);

    const allBookings = (graphResponse?.value || []).map((booking) =>
      formatParentBooking(booking, staffLookup)
    );

    const now = new Date();

    const bookings = allBookings
      .filter((booking) => {
        if (!booking.startDateTime) return false;
        return new Date(booking.startDateTime) >= now;
      })
      .sort(
        (a, b) =>
          new Date(a.startDateTime) - new Date(b.startDateTime)
      )
      .slice(0, 5);

    console.log(`✅ Found ${bookings.length} upcoming bookings`);

    // ---------------------------------------------------------
    // POSTGRESQL CONNECTION
    // ---------------------------------------------------------

    const pool = getPostgresConnection();

    // ---------------------------------------------------------
    // NOTICES — top 5 published notices
    // ---------------------------------------------------------

    const noticesResult = await pool.query(`
      SELECT
        id,
        title,
        type,
        content,
        grade,
        status,
        created_at
      FROM "dbo"."Notices"
      WHERE status = 'Published'
      ORDER BY created_at DESC
      LIMIT 5
    `);

    // ---------------------------------------------------------
    // RESOURCES COUNT — published learning resources
    // ---------------------------------------------------------

    const resourcesResult = await pool.query(`
      SELECT COUNT(*) AS total
      FROM "dbo"."LearningResources"
      WHERE is_published = TRUE
    `);

    // ---------------------------------------------------------
    // PARENTS COUNT
    // ---------------------------------------------------------

    const parentsResult = await pool.query(`
      SELECT COUNT(*) AS total
      FROM "dbo"."Users"
      WHERE role = 'parent'
    `);

    return NextResponse.json({
      bookings,
      notices: noticesResult.rows,
      resourceCount: Number(resourcesResult.rows[0]?.total ?? 0),
      parentCount: Number(parentsResult.rows[0]?.total ?? 0),
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