import { NextResponse } from "next/server";

import { verifyUser } from "@/lib/auth";
import { getPostgresConnection } from "@/lib/db-postgres";
import {
  initializeGraphForAppOnlyAuth,
  getBookingsAsync,
  getStaffMemberLookupAsync,
  formatStaffBooking,
  cancelBookingAsync,
} from "@/lib/graph/graphHelper";

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

    initializeGraphForAppOnlyAuth();

    const [response, staffLookup] = await Promise.all([
      getBookingsAsync(),
      getStaffMemberLookupAsync().catch(() => null),
    ]);

    // Admin sees every booking returned by Microsoft Graph.
    const bookings = response.value.map((booking) =>
      formatStaffBooking(booking, staffLookup)
    );

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("ADMIN BOOKINGS ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to retrieve Microsoft Bookings",
        message: error.message,
      },
      { status: error.statusCode || 500 }
    );
  }
}

// Cancel path:
// 1. Find the booking in the PostgreSQL mirror.
// 2. Cancel it through Microsoft Graph.
// 3. Update the PostgreSQL mirror only after Graph succeeds.
export async function DELETE(request, { params }) {
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

    const { id: bookingId } = await params;

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    const pool = getPostgresConnection();

    const lookupResult = await pool.query(
      `
        SELECT id, status, ms_booking_id
        FROM "dbo"."bookings"
        WHERE ms_booking_id = $1
      `,
      [bookingId]
    );

    const booking = lookupResult.rows[0];

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    if (String(booking.status).toLowerCase() === "cancelled") {
      return NextResponse.json({
        success: true,
        alreadyCancelled: true,
      });
    }

    // Cancel the appointment in Microsoft Graph first.
    try {
      initializeGraphForAppOnlyAuth();
      await cancelBookingAsync(bookingId);
    } catch (error) {
      console.error("MICROSOFT GRAPH CANCELLATION ERROR:", error);

      return NextResponse.json(
        {
          error: "Microsoft Graph cancellation failed",
          details: error.message,
        },
        { status: 500 }
      );
    }

    // Update PostgreSQL only after Graph cancellation succeeds.
    await pool.query(
      `
        UPDATE "dbo"."bookings"
        SET
          status = 'Cancelled',
          cancelled_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP,
          synced_at = CURRENT_TIMESTAMP
        WHERE ms_booking_id = $1
      `,
      [bookingId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ADMIN BOOKING CANCELLATION ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Failed to cancel booking" },
      { status: error.statusCode || 500 }
    );
  }
}
