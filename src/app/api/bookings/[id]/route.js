
 // src/app/api/bookings/[id]/route.js

import { NextResponse } from "next/server";
import {
  verifyUser,
  verifyParentAccess,
  resolveApplicationRole,
} from "@/lib/auth";

import {
  initializeGraphForAppOnlyAuth,
  getAppointmentAsync,
  cancelBookingAsync,
} from "@/lib/graph/graphHelper";

export const runtime = "nodejs";

function authorizationErrorResponse(error) {
  console.error("Booking cancellation authorization failed:", error.code);

  if (
    [
      "ALLOWLIST_NOT_CONFIGURED",
      "ALLOWLIST_UNAVAILABLE",
      "INVALID_ALLOWLIST",
    ].includes(error.code)
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

export async function DELETE(request, { params }) {
  try {
    // Resolve the application role without granting access from a SQL
    // parent row alone. Staff/admin roles remain SQL-backed.
    let roleData;

    try {
      roleData = await resolveApplicationRole(request);
    } catch (error) {
      return authorizationErrorResponse(error);
    }

    let user;

    try {
      if (roleData.role === "staff") {
        // Preserve existing SQL-backed staff authentication.
        user = await verifyUser(request);
      } else if (roleData.role === "parent") {
        // Parents must be present in the current school CSV and have
        // a verified Firebase email. No SQL Users row is required.
        user = await verifyParentAccess(request);
      } else {
        return NextResponse.json(
          { error: "This account is not authorized." },
          { status: 403 }
        );
      }
    } catch (error) {
      return authorizationErrorResponse(error);
    }

    const email = String(user.email || "").toLowerCase().trim();

    if (!email) {
      return NextResponse.json(
        { error: "A valid account email is required." },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Missing booking id." },
        { status: 400 }
      );
    }

    initializeGraphForAppOnlyAuth();

    const appointment = await getAppointmentAsync(id);

    if (!appointment) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 }
      );
    }

    // A caller may cancel only a booking associated with their own email.
    const bookerEmail = String(
      appointment.customerEmailAddress || ""
    )
      .toLowerCase()
      .trim();

    if (!bookerEmail || bookerEmail !== email) {
      return NextResponse.json(
        { error: "You are not the owner of this booking." },
        { status: 403 }
      );
    }

    await cancelBookingAsync(id);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("CANCEL BOOKING ERROR:", {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    });

    return NextResponse.json(
      {
        error: "Failed to cancel booking.",
        code: error.code,
      },
      { status: error.statusCode || 500 }
    );
  }
}
