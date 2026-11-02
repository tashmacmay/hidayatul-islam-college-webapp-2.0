import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getPostgresConnection } from "@/lib/db-postgres";
import { requireAdmin } from "@/lib/auth";

const REQUIRED_COLUMNS = [
  "email",
  "display_name",
  "role",
  "is_admin",
];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ROLES = new Set(["parent", "staff"]);

function errorResponse(error, fallback) {
  const status =
    error?.statusCode ||
    (error?.code === "NOT_ADMIN" || error?.code === "USER_NOT_FOUND"
      ? 403
      : ["MISSING_AUTH_HEADER", "EMPTY_TOKEN", "INVALID_TOKEN"].includes(
          error?.code
        )
        ? 401
        : 500);

  if (status === 500) {
    console.error(fallback, error?.message);
  }

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

function normalizeBoolean(value) {
  const normalized = String(value).trim().toLowerCase();

  if (["true", "1"].includes(normalized)) return true;
  if (["false", "0"].includes(normalized)) return false;
  return null;
}

function validateRows(rows, headers) {
  const errors = [];
  const emails = new Map();
  const values = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const email = String(row.email ?? "").trim().toLowerCase();
    const displayName = String(row.display_name ?? "").trim();
    const role = String(row.role ?? "").trim().toLowerCase();
    const isAdmin = normalizeBoolean(row.is_admin);
    const rowErrors = [];

    if (!email) rowErrors.push("Email is required");
    else if (!EMAIL_PATTERN.test(email)) rowErrors.push("Invalid email format");

    if (!displayName) rowErrors.push("Display name is required");
    if (!role) rowErrors.push("Role is required");
    else if (!VALID_ROLES.has(role)) {
      rowErrors.push("Role must be parent or staff");
    }

    if (isAdmin === null) {
      rowErrors.push("is_admin must be true, false, 1, or 0");
    } else if (role === "parent" && isAdmin) {
      rowErrors.push("Parent accounts cannot have administrator access");
    }

    if (email) {
      if (emails.has(email)) {
        rowErrors.push(`Duplicate email in file (row ${emails.get(email)})`);
      } else {
        emails.set(email, rowNumber);
      }
    }

    if (rowErrors.length > 0) {
      errors.push({ row: rowNumber, reasons: rowErrors });
      return;
    }

    values.push({
      row: rowNumber,
      email,
      display_name: displayName,
      role,
      is_admin: isAdmin,
    });
  });

  return { errors, values, headers };
}

export async function POST(request) {
  try {
    await requireAdmin(request);

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json(
        { error: "A spreadsheet file is required." },
        { status: 400 }
      );
    }

    // UPDATED: Allow Excel files
    const fileExtension = file.name?.toLowerCase().split('.').pop();
    if (!["csv", "xls", "xlsx"].includes(fileExtension)) {
      return NextResponse.json(
        { error: "Only .csv, .xls, and .xlsx files are supported." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length === 0) {
      return NextResponse.json(
        { error: "The file is empty." },
        { status: 400 }
      );
    }

    let rows;
    try {
      const workbook = XLSX.read(buffer, { type: "buffer", raw: false });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) throw new Error("No worksheet found");
      rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        defval: "",
        raw: false,
      });
    } catch (error) {
      console.error("Failed to parse user file:", error.message);
      return NextResponse.json(
        { error: "The file is corrupted or could not be parsed." },
        { status: 400 }
      );
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "The file contains no data rows." },
        { status: 400 }
      );
    }

    const headers = Object.keys(rows[0]).map((header) =>
      String(header).trim().toLowerCase()
    );
    const missingColumns = REQUIRED_COLUMNS.filter(
      (column) => !headers.includes(column)
    );

    if (missingColumns.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required columns: ${missingColumns.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const normalizedRows = rows.map((row) =>
      Object.fromEntries(
        Object.entries(row).map(([key, value]) => [
          String(key).trim().toLowerCase(),
          value,
        ])
      )
    );
    const validation = validateRows(normalizedRows, headers);
    if (validation.errors.length > 0) {
      return NextResponse.json(
        {
          error: "The file contains invalid records. No users were imported.",
          summary: {
            total: rows.length,
            imported: 0,
            duplicates: 0,
            invalid: validation.errors.length,
          },
          failures: validation.errors,
        },
        { status: 422 }
      );
    }

    const pool = getPostgresConnection();
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const existing = await client.query(
        `SELECT LOWER(BTRIM(email)) AS email
         FROM "dbo"."Users"
         WHERE LOWER(BTRIM(email)) = ANY($1::text[])`,
        [validation.values.map((value) => value.email)]
      );
      const existingEmails = new Set(
        existing.rows.map((row) => row.email)
      );
      const toInsert = validation.values.filter(
        (value) => !existingEmails.has(value.email)
      );

      for (const value of toInsert) {
        await client.query(
          `INSERT INTO "dbo"."Users"
             (firebase_uid, email, display_name, role, is_admin, created_at, updated_at)
           VALUES (NULL, $1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            value.email,
            value.display_name,
            value.role,
            value.is_admin,
          ]
        );
      }

      await client.query("COMMIT");

      return NextResponse.json({
        summary: {
          total: rows.length,
          imported: toInsert.length,
          duplicates: validation.values.length - toInsert.length,
          invalid: 0,
        },
        failures: validation.values
          .filter((value) => existingEmails.has(value.email))
          .map((value) => ({
            row: value.row,
            reasons: ["Email already exists"],
          })),
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    return errorResponse(error, "Failed to import users.");
  }
}