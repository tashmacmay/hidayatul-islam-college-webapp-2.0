// src/app/api/staff/bookings/route.js

import { NextResponse } from "next/server";

import { verifyUser } from "@/lib/auth";
import {
  initializeGraphForAppOnlyAuth,
  getBookingsAsync,
  getStaffMemberLookupAsync,
  formatStaffBooking,
} from "@/lib/graph/graphHelper";

export async function GET(request) {
  try {
    const user = await verifyUser(request);

    if (user.role !== "staff") {
      return NextResponse.json(
        { error: "Staff access required" },
        { status: 403 }
      );
    }

    initializeGraphForAppOnlyAuth();

    const [response, staffLookup] = await Promise.all([
      getBookingsAsync(),
      getStaffMemberLookupAsync().catch(() => null),
    ]);

    const bookings = response.value.map((booking) =>
      formatStaffBooking(booking, staffLookup)
    );

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("STAFF BOOKINGS GRAPH ERROR:", error);

    if (
      error.message === "Missing or invalid Authorization header" ||
      error.message === "Invalid token"
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (error.message === "User not found in database") {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to retrieve Microsoft Bookings",
        message: error.message,
      },
      { status: error.statusCode || 500 }
    );
  }
}