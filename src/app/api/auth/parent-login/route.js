// src/app/api/auth/parent-login/route.js

import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

function normalize(str) {
  return String(str || "").trim().toLowerCase();
}

/**
 * Custom robust CSV parser handling quotes and commas.
 */
function parseCsv(contents) {
  const records = [];
  let record = [];
  let field = "";
  let insideQuotes = false;

  for (let i = 0; i < contents.length; i++) {
    const char = contents[i];

    if (insideQuotes) {
      if (char === '"') {
        if (contents[i + 1] === '"') {
          field += '"';
          i++;
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
        i++;
      }
      record.push(field.trim());
      if (record.some((v) => v !== "")) {
        records.push(record);
      }
      record = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field.length > 0 || record.length > 0) {
    record.push(field.trim());
    if (record.some((v) => v !== "")) {
      records.push(record);
    }
  }

  return records;
}

export async function POST(request) {
  try {
    const { email, studentNumber } = await request.json();

    if (!email || !studentNumber) {
      return NextResponse.json(
        { error: "Both Email and Student Number are required." },
        { status: 400 }
      );
    }

    const inputEmail = normalize(email);
    const inputStudentNumber = normalize(studentNumber);

    // Load private/school_parents.csv from project root
    const csvPath = path.resolve(process.cwd(), "private", "school_parents.csv");

    let contents;
    try {
      contents = await fs.readFile(csvPath, "utf8");
    } catch (err) {
      console.error("Failed to load school_parents.csv:", err);
      return NextResponse.json(
        { error: "Parent records file is missing or inaccessible." },
        { status: 500 }
      );
    }

    const records = parseCsv(contents.replace(/^\uFEFF/, ""));
    if (records.length < 2) {
      return NextResponse.json(
        { error: "Invalid CSV file format." },
        { status: 500 }
      );
    }

    const headers = records[0].map((h) => normalize(h));
    const emailIdx = headers.indexOf("email");
    const studentNumIdx = headers.indexOf("studentnumber");
    const firstNameIdx = headers.indexOf("firstname");
    const lastNameIdx = headers.indexOf("lastname");
    const childNameIdx = headers.indexOf("childname");
    const childGradeIdx = headers.indexOf("childgrade");

    if (emailIdx === -1 || studentNumIdx === -1) {
      return NextResponse.json(
        { error: "CSV does not contain required Email and StudentNumber columns." },
        { status: 500 }
      );
    }

    // Search for match in CSV records
    let matchedRecord = null;
    const allChildren = [];

    for (let i = 1; i < records.length; i++) {
      const row = records[i];
      const rowEmail = normalize(row[emailIdx]);
      const rowStudentNumber = normalize(row[studentNumIdx]);

      // Collect all children belonging to this email
      if (rowEmail === inputEmail) {
        allChildren.push({
          studentNumber: row[studentNumIdx],
          name: row[childNameIdx] || "",
          grade: row[childGradeIdx] || "",
        });
      }

      // Check if current row matches both Email AND StudentNumber
      if (rowEmail === inputEmail && rowStudentNumber === inputStudentNumber) {
        matchedRecord = {
          firstName: row[firstNameIdx] || "",
          lastName: row[lastNameIdx] || "",
          email: row[emailIdx],
          studentNumber: row[studentNumIdx],
          childName: row[childNameIdx] || "",
          childGrade: row[childGradeIdx] || "",
        };
      }
    }

    if (!matchedRecord) {
      return NextResponse.json(
        { error: "Invalid Email or Student Number." },
        { status: 401 }
      );
    }

    const userSession = {
      role: "parent",
      firstName: matchedRecord.firstName,
      lastName: matchedRecord.lastName,
      email: matchedRecord.email,
      activeChild: {
        studentNumber: matchedRecord.studentNumber,
        name: matchedRecord.childName,
        grade: matchedRecord.childGrade,
      },
      children: allChildren,
    };

    const response = NextResponse.json({ success: true, user: userSession });

    // Set HTTP-only session cookie for Parent access
    response.cookies.set("parentSession", JSON.stringify(userSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Parent Login Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}