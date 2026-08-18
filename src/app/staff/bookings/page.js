"use client";

import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  Plus,
  Pencil,
  X,
} from "lucide-react";

const bookings = [
  {
    id: 1,
    title: "Parent Consultation",
    date: "18 Aug 2026",
    time: "09:00",
    status: "Upcoming",
  },
  {
    id: 2,
    title: "Admissions Meeting",
    date: "19 Aug 2026",
    time: "11:00",
    status: "Upcoming",
  },
  {
    id: 3,
    title: "Principal Review",
    date: "22 Aug 2026",
    time: "14:00",
    status: "Upcoming",
  },
];

export default function BookingsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-text-muted">
            Manage your appointments and availability
          </p>

          <h1 className="text-4xl font-bold text-navy">
            My Bookings
          </h1>
        </div>

        <div className="flex gap-3">
          <Link
            href="/staff/bookings/create-booking"
            className="flex items-center gap-2 rounded-lg bg-gold px-4 py-2 font-semibold text-navy transition hover:opacity-90"
          >
          <Plus size={18} />
            Book on Behalf of Parent
         </Link>

          <Link
            href="/staff/bookings/availability"
            className="flex items-center gap-2 rounded-lg border border-gold px-4 py-2 font-semibold text-gold transition hover:bg-gold hover:text-navy"
          >
            <Pencil size={18} />
            Edit Slots
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-text-muted">
            Upcoming Bookings
          </p>

          <h2 className="mt-2 text-3xl font-bold text-navy">
            12
          </h2>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-text-muted">
            Available Slots
          </p>

          <h2 className="mt-2 text-3xl font-bold text-navy">
            18
          </h2>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-text-muted">
            This Month
          </p>

          <h2 className="mt-2 text-3xl font-bold text-navy">
            37
          </h2>
        </div>
      </div>

      {/* My Bookings Table */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <CalendarDays size={20} />
          <h2 className="text-xl font-bold text-navy">
            My Bookings
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="pb-3">Booking</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Time</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-b last:border-0"
                >
                  <td className="py-4 font-medium">
                    {booking.title}
                  </td>

                  <td>{booking.date}</td>

                  <td>{booking.time}</td>

                  <td>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      {booking.status}
                    </span>
                  </td>

                  <td className="text-right">
                    <button className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100">
                      <X size={16} />
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
  </div>
  );
}