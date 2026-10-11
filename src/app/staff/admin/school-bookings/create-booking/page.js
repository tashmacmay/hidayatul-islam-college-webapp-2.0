"use client";

import { CalendarDays } from "lucide-react";
import Link from "next/link";

import StaffSidebar from "@/components/staff/StaffSidebar";
import ShellPage from "@/components/layout/ShellPage";
import PageHeader from "@/components/ui/PageHeader";

export default function CreateBookingPage() {
  return (
    <ShellPage
      sidebar={(props) => <StaffSidebar {...props} />}
    >
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
    </ShellPage>
  );
}