import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

import { verifyUser } from "@/lib/auth";

function formatDate(date) {
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}/${String(date.getDate()).padStart(2, "0")}`;
}

function formatTime(date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
}

function normalizeStatus(status) {
  const normalized = String(status || "").toLowerCase();
  return normalized === "cancelled" ? "cancelled" : normalized;
}

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
        ms_booking_id,
        reference,
        start_at,
        end_at,
        appointment_type,
        learner_name,
        staff_name,
        status,
        customer_name,
        customer_email
      FROM dbo.bookings
      ORDER BY start_at DESC
    `);

    const bookings = result.recordset.map((booking) => {
      const start = new Date(booking.start_at);
      const end = new Date(booking.end_at);

      return {
        id: booking.ms_booking_id,
        ref: booking.reference,
        date: formatDate(start),
        startDateTime: start.toISOString(),
        time: `${formatTime(start)} - ${formatTime(end)}`,
        appointmentType: booking.appointment_type,
        learner: booking.learner_name,
        staff: booking.staff_name,
        status: normalizeStatus(booking.status),
        parentName: booking.customer_name,
        parentEmail: booking.customer_email,
      };
    });

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