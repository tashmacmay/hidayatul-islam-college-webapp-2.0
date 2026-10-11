import { NextResponse } from "next/server";
import sql from "mssql";

import { verifyUser } from "@/lib/auth";
import { getConnection } from "@/lib/db";
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

    //No filter — admin sees every booking
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
//   1. Call Microsoft Graph to cancel the appointment.
//   2. Only if Graph succeeds, mark the mirror row as cancelled.
// This keeps the SQL mirror consistent with Graph.
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

    const bookingId = params.id;
    const pool = await getConnection();
    const lookupResult = await pool
      .request()
      .input("id", sql.NVarChar, bookingId)
      .query(`
        SELECT id, status, ms_booking_id
        FROM dbo.bookings
        WHERE ms_booking_id = @id
      `);

    const booking = lookupResult.recordset[0];
    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    if (String(booking.status).toLowerCase() === "cancelled") {
      return NextResponse.json({ success: true, alreadyCancelled: true });
    }

    try {
      initializeGraphForAppOnlyAuth();
      await cancelBookingAsync(bookingId);
    } catch (error) {
      return NextResponse.json(
        {
          error: "Microsoft Graph cancellation failed",
          details: error.message,
        },
        { status: 500 }
      );
    }

    await pool
      .request()
      .input("id", sql.NVarChar, bookingId)
      .query(`
        UPDATE dbo.bookings
        SET
          status = 'Cancelled',
          cancelled_at = GETDATE(),
          updated_at = GETDATE(),
          synced_at = GETDATE()
        WHERE ms_booking_id = @id
      `);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ADMIN BOOKING CANCELLATION ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cancel booking" },
      { status: error.statusCode || 500 }
    );
  }
}