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

    const { searchParams } = new URL(request.url);
    const fromStr = searchParams.get("from");
    const toStr = searchParams.get("to");

    const isValidDate = (value) => {
      if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

      const date = new Date(`${value}T00:00:00Z`);
      return !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value;
    };

    if (fromStr && !isValidDate(fromStr)) {
      return NextResponse.json(
        { error: "Invalid 'from' date. Expected YYYY-MM-DD." },
        { status: 400 }
      );
    }

    if (toStr && !isValidDate(toStr)) {
      return NextResponse.json(
        { error: "Invalid 'to' date. Expected YYYY-MM-DD." },
        { status: 400 }
      );
    }

    if (fromStr && toStr && fromStr > toStr) {
      return NextResponse.json(
        { error: "'from' must be on or before 'to'." },
        { status: 400 }
      );
    }

    const pool = getPostgresConnection();
    const conditions = [];
    const values = [];

    if (fromStr) {
      values.push(new Date(`${fromStr}T00:00:00.000Z`));
      conditions.push(`start_at >= $${values.length}`);
    }

    if (toStr) {
      const exclusiveEnd = new Date(`${toStr}T00:00:00.000Z`);
      exclusiveEnd.setUTCDate(exclusiveEnd.getUTCDate() + 1);
      values.push(exclusiveEnd);
      conditions.push(`start_at < $${values.length}`);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const result = await pool.query(
      `
        SELECT
          id,
          reference,
          customer_name,
          customer_email,
          learner_name,
          staff_name,
          appointment_type,
          start_at,
          end_at,
          status,
          cancelled_at,
          synced_at,
          ms_booking_id
        FROM "dbo"."bookings"
        ${whereClause}
        ORDER BY start_at DESC
      `,
      values
    );

    return NextResponse.json({ bookings: result.rows });
  } catch (error) {
    console.error("REPORTING BOOKINGS ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve bookings" },
      { status: 500 }
    );
  }
}
