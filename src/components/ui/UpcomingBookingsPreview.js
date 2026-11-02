import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
} from "lucide-react";

function formatDate(value) {
  if (!value) return "";

  const [year, month, day] = value.split("/");

  if (!year || !month || !day) {
    return value;
  }

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  ).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function UpcomingBookingsPreview({
  bookings,
  viewAllHref,
  itemHref,
}) {
  if (bookings.length === 0) {
    return (
      <div className="min-h-[220px] rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
        <CalendarDays
          size={25}
          className="mx-auto mb-2 text-slate-300"
        />

        <p className="text-sm font-semibold text-text-muted">
          No upcoming bookings
        </p>

        <p className="mt-1 text-xs text-text-muted">
          Your upcoming appointment bookings will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[220px] space-y-2">
      {bookings.map((booking) => (
        <Link
          key={booking.id}
          href={itemHref || viewAllHref}
          className="group block rounded-xl border border-slate-100 p-4 transition hover:bg-gold-pale"
        >
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy">
              <CalendarDays
                size={14}
                className="text-gold"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-navy">
                  {booking.appointmentType}
                </p>

                <span className="shrink-0 rounded-full bg-navy/10 px-2 py-1 text-[11px] font-semibold capitalize text-navy">
                  {booking.status}
                </span>
              </div>

              <p className="mt-1 text-sm text-text-muted">
                {booking.time}
              </p>

              <p className="mt-1 text-xs text-text-muted">
                {booking.learner
                  ? `For ${booking.learner} with ${booking.staff}`
                  : `With ${booking.staff}`}
              </p>

              {booking.date && (
                <p className="mt-1 text-xs text-text-muted">
                  {formatDate(booking.date)}
                </p>
              )}
            </div>

            <ArrowRight
              size={15}
              className="mt-1 shrink-0 text-slate-300 transition group-hover:text-gold"
            />
          </div>
        </Link>
      ))}
    </div>
  );
}
