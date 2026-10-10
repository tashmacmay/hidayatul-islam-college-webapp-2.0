import { NextResponse } from "next/server";

import { verifyUser } from "@/lib/auth";
import {
  initializeGraphForAppOnlyAuth,
  getBookingsAsync,
} from "@/lib/graph/graphHelper";

export async function GET(request) {
  try {
    // Verify that the request comes from a logged-in Firebase user
    const user = await verifyUser(request);

    // Only staff members can access this endpoint
    if (user.role !== "staff") {
      return NextResponse.json(
        { error: "Staff access required" },
        { status: 403 }
      );
    }

    // Connect to Microsoft Graph
    initializeGraphForAppOnlyAuth();

    // Get appointments directly from Microsoft Bookings
    const response = await getBookingsAsync();

    const now = new Date();

    const bookings = response.value.map((booking) => {
      const start = new Date(booking.startDateTime.dateTime);
      const end = new Date(booking.endDateTime.dateTime);

      const learnerAnswer =
        booking.customers?.[0]?.customQuestionAnswers?.find(
          (answer) => answer.question === "Learner's Full Name"
        );

      return {
        id: booking.id,
        ref: booking.selfServiceAppointmentId || booking.id,

        date: start.toLocaleDateString(),
        time: `${start.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })} - ${end.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`,

        appointmentType: booking.serviceName || "Appointment",

        learner:
          learnerAnswer?.answer ||
          booking.customerName ||
          "Not provided",

        status: start >= now ? "upcoming" : "past",

        // Keep this available for the next phase
        staffMemberIds: booking.staffMemberIds || [],
      };
    });

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