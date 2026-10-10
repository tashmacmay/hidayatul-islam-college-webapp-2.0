"use client";

// ============================================================
// CREATE BOOKING — PARENT
// ============================================================
//
// Microsoft Bookings is responsible for the actual appointment
// booking process.
//
// This page embeds the school's Microsoft Bookings calendar and
// also provides a direct link as a fallback.
//
// ============================================================

import ParentSidebar from "@/components/parent/ParentSidebar";
import ResponsiveAppShell from "@/components/layout/ResponsiveAppShell";

export default function CreateBookingPage() {
  return (
    <ResponsiveAppShell
      sidebar={(sidebarProps) => (
        <ParentSidebar {...sidebarProps} />
      )}
    >
      <main className="min-h-screen bg-off-white">

        {/* ====================================================
            MICROSOFT BOOKINGS FALLBACK BANNER
            ==================================================== */}

        <div className="flex flex-col gap-2 bg-[#08155A] px-4 py-3 pl-16 text-white sm:flex-row sm:items-center sm:justify-center sm:gap-2.5 sm:pl-4">

          <p>
            Having trouble viewing the calendar?
          </p>

          <a
            href="https://outlook.office.com/book/HidayatulIslamCollegeBookings@HidayatulProject.onmicrosoft.com/?ismsaljsauthenabled"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#ECC33B] hover:text-[#BA8E00]"
          >
            Open Booking Page in a New Tab
          </a>

        </div>


        {/* ====================================================
            MICROSOFT BOOKINGS
            ==================================================== */}

        <div className="w-full overflow-hidden bg-white">

          <iframe
            src="https://outlook.office.com/book/HidayatulIslamCollegeBookings@HidayatulProject.onmicrosoft.com/?ismsaljsauthenabled"
            className="h-[800px] w-full border-0 sm:h-[850px] lg:h-[900px]"
            title="Hidayatul Islam College Bookings"
          />

        </div>

      </main>
    </ResponsiveAppShell>
  );
}