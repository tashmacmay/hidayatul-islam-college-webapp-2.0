"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

import {
CalendarDays,
Bell,
BookOpen,
RefreshCw,
} from "lucide-react";

import ParentSidebar from "@/components/parent/ParentSidebar";
import ResponsiveAppShell from "@/components/layout/ResponsiveAppShell";
import { auth } from "@/lib/firebase";
import DashboardStatCard from "@/components/ui/DashboardStatCard";
import SectionCard from "@/components/ui/SectionCard";
import PageHeader from "@/components/ui/PageHeader";
import RecentNoticesPreview from "@/components/ui/RecentNoticesPreview";
import UpcomingBookingsPreview from "@/components/ui/UpcomingBookingsPreview";
import LoadingState from "@/components/ui/LoadingState";

// ============================================================
// PARENT DASHBOARD
// ============================================================

export default function DashboardPage() {
const router = useRouter();

// ==========================================================
// AUTH
// ==========================================================

const [user, setUser] = useState(null);
const [authLoading, setAuthLoading] = useState(true);

// ==========================================================
// DASHBOARD DATA
// ==========================================================

const [notices, setNotices] = useState([]);
const [bookings, setBookings] = useState([]);
const [resourceCount, setResourceCount] =
useState(0);

// ==========================================================
// LOADING / ERROR
// ==========================================================

const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

// ==========================================================
// AUTHENTICATION
// ==========================================================

useEffect(() => {
const unsubscribe = onAuthStateChanged(
auth,
(currentUser) => {
if (!currentUser) {
router.push("/login");
return;
}

     setUser(currentUser);
    setAuthLoading(false);
  }
);

return () => unsubscribe();
 
}, [router]);

// ==========================================================
// LOAD DASHBOARD DATA
// ==========================================================

useEffect(() => {
if (!user) {
return;
}

 
async function loadDashboard() {
  try {
    setLoading(true);
    setError("");

    const token = await user.getIdToken();

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // ------------------------------------------------------
    const [
      noticesResponse,
      resourcesResponse,
      bookingsResponse,
    ] = await Promise.all([
      fetch("/api/notices", {
        method: "GET",
        headers,
      }),

      fetch("/api/resources", {
        method: "GET",
        headers,
      }),

      fetch("/api/bookings", {
        method: "GET",
        headers,
      }),
    ]);

    const [
      noticesData,
      resourcesData,
      bookingsData,
    ] = await Promise.all([
      noticesResponse.json(),
      resourcesResponse.json(),
      bookingsResponse.json(),
    ]);

    // ------------------------------------------------------
    // Notices
    // /api/notices returns the array directly.
    // ------------------------------------------------------

    if (!noticesResponse.ok) {
      throw new Error(
        noticesData.error ||
          "Failed to load notices."
      );
    }

    setNotices(
      Array.isArray(noticesData)
        ? noticesData
        : []
    );

    // ------------------------------------------------------
    // Resources
    // ------------------------------------------------------

    if (!resourcesResponse.ok) {
      throw new Error(
        resourcesData.error ||
          "Failed to load resources."
      );
    }

    const resources = Array.isArray(
      resourcesData
    )
      ? resourcesData
      : Array.isArray(
          resourcesData.resources
        )
      ? resourcesData.resources
      : [];

    setResourceCount(resources.length);

    if (!bookingsResponse.ok) {
      throw new Error(
        bookingsData.error ||
          "Failed to load bookings."
      );
    }

    setBookings(
      Array.isArray(bookingsData)
        ? bookingsData
        : []
    );
  } catch (err) {
    console.error(
      "Parent dashboard error:",
      err
    );

    setError(
      err.message ||
        "Unable to load dashboard data. Please try again."
    );
  } finally {
    setLoading(false);
  }
}

loadDashboard();
 
}, [user]);

// ==========================================================
// AUTH LOADING
// ==========================================================

if (authLoading) {
return ( <div className="flex min-h-screen items-center justify-center bg-slate-100"> <RefreshCw
       size={28}
       className="animate-spin text-gold"
     /> </div>
);
}

if (!user) {
return null;
}

// ==========================================================
// USER DISPLAY NAME
// ==========================================================

const displayName =
user.displayName ||
user.email?.split("@")[0] ||
"Parent";

// ==========================================================
// RECENT NOTICES
// ==========================================================

const recentNotices = notices.slice(0, 3);
const upcomingBookings = bookings.filter(
  (booking) =>
    !booking.status ||
    booking.status === "upcoming"
);

// ==========================================================
// PAGE
// ==========================================================

return (
<ResponsiveAppShell
sidebar={(sidebarProps) => (
<ParentSidebar {...sidebarProps} />
)}
> <main className="relative min-w-0 flex-1 bg-slate-100"> <div className="mx-auto w-full max-w-[1600px] px-5 py-6 md:px-8 md:py-8">

       {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <PageHeader
        icon={BookOpen}
        portalLabel="Parent Portal"
        title={`Assalamu Alaikum, ${displayName}`}
        subtitle="Welcome back. Here is a quick overview of your school information."
      />

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ==================================================
          SUMMARY CARDS
      ================================================== */}

      <section className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {/* ------------------------------------------------
            BOOKINGS
            ------------------------------------------------
            Intentionally left empty because bookings are
            being handled by another team member.
        ------------------------------------------------ */}

        <DashboardStatCard
          icon={<CalendarDays size={21} />}
          title="My Bookings"
          value={loading ? "..." : bookings.length}
          subtitle="Booking information"
          href="/my-bookings"
        />

        {/* ------------------------------------------------
            NOTICES
        ------------------------------------------------ */}

        <DashboardStatCard
          icon={<Bell size={21} />}
          title="Notices"
          value={
            loading
              ? "..."
              : notices.length
          }
          subtitle="Published school notices"
          href="/notices"
        />

        {/* ------------------------------------------------
            RESOURCES
        ------------------------------------------------ */}

        <DashboardStatCard
          icon={<BookOpen size={21} />}
          title="Resources"
          value={
            loading
              ? "..."
              : resourceCount
          }
          subtitle="Available resources"
          href="/resources"
        />

      </section>

      {/* ==================================================
          RECENT NOTICES
      ================================================== */}

      <div className="mb-7 grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Upcoming Bookings"
          subtitle="Your upcoming appointment bookings"
          href="/my-bookings"
        >
          {loading ? (
            <LoadingState label="Loading bookings..." />
          ) : (
            <UpcomingBookingsPreview
              bookings={upcomingBookings}
              viewAllHref="/my-bookings"
              itemHref="/my-bookings"
            />
          )}
        </SectionCard>

        <SectionCard
          title="Recent Notices"
          subtitle="Latest published school announcements"
          href="/notices"
        >
          {loading ? (
            <LoadingState label="Loading notices..." />
          ) : (
            <RecentNoticesPreview
              notices={recentNotices}
              viewAllHref="/notices"
              itemHref="/notices"
            />
          )}
        </SectionCard>
      </div>

    </div>
  </main>
</ResponsiveAppShell>
 
);
}
