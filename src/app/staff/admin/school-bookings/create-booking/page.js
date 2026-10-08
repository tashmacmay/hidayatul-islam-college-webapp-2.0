"use client";

import { CalendarDays } from "lucide-react";
import Link from "next/link";

import StaffSidebar from "@/components/staff/StaffSidebar";

export default function CreateBookingPage() {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <StaffSidebar />

      <main className="flex-1 p-6 transition-all duration-300 md:ml-64 md:p-8 lg:p-10">
        <div className="space-y-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[3px] text-gold">
              Admin
            </p>

            <h1 className="mt-2 text-4xl font-bold text-navy">
              Book New Appointment
            </h1>

            <div className="mt-4 h-1 w-16 rounded-full bg-gold" />

            <p className="mt-4 max-w-2xl text-text-muted">
              Create a booking on behalf of a parent. The Microsoft
              Bookings form will be embedded here.
            </p>
          </div>

          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <CalendarDays
              size={32}
              className="mx-auto mb-3 text-gray-300"
            />

            <p className="font-medium text-navy">Booking form coming soon</p>

            <p className="mt-1 text-sm text-text-muted">
              This page will host the Microsoft Bookings embed.
            </p>

            <Link
              href="/staff/admin/school-bookings"
              className="mt-6 inline-block rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-navy transition hover:opacity-90"
            >
              Back to School Bookings
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}