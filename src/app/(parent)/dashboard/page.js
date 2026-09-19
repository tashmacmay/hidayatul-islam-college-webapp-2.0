"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

import {
  CalendarDays,
  Bell,
  BookOpen,
  GraduationCap,
  ArrowRight,
} from "lucide-react";

import ParentSidebar from "@/components/parent/ParentSidebar";
import ResponsiveAppShell from "@/components/layout/ResponsiveAppShell";

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  icon,
  title,
  value,
  subtitle,
  href,
}) {
  return (
    <Link
      href={href}
      className="group block"
    >
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-gold hover:shadow-md">

        {/* Icon */}
        <div className="mb-4 text-navy transition group-hover:text-gold">
          {icon}
        </div>

        {/* Title */}
        <p className="text-sm text-text-muted">
          {title}
        </p>

        {/* Value */}
        <h3 className="mt-2 text-3xl font-bold text-navy">
          {value}
        </h3>

        {/* Subtitle */}
        <p className="mt-1 text-sm text-text-muted">
          {subtitle}
        </p>

        {/* Click indicator */}
        <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-navy opacity-0 transition group-hover:opacity-100">
          View
          <ArrowRight size={15} />
        </div>

      </div>
    </Link>
  );
}

// ============================================================
// DASHBOARD CARD
// ============================================================

function DashboardCard({
  title,
  children,
  href,
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition hover:border-gold hover:shadow-md">

      {/* Header */}
      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-xl font-bold text-navy">
            {title}
          </h2>

          <div className="mt-4 h-1 w-12 rounded-full bg-gold" />
        </div>

        {/* Optional View All button */}
        {href && (
          <Link
            href={href}
            className="flex items-center gap-1 text-sm font-semibold text-navy hover:text-gold"
          >
            View All
            <ArrowRight size={16} />
          </Link>
        )}

      </div>

      {/* Card contents */}
      <div className="mt-6">
        {children}
      </div>

    </div>
  );
}

// ============================================================
// PARENT DASHBOARD PAGE
// ============================================================

