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
    //Identify the caller:
    let user;
    try {
      user = await verifyUser(request);
    } catch (error) {
      return NextResponse.json(
        { error: error.message || "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.role !== "staff") {
      return NextResponse.json(
        { error: "Staff access required" },
        { status: 403 }
      );
    }

    const email = (user.email || "").toLowerCase().trim();
    if (!email) {
      return NextResponse.json(
        { error: "No email on token" },
        { status: 400 }
      );
    }

    initializeGraphForAppOnlyAuth();

    //Need the staff lookup to know which staffMemberId belongs to this user,
    //so unlike the parent GET we cannot fall back to null here.
    const [response, staffLookup] = await Promise.all([
      getBookingsAsync(),
      getStaffMemberLookupAsync(),
    ]);

    const myStaffId = staffLookup.byEmail.get(email);
    if (!myStaffId) {
      return NextResponse.json(
        {
          error:
            "You are not registered as a staff member in this booking business.",
        },
        { status: 403 }
      );
    }

    //A staff member owns an appointment iff their staffMemberId is in it.
    const mine = response.value.filter((booking) =>
      (booking.staffMemberIds || []).includes(myStaffId)
    );

    const bookings = mine.map((booking) =>
      formatStaffBooking(booking, staffLookup)
    );

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("STAFF BOOKINGS GRAPH ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to retrieve Microsoft Bookings",
        statusCode: error.statusCode,
        code: error.code,
        message: error.message,
      },
      { status: error.statusCode || 500 }
    );
  }
}