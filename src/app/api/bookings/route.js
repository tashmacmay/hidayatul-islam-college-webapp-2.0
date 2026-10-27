// src/app/api/bookings/route.js

import { NextResponse } from "next/server";
import { verifyParentAccess } from "@/lib/auth";
import {
  initializeGraphForAppOnlyAuth,
  getBookingsAsync,
  getStaffMemberLookupAsync,
  formatParentBooking,
} from "@/lib/graph/graphHelper";

export const runtime = "nodejs";

export async function GET(request) {
  let user;

  try {
    user = await verifyParentAccess(request);
  } catch (error) {
    console.error("Parent booking authorization failed:", error.code);

    if (
      error.code === "ALLOWLIST_NOT_CONFIGURED" ||
      error.code === "ALLOWLIST_UNAVAILABLE" ||
      error.code === "INVALID_ALLOWLIST"
    ) {
      return NextResponse.json(
        { error: "Parent authorization is temporarily unavailable." },
        { status: 503 }
      );
    }

    if (error.code === "DB_LOOKUP_FAILED") {
      return NextResponse.json(
        { error: "Authorization service is temporarily unavailable." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const email = (user.email || "").toLowerCase().trim();

  if (!email) {
    return NextResponse.json(
      { error: "A verified email address is required." },
      { status: 401 }
    );
  }

  try {
    initializeGraphForAppOnlyAuth();

    const [response, staffLookup] = await Promise.all([
      getBookingsAsync(),
      getStaffMemberLookupAsync().catch((error) => {
        console.error("Staff lookup fetch failed:", error.message);
        return null;
      }),
    ]);

    const graphBookings = Array.isArray(response?.value)
      ? response.value
      : [];

    // Only return bookings associated with the authenticated parent's email.
    const mine = graphBookings.filter((booking) => {
      const bookerEmail = (
        booking.customerEmailAddress ||
        booking.customers?.[0]?.emailAddress ||
        ""
      )
        .toLowerCase()
        .trim();

      return bookerEmail === email;
    });

    const bookings = mine.map((booking) =>
      formatParentBooking(booking, staffLookup)
    );

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Microsoft Bookings retrieval failed:", {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    });

    return NextResponse.json(
      {
        error: "Failed to retrieve Microsoft Bookings",
        code: error.code,
      },
      { status: error.statusCode || 500 }
    );
  }
}