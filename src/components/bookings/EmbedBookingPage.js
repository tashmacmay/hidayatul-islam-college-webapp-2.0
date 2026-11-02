"use client";

import ResponsiveAppShell from "@/components/layout/ResponsiveAppShell";
import ParentSidebar from "@/components/parent/ParentSidebar";
import StaffSidebar from "@/components/staff/StaffSidebar";

const BookingPageURL =
  "https://bookings.cloud.microsoft/book/HidayatulIslamCollegeParentMeetings@Hidayatulcpt.onmicrosoft.com/?ismsaljsauthenabled";

export default function EmbedBookingPage({ role }) {
  const sidebar = (props) =>
    role === "parent" ? (
      <ParentSidebar {...props} />
    ) : (
      <StaffSidebar {...props} />
    );

  return (
    <ResponsiveAppShell sidebar={sidebar}>
      <main className="relative min-w-0 flex-1 min-h-screen bg-slate-100 flex flex-col">
        <div className="flex flex-col gap-2 bg-[#08155A] px-4 py-3 pl-16 text-white sm:flex-row sm:items-center sm:justify-center sm:gap-2.5 sm:pl-4 shrink-0">
          <p>Having trouble viewing the calendar?</p>
          <a
            href={BookingPageURL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#ECC33B] hover:text-[#BA8E00]"
          >
            Open Booking Page in a New Tab
          </a>
        </div>

        <iframe
          src={BookingPageURL}
          className="w-full flex-1 border-0"
          style={{ minHeight: "800px" }}
          title="Hidayatul Islam College Parent Meetings"
          scrolling="yes"
        />
      </main>
    </ResponsiveAppShell>
  );
}
