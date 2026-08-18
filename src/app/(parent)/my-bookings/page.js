"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Plus,
  Search,
  X,
} from "lucide-react";

const bookings = [
  {
    id: 1,
    ref: "BK-001",
    date: "20 Aug 2026",
    time: "09:00",
    appointmentType: "Admissions Query",
    learner: "Yusuf Adams",
    staff: "Principal",
    status: "upcoming",
  },
  {
    id: 2,
    ref: "BK-002",
    date: "25 Aug 2026",
    time: "11:00",
    appointmentType: "Fee Discussion",
    learner: "Amina Adams",
    staff: "Secretary",
    status: "upcoming",
  },
  {
    id: 3,
    ref: "BK-003",
    date: "10 Aug 2026",
    time: "14:00",
    appointmentType: "Academic Meeting",
    learner: "Yusuf Adams",
    staff: "Principal",
    status: "past",
  },
];

export default function ParentBookingsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.ref
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      booking.learner
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      booking.staff
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      booking.appointmentType
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesFilter =
      activeFilter === "all"
        ? true
        : booking.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const upcomingCount = bookings.filter(
    (b) => b.status === "upcoming"
  ).length;

  const pastCount = bookings.filter(
    (b) => b.status === "past"
  ).length;

  const totalCount = bookings.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-text-muted">
            Manage and track all your appointment bookings
          </p>

          <h1 className="text-4xl font-bold text-navy">
            My Bookings
          </h1>
        </div>

        <Link
          href="/parent/my-bookings/create-booking"
          className="flex items-center gap-2 rounded-lg bg-gold px-4 py-2 font-semibold text-navy transition hover:opacity-90"
        >
          <Plus size={18} />
          Book New Appointment
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-text-muted">
            Upcoming
          </p>

          <h2 className="mt-2 text-3xl font-bold text-navy">
            {upcomingCount}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-text-muted">
            Past
          </p>

          <h2 className="mt-2 text-3xl font-bold text-navy">
            {pastCount}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-text-muted">
            Total
          </p>

          <h2 className="mt-2 text-3xl font-bold text-navy">
            {totalCount}
          </h2>
        </div>
      </div>

      {/* All Bookings */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays size={20} />

            <h2 className="text-xl font-bold text-navy">
              All Bookings
            </h2>
          </div>

          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />

            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-gold md:w-72"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          {["all", "upcoming", "past"].map(
            (filter) => (
              <button
                key={filter}
                onClick={() =>
                  setActiveFilter(filter)
                }
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeFilter === filter
                    ? "bg-navy text-white"
                    : "bg-gray-100 text-text-muted hover:bg-gray-200"
                }`}
              >
                {filter.charAt(0).toUpperCase() +
                  filter.slice(1)}
              </button>
            )
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="pb-3">Ref</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Time</th>
                <th className="pb-3">
                  Appointment Type
                </th>
                <th className="pb-3">
                  Learner Name
                </th>
                <th className="pb-3">Staff</th>
                <th className="pb-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredBookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-b last:border-0"
                >
                  <td className="py-4 font-medium text-navy">
                    {booking.ref}
                  </td>

                  <td>{booking.date}</td>

                  <td>{booking.time}</td>

                  <td>
                    {booking.appointmentType}
                  </td>

                  <td>{booking.learner}</td>

                  <td>{booking.staff}</td>

                  <td className="text-right">
                    {booking.status ===
                    "upcoming" ? (
                      <button className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100">
                        <X size={16} />
                        Cancel
                      </button>
                    ) : (
                      <span className="text-gray-400">
                        —
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredBookings.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-text-muted"
                  >
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

