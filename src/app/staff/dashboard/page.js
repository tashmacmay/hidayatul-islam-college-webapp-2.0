"use client";

import StaffSidebar from "@/components/staff/StaffSidebar";
import ResponsiveAppShell from "@/components/layout/ResponsiveAppShell";
import DashboardStatCard from "@/components/ui/DashboardStatCard";
import SectionCard from "@/components/ui/SectionCard";
import PageHeader from "@/components/ui/PageHeader";
import RecentNoticesPreview from "@/components/ui/RecentNoticesPreview";
import UpcomingBookingsPreview from "@/components/ui/UpcomingBookingsPreview";
import LoadingState from "@/components/ui/LoadingState";

import {
  LayoutDashboard,
  CalendarDays,
  Bell,
  BookOpen,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";


// ============================================================
// STAFF DASHBOARD PAGE
// ============================================================
// The dashboard currently works WITHOUT login/authentication.
//
// The dashboard gets its information from:
//
//     GET /api/staff/dashboard
//
// That API communicates with the SQL Server database.
//
// Authentication has intentionally been commented out for now.
// ============================================================

export default function DashboardPage() {
  // ============================================================
  // ROUTER
  // ============================================================

  const router = useRouter();

  // ============================================================
  // AUTH STATE
  // ============================================================

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ============================================================
  // DASHBOARD DATA
  // ============================================================

  const [dashboard, setDashboard] = useState({
    bookings: [],
    notices: [],
    resourceCount: 0,
    parentCount: 0,
  });

  // ============================================================
  // LOADING STATE
  // ============================================================

  const [loading, setLoading] = useState(true);

  // ============================================================
  // ERROR STATE
  // ============================================================

  const [error, setError] = useState("");

  // ============================================================
  // AUTHENTICATION
  // ============================================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        if (!currentUser) {
          router.push("/login");
        } else {
          setUser(currentUser);
        }

        setAuthLoading(false);
      }
    );

    return () => unsubscribe();
  }, [router]);

  // ============================================================
  // LOAD DASHBOARD DATA
  // ============================================================

  useEffect(() => {
    // Do not attempt to load dashboard data until
    // Firebase authentication has finished.
    if (authLoading || !user) {
      return;
    }

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        // Get the Firebase ID token for the logged-in user.
        const token = await user.getIdToken();

        const response = await fetch("/api/staff/dashboard", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(
            `Failed to load dashboard (${response.status})`
          );
        }

        const data = await response.json();

        setDashboard({
          bookings: Array.isArray(data.bookings)
            ? data.bookings
            : [],

          notices: Array.isArray(data.notices)
            ? data.notices
            : [],

          resourceCount:
            Number(data.resourceCount) || 0,

        });
      } catch (err) {
        console.error(
          "❌ Error loading staff dashboard:",
          err
        );

        setError(
          "Unable to load dashboard data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [user, authLoading]);

  // ============================================================
  // WAIT FOR AUTHENTICATION
  // ============================================================

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#c9a227] border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // ============================================================
  // DASHBOARD STATISTICS
  // ============================================================

  const bookingsToday = dashboard.bookings.length;

  const noticesCount = dashboard.notices.length;

  const displayName =
    user.displayName ||
    user.email?.split("@")[0] ||
    "Staff";

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <ResponsiveAppShell
      sidebar={(sidebarProps) => (
        <StaffSidebar {...sidebarProps} />
      )}
    >
      <main className="relative min-w-0 flex-1 bg-slate-100">

        <div className="mx-auto w-full max-w-[1600px] px-6 py-6 md:px-8 md:py-8">


          {/* ==================================================
              WELCOME HEADER
              ================================================== */}

          <PageHeader
            icon={LayoutDashboard}
            portalLabel="Staff Portal"
            title={`Assalamu Alaikum, ${displayName}`}
            subtitle="Welcome back. Here's an overview of what's happening at Hidayatul Islam College."
          />


          {/* ==================================================
              ERROR MESSAGE
              ================================================== */}

          {error && (

            <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4">

              <p className="text-sm font-medium text-red-700">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
                className="text-sm font-semibold text-red-700 underline"
              >
                Try again
              </button>

            </div>

          )}


          {/* ==================================================
              STAT CARDS
              ================================================== */}

          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">


            {/* =================================================
                BOOKINGS
                ================================================= */}

            <DashboardStatCard
              icon={<CalendarDays size={21} />}
              title="Bookings Today"
              value={loading ? "..." : bookingsToday}
              subtitle="Scheduled appointments"
              href="/staff/bookings"
            />


            {/* =================================================
                NOTICES
                ================================================= */}

            <DashboardStatCard
              icon={<Bell size={21} />}
              title="Notices"
              value={loading ? "..." : noticesCount}
              subtitle="Published announcements"
              href="/staff/school-notices"
            />


            {/* =================================================
                RESOURCES
                ================================================= */}

            <DashboardStatCard
              icon={<BookOpen size={21} />}
              title="Resources"
              value={loading ? "..." : dashboard.resourceCount}
              subtitle="Available resources"
              href="/staff/learning-resources"
            />

          </div>


          {/* ==================================================
              LOWER DASHBOARD
              ================================================== */}

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard
              title="Upcoming Bookings"
              subtitle="Your upcoming appointment bookings"
              href="/staff/bookings"
            >
              {loading ? (
                <LoadingState label="Loading bookings..." />
              ) : (
                <UpcomingBookingsPreview
                  bookings={dashboard.bookings}
                  viewAllHref="/staff/bookings"
                  itemHref="/staff/bookings"
                />
              )}
            </SectionCard>

            <SectionCard
              title="Recent Notices"
              subtitle="Latest published school announcements"
              href="/staff/school-notices"
            >
              {loading ? (
                <LoadingState label="Loading notices..." />
              ) : (
                <RecentNoticesPreview
                  notices={dashboard.notices}
                  viewAllHref="/staff/school-notices"
                  itemHref="/staff/school-notices"
                />
              )}
            </SectionCard>
          </div>

        </div>

      </main>

    </ResponsiveAppShell>

  );
}