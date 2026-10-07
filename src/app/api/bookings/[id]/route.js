import { NextResponse } from "next/server";
import { verifyUser } from "@/lib/auth";
import {
  initializeGraphForAppOnlyAuth,
  getAppointmentAsync,
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

    const appointment = await getAppointmentAsync(id);

    //One parent per booking: owner is the booker email.
    const bookerEmail = (appointment.customerEmailAddress || "")
      .toLowerCase()
      .trim();

    if (!bookerEmail || bookerEmail !== email) {
      return NextResponse.json(
        { error: "You are not the owner of this booking" },
        { status: 403 }
      );
    }

    await cancelBookingAsync(id);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("CANCEL BOOKING ERROR:", error);

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