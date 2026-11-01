"use client";

import StaffSidebar from "@/components/staff/StaffSidebar";
import ShellPage from "@/components/layout/ShellPage";
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

export default function DashboardPage() {
  const router = useRouter();

  // ============================================================
  // AUTH STATE
  // ============================================================

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dbProfile, setDbProfile] = useState(null); // NEW: Store database profile

  // ============================================================
  // DASHBOARD DATA
  // ============================================================

  const [dashboard, setDashboard] = useState({
    bookings: [],
    notices: [],
    resourceCount: 0,
    parentCount: 0,
  });

  const [loading, setLoading] = useState(true);
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
    if (authLoading || !user) return;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const token = await user.getIdToken();
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch dashboard data AND user profile in parallel
        const [dashboardResponse, profileResponse] = await Promise.all([
          fetch("/api/staff/dashboard", { method: "GET", headers }),
          fetch("/api/user-role", { method: "GET", headers }) // Gets the DB profile
        ]);

        if (!dashboardResponse.ok) {
          throw new Error(`Failed to load dashboard (${dashboardResponse.status})`);
        }

        const data = await dashboardResponse.json();
        const profileData = await profileResponse.json();

        // Set DB Profile (which has the display_name)
        if (profileResponse.ok && profileData) {
          setDbProfile(profileData.user || profileData);
        }

        setDashboard({
          bookings: Array.isArray(data.bookings) ? data.bookings : [],
          notices: Array.isArray(data.notices) ? data.notices : [],
          resourceCount: Number(data.resourceCount) || 0,
        });

      } catch (err) {
        console.error("❌ Error loading staff dashboard:", err);
        setError("Unable to load dashboard data. Please try again.");
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

  if (!user) return null;

  // ============================================================
  // DASHBOARD STATISTICS & GREETING
  // ============================================================

  const bookingsToday = dashboard.bookings.length;
  const noticesCount = dashboard.notices.length;

  // FIXED: Prioritize the database display name over the email prefix
  const displayName =
    dbProfile?.display_name ||
    user.displayName ||
    user.email?.split("@")[0] ||
    "Staff";

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <ShellPage
      sidebar={(sidebarProps) => <StaffSidebar {...sidebarProps} />}
      spaceY=""
    >
      <PageHeader
        icon={LayoutDashboard}
        portalLabel="Staff Portal"
        title={`Assalamu Alaikum, ${displayName}`}
        subtitle="Welcome back. Here's an overview of what's happening at Hidayatul Islam College."
      />

      {error && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-sm font-semibold text-red-700 underline"
          >
            Try again
          </button>
        </div>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardStatCard
          icon={<CalendarDays size={21} />}
          title="Bookings"
          value={loading ? "..." : bookingsToday}
          subtitle="Upcoming appointments"
          href="/staff/bookings"
        />

        <DashboardStatCard
          icon={<Bell size={21} />}
          title="Notices"
          value={loading ? "..." : noticesCount}
          subtitle="Published announcements"
          href="/staff/school-notices"
        />

        <DashboardStatCard
          icon={<BookOpen size={21} />}
          title="Resources"
          value={loading ? "..." : dashboard.resourceCount}
          subtitle="Available resources"
          href="/staff/learning-resources"
        />
      </div>

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
    </ShellPage>
  );
}