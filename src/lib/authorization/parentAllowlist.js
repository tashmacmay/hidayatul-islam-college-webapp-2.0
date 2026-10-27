
 // src/lib/authorization/parentAllowlist.js

import fs from "node:fs/promises";
import path from "node:path";

const EMAIL_PATTERN = /^[^\s@,]+@[^\s@,]+\.[^\s@,]+$/;

function createAllowlistError(message, code) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

/**
 * Parses standard CSV records, including quoted fields, commas inside
 * quoted fields, escaped double quotes, and line breaks inside quoted fields.
 */
function parseCsv(contents) {
  const records = [];
  let record = [];
  let field = "";
  let insideQuotes = false;

  for (let i = 0; i < contents.length; i += 1) {
    const char = contents[i];

    if (insideQuotes) {
      if (char === '"') {
        if (contents[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          insideQuotes = false;
        }
      } else {
        field += char;
      }

      continue;
    }

    if (char === '"' && field.length === 0) {
      insideQuotes = true;
    } else if (char === ",") {
      record.push(field.trim());
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && contents[i + 1] === "\n") {
        i += 1;
      }

      record.push(field.trim());

      if (record.some((value) => value !== "")) {
        records.push(record);
      }

      record = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (insideQuotes) {
    throw createAllowlistError(
      "The parent CSV contains an unclosed quoted field.",
      "INVALID_ALLOWLIST"
    );
  }

  if (field.length > 0 || record.length > 0) {
    record.push(field.trim());

    if (record.some((value) => value !== "")) {
      records.push(record);
    }
  }

  return records;
}

/**
 * Checks whether an email appears in the school's latest parent CSV.
 *
 * The school may retain its own column names and ordering.
 * Only the column named "Email" is used for authorization.
 * Multiple rows containing the same parent email are permitted.
 */
export async function isParentAllowlisted(email) {
  const normalizedEmail = normalizeEmail(email);

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return false;
  }

  const configuredPath = process.env.PARENT_ALLOWLIST_PATH;

  if (!configuredPath) {
    throw createAllowlistError(
      "Parent allowlist path is not configured.",
      "ALLOWLIST_NOT_CONFIGURED"
    );
  }

  const filePath = path.isAbsolute(configuredPath)
    ? configuredPath
    : path.resolve(process.cwd(), configuredPath);

  let contents;

  try {
    contents = await fs.readFile(filePath, "utf8");
  } catch (error) {
    console.error("Parent CSV could not be read:", error.code);

    throw createAllowlistError(
      "Parent authorization is temporarily unavailable.",
      "ALLOWLIST_UNAVAILABLE"
    );
  }

  let records;

  try {
    records = parseCsv(contents.replace(/^\uFEFF/, ""));
  } catch (error) {
    if (error.code === "INVALID_ALLOWLIST") {
      throw error;
    }

    throw createAllowlistError(
      "The parent CSV could not be parsed.",
      "INVALID_ALLOWLIST"
    );
  }

  if (records.length < 2) {
    throw createAllowlistError(
      "The parent CSV must contain a header and at least one parent record.",
      "INVALID_ALLOWLIST"
    );
  }

  const headers = records[0].map((header) =>
    header.trim().toLowerCase()
  );

  const emailColumn = headers.indexOf("email");

  if (emailColumn === -1 || headers.indexOf("email", emailColumn + 1) !== -1) {
    throw createAllowlistError(
      'The parent CSV must contain exactly one column named "Email".',
      "INVALID_ALLOWLIST"
    );
  }

  const allowedEmails = new Set();

  for (let i = 1; i < records.length; i += 1) {
    const row = records[i];

    if (row.length !== headers.length) {
      throw createAllowlistError(
        `The parent CSV has an inconsistent number of columns on row ${i + 1}.`,
        "INVALID_ALLOWLIST"
      );
    }

    const rowEmail = normalizeEmail(row[emailColumn]);

    if (!EMAIL_PATTERN.test(rowEmail)) {
      throw createAllowlistError(
        `The parent CSV has a missing or invalid email on row ${i + 1}.`,
        "INVALID_ALLOWLIST"
      );
    }

    // Duplicate emails are intentional when a parent has multiple children.
    allowedEmails.add(rowEmail);
  }

  return allowedEmails.has(normalizedEmail);
}
