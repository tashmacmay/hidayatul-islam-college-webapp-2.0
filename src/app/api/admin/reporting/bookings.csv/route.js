// src/app/api/admin/reporting/bookings.csv/route.js
import { NextResponse } from "next/server";
import sql from "mssql";
import { verifyUser } from "@/lib/auth";
import { getConnection } from "@/lib/db";

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toSast(utcDate) {
  if (!utcDate) return "";
  const d = new Date(utcDate);
  if (isNaN(d.getTime())) return "";
  // SAST = UTC + 2 hours, no DST
  const sast = new Date(d.getTime() + 2 * 60 * 60 * 1000);
  return sast.toISOString().replace("T", " ").slice(0, 16);
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

    // Optional date range: ?from=YYYY-MM-DD&to=YYYY-MM-DD
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
        synced_at
      FROM dbo.bookings
      WHERE 1=1${whereClause}
      ORDER BY start_at DESC
    `);

    const headers = [
      "Reference",
      "Parent Name",
      "Parent Email",
      "Learner",
      "Staff",
      "Appointment Type",
      "Start (SAST)",
      "End (SAST)",
      "Status",
      "Cancelled At (SAST)",
      "Last Synced",
    ];

    const lines = [headers.join(",")];

    for (const row of result.recordset) {
      lines.push([
        csvEscape(row.reference),
        csvEscape(row.customer_name),
        csvEscape(row.customer_email),
        csvEscape(row.learner_name),
        csvEscape(row.staff_name),
        csvEscape(row.appointment_type),
        csvEscape(toSast(row.start_at)),
        csvEscape(toSast(row.end_at)),
        csvEscape(row.status),
        csvEscape(toSast(row.cancelled_at)),
        csvEscape(toSast(row.synced_at)),
      ].join(","));
    }

    const csv = lines.join("\r\n");
    const rangeSuffix =
      fromStr || toStr
        ? `-${fromStr || "start"}-to-${toStr || "today"}`
        : "";
    const filename = `bookings-${new Date()
      .toISOString()
      .slice(0, 10)}${rangeSuffix}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("CSV EXPORT ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Export failed" },
      { status: 500 }
    );
  }
}