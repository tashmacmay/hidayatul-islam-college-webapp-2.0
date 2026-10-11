import { NextResponse } from "next/server";
import sql from "mssql";

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

    const { searchParams } = new URL(request.url);
    const fromStr = searchParams.get("from");
    const toStr = searchParams.get("to");
    const isValidDate = (s) => s && /^\d{4}-\d{2}-\d{2}$/.test(s);

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

    const pool = await getConnection();
    const req = pool.request();
    let whereClause = "";

    if (fromStr) {
      req.input("from", sql.DateTime2, new Date(`${fromStr}T00:00:00Z`));
      whereClause += " AND start_at >= @from";
    }

    if (toStr) {
      const toDate = new Date(`${toStr}T00:00:00Z`);
      toDate.setUTCDate(toDate.getUTCDate() + 1);
      req.input("to", sql.DateTime2, toDate);
      whereClause += " AND start_at < @to";
    }

    const result = await req.query(`
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
      FROM dbo.bookings
      WHERE 1=1${whereClause}
      ORDER BY start_at DESC
    `);

    return NextResponse.json({ bookings: result.recordset });
  } catch (error) {
    console.error("REPORTING BOOKINGS ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve bookings" },
      { status: 500 }
    );
  }
}
