import { NextResponse } from "next/server";

import { verifyUser } from "@/lib/auth";
import {
  initializeGraphForAppOnlyAuth,
  getAppointmentAsync,
  getStaffMemberLookupAsync,
  cancelBookingAsync,
} from "@/lib/graph/graphHelper";

export async function DELETE(request, { params }) {
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

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "Missing booking id" },
        { status: 400 }
      );
    }

    initializeGraphForAppOnlyAuth();

    const [appointment, staffLookup] = await Promise.all([
      getAppointmentAsync(id),
      getStaffMemberLookupAsync(),
    ]);

    const myStaffId = staffLookup.byEmail.get(email);
    if (!myStaffId) {
      return NextResponse.json(
        { error: "You are not registered as a staff member" },
        { status: 403 }
      );
    }

    const assigned = (appointment.staffMemberIds || []).includes(myStaffId);
    if (!assigned) {
      return NextResponse.json(
        { error: "You are not assigned to this appointment" },
        { status: 403 }
      );
    }

    await cancelBookingAsync(id);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("STAFF CANCEL ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to cancel booking",
        statusCode: error.statusCode,
        code: error.code,
        message: error.message,
      },
      { status: error.statusCode || 500 }
    );
  }
}