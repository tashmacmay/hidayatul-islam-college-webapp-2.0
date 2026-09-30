"use client";

import Link from "next/link";
import {
  CalendarDays,
  Plus,
  Pencil,
  X,
  Menu,
} from "lucide-react";
import { useState } from "react";
import StaffSidebar from "@/components/staff/StaffSidebar";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <StaffSidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
      />

      {/* Main Content */}
      <main
        className={`flex-1 p-6 md:p-8 lg:p-10 transition-all duration-300 ${
          isSidebarOpen ? "md:ml-64" : "ml-0"
        }`}
      >
        {/* Mobile Sidebar Button */}
        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="mb-6 rounded-lg p-2 text-navy hover:bg-white md:hidden"
            aria-label="Open sidebar"
          >
            <Menu size={28} />
          </button>
        )}

        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-text-muted">
                Manage your appointments and availability
              </p>

              <h1 className="mt-1 text-4xl font-bold text-navy">
                My Bookings
              </h1>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/staff/bookings/create-booking"
                className="flex items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2 font-semibold text-navy transition hover:opacity-90"
              >
                <Plus size={18} />
                Book on Behalf of Parent
              </Link>

              <Link
                href="/staff/bookings/availability"
                className="flex items-center justify-center gap-2 rounded-lg border border-gold px-4 py-2 font-semibold text-gold transition hover:bg-gold hover:text-navy"
              >
                <Pencil size={18} />
                Edit Slots
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Upcoming Bookings */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm text-text-muted">
                Upcoming Bookings
              </p>

              <h2 className="mt-2 text-3xl font-bold text-navy">
                12
              </h2>
            </div>

            {/* Available Slots */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm text-text-muted">
                Available Slots
              </p>

              <h2 className="mt-2 text-3xl font-bold text-navy">
                18
              </h2>
            </div>

            {/* This Month */}
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
              <CalendarDays
                size={20}
                className="text-navy"
              />

              <h2 className="text-xl font-bold text-navy">
                My Bookings
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="pb-3 font-semibold text-navy">
                      Booking
                    </th>

                    <th className="pb-3 font-semibold text-navy">
                      Date
                    </th>

                    <th className="pb-3 font-semibold text-navy">
                      Time
                    </th>

                    <th className="pb-3 font-semibold text-navy">
                      Status
                    </th>

                    <th className="pb-3 text-right font-semibold text-navy">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      {/* Booking */}
                      <td className="py-4 font-medium text-slate-800">
                        {booking.title}
                      </td>

                      {/* Date */}
                      <td className="py-4 text-slate-600">
                        {booking.date}
                      </td>

                      {/* Time */}
                      <td className="py-4 text-slate-600">
                        {booking.time}
                      </td>

                      {/* Status */}
                      <td className="py-4">
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          {booking.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 text-right">
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                        >
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
      </main>
    </div>
  );
}