// src/app/api/user-role/route.js

import { NextResponse } from "next/server";
import { resolveApplicationRole } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const roleData = await resolveApplicationRole(request);

    return NextResponse.json(roleData);
  } catch (error) {
    console.error("User role resolution failed:", error.code || error.message);

    const unauthorizedCodes = new Set([
      "MISSING_AUTH_HEADER",
      "EMPTY_TOKEN",
      "INVALID_TOKEN",
      "NO_UID_IN_TOKEN",
      "EMAIL_REQUIRED",
      "EMAIL_NOT_VERIFIED",
      "USER_NOT_FOUND",
      "USER_NOT_AUTHORIZED",
      "PARENT_NOT_ALLOWLISTED",
      "INVALID_ROLE",
    ]);

    if (unauthorizedCodes.has(error.code)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (
      error.code === "ALLOWLIST_NOT_CONFIGURED" ||
      error.code === "ALLOWLIST_UNAVAILABLE" ||
      error.code === "INVALID_ALLOWLIST"
    ) {
      return NextResponse.json(
        { error: "Parent authorization is not configured correctly." },
        { status: 503 }
      );
    }

    if (error.code === "DB_LOOKUP_FAILED") {
      return NextResponse.json(
        { error: "Unable to resolve your application role." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}