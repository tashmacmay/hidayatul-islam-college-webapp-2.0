// src/app/api/admin/reporting/sync/route.js
import { NextResponse } from "next/server";
import { verifyUser } from "@/lib/auth";
import { syncBookingsToDb } from "@/lib/reporting/bookingsSync";

export async function POST(request) {
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

    const summary = await syncBookingsToDb();
    return NextResponse.json(summary);
  } catch (error) {
    console.error("SYNC ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Sync failed" },
      { status: 500 }
    );
  }
}