export default function DashboardPage() {
  const router = useRouter();

  // ==========================================================
  // AUTH STATE
  // ==========================================================

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ==========================================================
  // DASHBOARD DATA
  // ==========================================================

  const [dashboard, setDashboard] = useState({
    bookings: [],
    notices: [],
    resourceCount: 0,
  });

  // ==========================================================
  // LOADING STATE
  // ==========================================================

  const [loading, setLoading] = useState(true);

  // ==========================================================
  // ERROR STATE
  // ==========================================================

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

        const response = await fetch("/api/bookings");

        if (!response.ok) {
          throw new Error("Failed to load dashboard data");
        }

        const bookingsData = await response.json();

        setDashboard({
          bookings: Array.isArray(bookingsData)
            ? bookingsData
            : [],
          notices: [],
          resourceCount: 0,
        });
      } catch (err) {
        console.error(
          "❌ Parent dashboard error:",
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
  }, [user]);

  // ==========================================================
  // AUTH LOADING SCREEN
  // ==========================================================

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-off-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // ==========================================================
  // USER INFORMATION
  // ==========================================================

  const displayName =
    user.displayName ||
    user.email?.split("@")[0] ||
    "Parent";

  // ==========================================================
  // DASHBOARD COUNTS
  // ==========================================================

  const bookingsCount =
    dashboard.bookings.length;

  const noticesCount =
    dashboard.notices.length;

  // ==========================================================
  // DISPLAY ONLY THE FIRST FEW ITEMS
  // ==========================================================

  const upcomingBookings =
    dashboard.bookings
      .filter(
        (booking) =>
          booking.status === "upcoming"
      )
      .slice(0, 3);

  const recentNotices =
    dashboard.notices.slice(0, 3);

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <ResponsiveAppShell
      sidebar={(sidebarProps) => (
        <ParentSidebar {...sidebarProps} />
      )}
    >
      <main className="min-h-screen bg-off-white">

        <div className="w-full px-4 py-6 sm:px-6 md:px-8 md:py-8 xl:px-10">

          {/* ====================================================
              PAGE HEADER
              ==================================================== */}

          <section className="mb-10">

            <p className="text-xs font-semibold uppercase tracking-[3px] text-gold">
              Parent Dashboard
            </p>

            <h1 className="mt-2 text-4xl font-bold text-navy">
              Assalamu Alaikum, {displayName}
            </h1>

            <div className="mt-4 h-1 w-16 rounded-full bg-gold" />

            <p className="mt-4 max-w-2xl text-text-muted">
              Welcome back. Here you can manage bookings,
              view notices, access resources and keep track
              of important school information.
            </p>

          </section>

          {/* ====================================================
              ERROR MESSAGE
              ==================================================== */}

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-700">
                {error}
              </p>
            </div>
          )}

          {/* ====================================================
              STATISTICS
              ==================================================== */}

          <section className="mb-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

            {/* My Bookings */}
            <StatCard
              icon={<CalendarDays size={30} />}
              title="My Bookings"
              value={
                loading
                  ? "..."
                  : bookingsCount
              }
              subtitle="Upcoming appointments"
              href="/my-bookings"
            />

            {/* Notices */}
            <StatCard
              icon={<Bell size={30} />}
              title="Notices"
              value={
                loading
                  ? "..."
                  : noticesCount
              }
              subtitle="Recent announcements"
              href="/notices"
            />

            {/* Resources */}
            <StatCard
              icon={<BookOpen size={30} />}
              title="Resources"
              value={
                loading
                  ? "..."
                  : dashboard.resourceCount
              }
              subtitle="Available resources"
              href="/learning-resources"
            />

            {/* Events */}
            <StatCard
              icon={<GraduationCap size={30} />}
              title="Events"
              value="View"
              subtitle="School calendar"
              href="/calendar"
            />

          </section>

          {/* ====================================================
              ROW 1
              ==================================================== */}

          <section className="grid gap-6 lg:grid-cols-2">

            {/* Upcoming Bookings */}
            <DashboardCard
              title="Upcoming Bookings"
              href="/my-bookings"
            >
              <div className="space-y-4">

                {loading && (
                  <p className="text-sm text-text-muted">
                    Loading bookings...
                  </p>
                )}

                {!loading &&
                  upcomingBookings.length === 0 && (
                    <div className="rounded-lg bg-gold-pale p-4">
                      <p className="text-sm text-text-muted">
                        No upcoming bookings.
                      </p>

                      <Link
                        href="/my-bookings/create"
                        className="mt-2 inline-block text-sm font-semibold text-navy hover:text-gold"
                      >
                        Create a booking
                      </Link>
                    </div>
                  )}

                {!loading &&
                  upcomingBookings.map(
                    (booking) => (
                      <Link
                        key={booking.id}
                        href="/my-bookings"
                        className="block rounded-lg bg-gold-pale p-4 transition hover:bg-gold hover:shadow-sm"
                      >
                        <p className="font-semibold text-navy">
                          {booking.appointmentType ||
                            "Booking"}
                        </p>

                        <p className="mt-1 text-sm text-text-muted">
                          {booking.date} ·{" "}
                          {booking.time}
                        </p>

                        {booking.status && (
                          <p className="mt-2 text-xs text-text-muted">
                            Status:{" "}
                            {booking.status}
                          </p>
                        )}
                      </Link>
                    )
                  )}

              </div>
            </DashboardCard>

            {/* Recent Notices */}
            <DashboardCard
              title="Recent Notices"
              href="/notices"
            >
              <div className="space-y-5">

                {loading && (
                  <p className="text-sm text-text-muted">
                    Loading notices...
                  </p>
                )}

                {!loading &&
                  recentNotices.length === 0 && (
                    <div className="rounded-lg bg-gold-pale p-4">
                      <p className="text-sm text-text-muted">
                        No recent notices.
                      </p>
                    </div>
                  )}

                {!loading &&
                  recentNotices.map(
                    (notice) => (
                      <Link
                        key={notice.id}
                        href="/notices"
                        className="block rounded-lg p-3 transition hover:bg-gold-pale"
                      >
                        <p className="font-semibold text-navy">
                          {notice.title}
                        </p>

                        {notice.category && (
                          <p className="mt-1 text-sm text-text-muted">
                            {notice.category}
                          </p>
                        )}
                      </Link>
                    )
                  )}

              </div>
            </DashboardCard>

          </section>

          {/* ====================================================
              ROW 2
              ==================================================== */}

          <section className="mt-6 grid gap-6 lg:grid-cols-2">

            {/* My Learner */}
            <DashboardCard title="My Learner">

              <div className="space-y-3">

                <p>
                  <span className="font-semibold text-navy">
                    Name:
                  </span>{" "}
                  <span className="text-text-muted">
                    Not connected yet
                  </span>
                </p>

                <p>
                  <span className="font-semibold text-navy">
                    Grade:
                  </span>{" "}
                  <span className="text-text-muted">
                    —
                  </span>
                </p>

                <p>
                  <span className="font-semibold text-navy">
                    Class:
                  </span>{" "}
                  <span className="text-text-muted">
                    —
                  </span>
                </p>

                <p>
                  <span className="font-semibold text-navy">
                    Attendance:
                  </span>{" "}
                  <span className="text-text-muted">
                    —
                  </span>
                </p>

              </div>

            </DashboardCard>

            {/* School Calendar */}
            <DashboardCard
              title="School Calendar"
              href="/calendar"
            >
              <div className="space-y-4">

                <Link
                  href="/calendar"
                  className="block rounded-lg p-3 transition hover:bg-gold-pale"
                >
                  <p className="font-semibold text-navy">
                    View School Calendar
                  </p>

                  <p className="mt-1 text-sm text-text-muted">
                    View upcoming school events and important dates.
                  </p>
                </Link>

              </div>
            </DashboardCard>

          </section>

        </div>
      </main>
    </ResponsiveAppShell>
  );
}