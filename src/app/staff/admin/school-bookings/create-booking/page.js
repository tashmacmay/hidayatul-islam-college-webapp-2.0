"use client";

import { CalendarDays } from "lucide-react";
import Link from "next/link";

import StaffSidebar from "@/components/staff/StaffSidebar";
import PageHeader from "@/components/ui/PageHeader";

export default function CreateBookingPage() {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <StaffSidebar />

      <main className="flex-1 p-6 transition-all duration-300 md:ml-64 md:p-8 lg:p-10">
        <div className="mx-auto w-full max-w-[1600px] px-5 py-6 md:px-8 md:py-8 space-y-8">
          <PageHeader
            icon={CalendarDays}
            portalLabel="Admin Portal"
            title="Book New Appointment"
            subtitle="Create a booking on behalf of a parent. The Microsoft Bookings form will be embedded here."
          />

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