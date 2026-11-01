import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getPostgresConnection } from "@/lib/db-postgres";
import { requireAdmin } from "@/lib/auth";

const EXPORT_FIELDS = [
  "display_name",
  "email",
  "role",
  "is_admin",
  "activation_status",
];

function errorResponse(error, fallback) {
  const status = error?.statusCode || 500;
  if (status === 500) console.error(fallback, error?.message);
  return NextResponse.json(
    {
      error:
        status === 500
          ? fallback
          : status === 403
            ? "Administrator access is required."
            : "Authentication is required. Please sign in again.",
    },
    { status }
  );
}

function safeRows(rows) {
  return rows.map((row) => ({
    display_name: row.display_name || "",
    email: row.email || "",
    role: row.role || "",
    is_admin: row.is_admin === true ? "true" : "false",
    activation_status: row.firebase_uid ? "Activated" : "Not activated",
  }));
}

function csvValue(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function createCsv(rows) {
  return [
    EXPORT_FIELDS.join(","),
    ...rows.map((row) => EXPORT_FIELDS.map((field) => csvValue(row[field])).join(",")),
  ].join("\r\n");
}

async function createPdf(rows) {
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const date = new Date().toISOString().slice(0, 10);
  const columns = [
    ["Name", 45],
    ["Email", 170],
    ["Role", 345],
    ["Admin", 405],
    ["Status", 465],
  ];
  let page = document.addPage([612, 792]);
  let y = 750;

  const addHeader = () => {
    page.drawText("User Register", { x: 45, y, size: 18, font: bold });
    page.drawText(`Export date: ${date}`, { x: 45, y: y - 22, size: 9, font });
    y -= 55;
    columns.forEach(([label, x]) => {
      page.drawText(label, { x, y, size: 9, font: bold });
    });
    y -= 18;
  };

  addHeader();
  for (const row of rows) {
    if (y < 45) {
      page = document.addPage([612, 792]);
      y = 750;
      addHeader();
    }

    const values = [
      row.display_name,
      row.email,
      row.role,
      row.is_admin,
      row.activation_status,
    ];
    values.forEach((value, index) => {
      page.drawText(String(value).slice(0, index === 1 ? 28 : 18), {
        x: columns[index][1],
        y,
        size: 8,
        font,
        color: rgb(0.1, 0.1, 0.1),
      });
    });
    y -= 16;
  }

  return document.save();
}

export async function GET(request) {
  try {
    await requireAdmin(request);
    const format = new URL(request.url).searchParams.get("format");
    if (!["csv", "xlsx", "pdf"].includes(format)) {
      return NextResponse.json(
        { error: "Export format must be csv, xlsx, or pdf." },
        { status: 400 }
      );
    }

    const pool = getPostgresConnection();
    const result = await pool.query(
      `SELECT display_name, email, role, is_admin, firebase_uid
       FROM "dbo"."Users"
       ORDER BY display_name ASC NULLS LAST, email ASC`
    );
    const rows = safeRows(result.rows);
    const date = new Date().toISOString().slice(0, 10);

    if (format === "csv") {
      return new NextResponse(createCsv(rows), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="users-${date}.csv"`,
        },
      });
    }

    if (format === "xlsx") {
      const worksheet = XLSX.utils.json_to_sheet(rows, {
        header: EXPORT_FIELDS,
      });
      worksheet["!autofilter"] = {
        ref: `A1:E${Math.max(rows.length + 1, 2)}`,
      };
      worksheet["!cols"] = [
        { wch: 24 },
        { wch: 32 },
        { wch: 12 },
        { wch: 10 },
        { wch: 18 },
      ];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
      return new NextResponse(buffer, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="users-${date}.xlsx"`,
        },
      });
    }

    const pdf = await createPdf(rows);
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="user-register-${date}.pdf"`,
      },
    });
  } catch (error) {
    return errorResponse(error, "Failed to export users.");
  }
}
