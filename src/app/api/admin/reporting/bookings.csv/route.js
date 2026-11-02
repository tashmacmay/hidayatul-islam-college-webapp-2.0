// src/app/api/admin/reporting/bookings.csv/route.js
import { NextResponse } from "next/server";
import { verifyUser } from "@/lib/auth";
import { getPostgresConnection } from "@/lib/db-postgres";

function csvEscape(value) {
  if (value === null || value === undefined) return "";

  const s = String(value);

  // Prevent spreadsheet formula injection.
  const safeValue = /^[\s]*[=+\-@]/.test(s) ? `'${s}` : s;

  if (
    safeValue.includes(",") ||
    safeValue.includes('"') ||
    safeValue.includes("\n") ||
    safeValue.includes("\r")
  ) {
    return `"${safeValue.replace(/"/g, '""')}"`;
  }

  return safeValue;
}

function toSast(utcDate) {
  if (!utcDate) return "";

  const d = new Date(utcDate);
  if (Number.isNaN(d.getTime())) return "";

  // South African Standard Time = UTC + 2 hours.
  const sast = new Date(d.getTime() + 2 * 60 * 60 * 1000);
  return sast.toISOString().replace("T", " ").slice(0, 16);
}

function isValidDate(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
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

    const { searchParams } = new URL(request.url);
    const fromStr = searchParams.get("from");
    const toStr = searchParams.get("to");

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
        { error: "'from' must be on or before 'to'. " },
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
      const endExclusive = new Date(`${toStr}T00:00:00.000Z`);
      endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);

      values.push(endExclusive);
      conditions.push(`start_at < $${values.length}`);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const result = await pool.query(
      `
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
        FROM "dbo"."bookings"
        ${whereClause}
        ORDER BY start_at DESC
      `,
      values
    );

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

    for (const row of result.rows) {
      lines.push(
        [
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
        ].join(",")
      );
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
      { error: "Export failed" },
      { status: 500 }
    );
  }
}