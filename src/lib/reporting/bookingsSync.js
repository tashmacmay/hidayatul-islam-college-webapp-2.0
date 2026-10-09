// src/lib/reporting/bookingsSync.js
import {
  initializeGraphForAppOnlyAuth,
  getBookingsAsync,
  getStaffMemberLookupAsync,
} from "@/lib/graph/graphHelper";

const FOUR_MONTHS_MS = 1000 * 60 * 60 * 24 * 120;

/**
 * Parses a Graph dateTime. Returns a valid Date or null.
 * Never returns an Invalid Date object — callers can treat null safely.
 */
function parseGraphDateTime(dateTimeStr, timeZone) {
  if (!dateTimeStr) return null;

  let iso;

  if (dateTimeStr.endsWith("Z")) {
    // Already UTC. Normalise fractional seconds to 3 digits.
    iso = dateTimeStr.replace(/\.(\d{3})\d+Z$/, ".$1Z");
  } else {
    const trimmed = dateTimeStr.replace(/\.\d+$/, "");

    if (timeZone === "South Africa Standard Time") {
      iso = `${trimmed}+02:00`;
    } else if (timeZone === "UTC" || timeZone === "Etc/UTC") {
      iso = `${trimmed}Z`;
    } else {
      console.warn(
        "Unexpected timeZone from Graph:",
        timeZone,
        "dateTime:",
        dateTimeStr
      );
      iso = `${trimmed}Z`;
    }
  }

  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

function getLearnerName(booking) {
  return (
    booking.customers?.[0]?.customQuestionAnswers?.find(
      (a) => a.question === "Learner's Full Name"
    )?.answer || null
  );
}

function getStatus(booking) {
  if (booking.isCancelled) return "Cancelled";

  const start = parseGraphDateTime(
    booking.startDateTime?.dateTime,
    booking.startDateTime?.timeZone
  );

  return start && start >= new Date() ? "Upcoming" : "Past";
}

function transformBooking(booking, staffLookup) {
  const staffMsId = booking.staffMemberIds?.[0] || null;
  const staffEntry = staffMsId ? staffLookup?.byId?.get(staffMsId) : null;

  return {
    msBookingId: booking.id,
    reference: booking.selfServiceAppointmentId || null,
    parentEmail: booking.customerEmailAddress || null,
    parentName: booking.customerName || null,
    learnerName: getLearnerName(booking),
    staffMsId,
    staffName: staffEntry?.displayName || null,
    appointmentType: booking.serviceName || null,
    startAt: parseGraphDateTime(
      booking.startDateTime?.dateTime,
      booking.startDateTime?.timeZone
    ),
    endAt: parseGraphDateTime(
      booking.endDateTime?.dateTime,
      booking.endDateTime?.timeZone
    ),
    status: getStatus(booking),
    cancelledAt: null,
  };
}

export async function fetchRecentBookingsFromGraph() {
  initializeGraphForAppOnlyAuth();

  const [response, staffLookup] = await Promise.all([
    getBookingsAsync(),
    getStaffMemberLookupAsync(),
  ]);

  const cutoff = Date.now() - FOUR_MONTHS_MS;

  const filtered = response.value.filter((booking) => {
    const start = parseGraphDateTime(
      booking.startDateTime?.dateTime,
      booking.startDateTime?.timeZone
    );
    return start && start.getTime() >= cutoff;
  });

  return filtered.map((booking) => transformBooking(booking, staffLookup));
}