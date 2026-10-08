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

    initializeGraphForAppOnlyAuth();

    const [response, staffLookup] = await Promise.all([
      getBookingsAsync(),
      getStaffMemberLookupAsync().catch(() => null),
    ]);

    //No filter — admin sees every booking
    const bookings = response.value.map((booking) =>
      formatStaffBooking(booking, staffLookup)
    );

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("ADMIN BOOKINGS ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to retrieve Microsoft Bookings",
        message: error.message,
      },
      { status: error.statusCode || 500 }
    );
  }
}