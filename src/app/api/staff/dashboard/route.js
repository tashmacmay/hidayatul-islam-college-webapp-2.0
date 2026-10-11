// app/api/staff/dashboard/route.js

import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
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
    // BOOKINGS — from Microsoft Graph (same source as
    // /api/bookings and the parent dashboard)
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
      .filter((b) => {
        if (!b.startDateTime) return false;
        return new Date(b.startDateTime) >= now;
      })
      .sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime))
      .slice(0, 5);

    console.log(`✅ Found ${bookings.length} bookings for today`);

    // ---------------------------------------------------------
    // NOTICES — same source as /api/notices (top 5, published)
    // ---------------------------------------------------------

    const pool = await getConnection();

    const noticesResult = await pool.request().query(`
      SELECT TOP 5
        id,
        title,
        type,
        content,
        grade,
        status,
        created_at
      FROM dbo.Notices
      WHERE status = 'Published'
      ORDER BY created_at DESC
    `);

    // ---------------------------------------------------------
    // RESOURCES COUNT — same table as /api/resources
    // ---------------------------------------------------------

    const resourcesResult = await pool.request().query(`
      SELECT COUNT(*) AS total
      FROM LearningResources
      WHERE is_published = 1
    `);

    // ---------------------------------------------------------
    // PARENTS COUNT
    // ---------------------------------------------------------

    const parentsResult = await pool.request().query(`
      SELECT COUNT(*) AS total
      FROM Users
      WHERE role = 'parent'
    `);

    return NextResponse.json({
      bookings,
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