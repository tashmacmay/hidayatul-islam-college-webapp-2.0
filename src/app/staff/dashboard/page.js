"use client";

import StaffSidebar from "@/components/staff/StaffSidebar";
import ResponsiveAppShell from "@/components/layout/ResponsiveAppShell";

import {
  CalendarDays,
  Bell,
  BookOpen,
  Users,
  ArrowRight,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";


// ============================================================
// TIME / DATE FORMATTERS
// Defined at module scope so they are stable across renders.
// ============================================================

function formatTime(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}


// ============================================================
// STAT CARD
// ============================================================

function StatCard({ icon, title, value, subtitle, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-xl border border-gray-100 bg-white p-6 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#c9a227]"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="text-[#0d2260]">{icon}</div>

        <ArrowRight
          size={18}
          className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-[#c9a227]"
        />
      </div>

      <p className="text-sm text-[#5a6a82]">{title}</p>

      <h3 className="mt-1 text-3xl font-bold text-[#0d2260]">{value}</h3>

      <p className="mt-1 text-sm text-[#5a6a82]">{subtitle}</p>
    </button>
  );
}


// ============================================================
// DASHBOARD CARD
// ============================================================

function DashboardCard({ title, children, onViewAll }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#0d2260]">{title}</h2>

        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="flex items-center gap-1 text-xs font-semibold text-[#0d2260] transition hover:text-[#c9a227]"
          >
            View all
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      {children}
    </div>
  );
}


// ============================================================
// STAFF DASHBOARD PAGE
// ============================================================

export default function DashboardPage() {
  const router = useRouter();

  // ----------------------------------------------------------
  // AUTH STATE
  // ----------------------------------------------------------
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ----------------------------------------------------------
  // DASHBOARD DATA
  // ----------------------------------------------------------
  const [dashboard, setDashboard] = useState({
    bookings: [],
    notices: [],
    resourceCount: 0,
    parentCount: 0,
  });

  // ----------------------------------------------------------
  // LOADING / ERROR STATE
  // ----------------------------------------------------------
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Incremented by the "Try again" button to force a refetch.
  const [reloadKey, setReloadKey] = useState(0);

  // ----------------------------------------------------------
  // HOOK 1: AUTHENTICATION LISTENER
  // ----------------------------------------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        setUser(null);
        router.replace("/login");
      } else {
        setUser(currentUser);
      }

      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // ----------------------------------------------------------
  // HOOK 2: LOAD DASHBOARD DATA
  // Only runs after auth has resolved AND a user exists.
  // ----------------------------------------------------------
  useEffect(() => {
    if (authLoading || !user) {
      return undefined;
    }

    const controller = new AbortController();

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/staff/dashboard", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load dashboard");
        }

        const data = await response.json();

        setDashboard({
          bookings: Array.isArray(data?.bookings) ? data.bookings : [],
          notices: Array.isArray(data?.notices) ? data.notices : [],
          resourceCount: Number(data?.resourceCount) || 0,
          parentCount: Number(data?.parentCount) || 0,
        });
      } catch (err) {
        if (err?.name === "AbortError") {
          return;
        }

        console.error("❌ Error loading staff dashboard:", err);

        setError("Unable to load dashboard data. Please try again.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => controller.abort();
  }, [authLoading, user, reloadKey]);

  // ----------------------------------------------------------
  // EARLY RETURNS
  // Must come AFTER every hook call above.
  // ----------------------------------------------------------
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f0f2f7]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#c9a227] border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // ----------------------------------------------------------
  // DERIVED VALUES
  // ----------------------------------------------------------
  const bookingsToday = dashboard.bookings.length;
  const noticesCount = dashboard.notices.length;

  const handleRetry = () => {
    setReloadKey((key) => key + 1);
  };

  // ----------------------------------------------------------
  // PAGE
  // ----------------------------------------------------------
  return (
    <ResponsiveAppShell
      sidebar={(sidebarProps) => <StaffSidebar {...sidebarProps} />}
    >
      <main className="min-h-screen bg-[#f0f2f7]">
        <div className="mx-auto w-full max-w-[1600px] px-6 py-6 md:px-8 md:py-8">

          {/* ==================================================
              WELCOME HEADER
              ================================================== */}
          <div className="mb-8">
            <p className="text-sm text-[#5a6a82]">Assalamu Alaikum,</p>

            <h1 className="mt-1 text-3xl font-bold text-[#0d2260] md:text-4xl">
              Welcome back, Staff Member
            </h1>

            <p className="mt-2 text-sm text-[#5a6a82]">
              Here's an overview of what's happening at Hidayatul Islam
              College.
            </p>
          </div>

          {/* ==================================================
              ERROR MESSAGE
              ================================================== */}
          {error && (
            <div
              role="alert"
              className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4"
            >
              <p className="text-sm font-medium text-red-700">{error}</p>

              <button
                type="button"
                onClick={handleRetry}
                className="text-sm font-semibold text-red-700 underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* ==================================================
              STAT CARDS
              ================================================== */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              icon={<CalendarDays size={28} />}
              title="Bookings Today"
              value={loading ? "..." : bookingsToday}
              subtitle="Scheduled appointments"
              onClick={() => router.push("/staff/bookings")}
            />

            <StatCard
              icon={<Bell size={28} />}
              title="Notices"
              value={loading ? "..." : noticesCount}
              subtitle="Published announcements"
              onClick={() => router.push("/staff/notices")}
            />

            <StatCard
              icon={<BookOpen size={28} />}
              title="Resources"
              value={loading ? "..." : dashboard.resourceCount}
              subtitle="Available resources"
              onClick={() => router.push("/staff/resources")}
            />

            <StatCard
              icon={<Users size={28} />}
              title="Parents"
              value={loading ? "..." : dashboard.parentCount}
              subtitle="Registered parents"
              onClick={() => router.push("/staff/users")}
            />

          </div>

          {/* ==================================================
              LOWER DASHBOARD
              ================================================== */}
          <div className="grid gap-6 lg:grid-cols-2">

            {/* =================================================
                TODAY'S BOOKINGS
                ================================================= */}
            <DashboardCard
              title="Today's Bookings"
              onViewAll={() => router.push("/staff/bookings")}
            >
              <div className="space-y-3">

                {loading && (
                  <div className="rounded-lg bg-[#f7f8fc] p-4">
                    <p className="text-sm text-[#5a6a82]">
                      Loading bookings...
                    </p>
                  </div>
                )}

                {!loading && dashboard.bookings.length === 0 && (
                  <div className="rounded-lg bg-[#f7f8fc] p-4">
                    <p className="text-sm text-[#5a6a82]">
                      No bookings scheduled for today.
                    </p>
                  </div>
                )}

                {!loading &&
                  dashboard.bookings.map((booking) => (
                    <button
                      key={booking.id}
                      type="button"
                      onClick={() => router.push("/staff/bookings")}
                      className="group w-full rounded-lg bg-[#f7f8fc] p-4 text-left transition hover:bg-[#eef1f8]"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-[#0d2260]">
                            {booking.title ||
                              booking.service ||
                              "Booking"}
                          </p>

                          <p className="mt-1 text-sm text-[#5a6a82]">
                            {formatTime(booking.start_time)}
                            {booking.end_time
                              ? ` - ${formatTime(booking.end_time)}`
                              : ""}
                          </p>
                        </div>

                        <ArrowRight
                          size={16}
                          className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-[#c9a227]"
                        />
                      </div>

                      {booking.status && (
                        <span className="mt-2 inline-block rounded-full bg-[#0d2260]/10 px-2.5 py-1 text-xs font-semibold text-[#0d2260]">
                          {booking.status}
                        </span>
                      )}
                    </button>
                  ))}

              </div>
            </DashboardCard>

            {/* =================================================
                RECENT NOTICES
                ================================================= */}
            <DashboardCard
              title="Recent Notices"
              onViewAll={() => router.push("/staff/notices")}
            >
              <div className="space-y-3">

                {loading && (
                  <div className="rounded-lg bg-[#f7f8fc] p-4">
                    <p className="text-sm text-[#5a6a82]">
                      Loading notices...
                    </p>
                  </div>
                )}

                {!loading && dashboard.notices.length === 0 && (
                  <div className="rounded-lg bg-[#f7f8fc] p-4">
                    <p className="text-sm text-[#5a6a82]">
                      No recent notices.
                    </p>
                  </div>
                )}

                {!loading &&
                  dashboard.notices.map((notice) => (
                    <button
                      key={notice.id}
                      type="button"
                      onClick={() => router.push("/staff/notices")}
                      className="group w-full rounded-lg bg-[#f7f8fc] p-4 text-left transition hover:bg-[#eef1f8]"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-[#0d2260]">
                            {notice.title}
                          </p>

                          <div className="mt-1 flex items-center gap-2">
                            {notice.category && (
                              <span className="rounded-full bg-[#c9a227]/15 px-2 py-1 text-[11px] font-semibold text-[#7a5c00]">
                                {notice.category}
                              </span>
                            )}

                            {notice.created_at && (
                              <span className="text-xs text-[#5a6a82]">
                                {formatDate(notice.created_at)}
                              </span>
                            )}
                          </div>
                        </div>

                        <ArrowRight
                          size={16}
                          className="flex-shrink-0 text-gray-300 transition group-hover:translate-x-1 group-hover:text-[#c9a227]"
                        />
                      </div>
                    </button>
                  ))}

              </div>
            </DashboardCard>

          </div>

          {/* ==================================================
              QUICK ACTIONS
              ================================================== */}
          <div className="mt-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-[#0d2260]">
              Quick Actions
            </h2>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

              <button
                type="button"
                onClick={() => router.push("/staff/bookings")}
                className="flex items-center gap-3 rounded-lg border border-[#0d2260]/10 p-4 text-left transition hover:border-[#c9a227] hover:bg-[#f7f8fc]"
              >
                <CalendarDays size={20} className="text-[#0d2260]" />
                <span className="text-sm font-semibold text-[#0d2260]">
                  Manage Bookings
                </span>
              </button>

              <button
                type="button"
                onClick={() => router.push("/staff/notices")}
                className="flex items-center gap-3 rounded-lg border border-[#0d2260]/10 p-4 text-left transition hover:border-[#c9a227] hover:bg-[#f7f8fc]"
              >
                <Bell size={20} className="text-[#0d2260]" />
                <span className="text-sm font-semibold text-[#0d2260]">
                  Manage Notices
                </span>
              </button>

              <button
                type="button"
                onClick={() => router.push("/staff/resources")}
                className="flex items-center gap-3 rounded-lg border border-[#0d2260]/10 p-4 text-left transition hover:border-[#c9a227] hover:bg-[#f7f8fc]"
              >
                <BookOpen size={20} className="text-[#0d2260]" />
                <span className="text-sm font-semibold text-[#0d2260]">
                  Manage Resources
                </span>
              </button>

              <button
                type="button"
                onClick={() => router.push("/staff/users")}
                className="flex items-center gap-3 rounded-lg border border-[#0d2260]/10 p-4 text-left transition hover:border-[#c9a227] hover:bg-[#f7f8fc]"
              >
                <Users size={20} className="text-[#0d2260]" />
                <span className="text-sm font-semibold text-[#0d2260]">
                  View Parents
                </span>
              </button>

            </div>
          </div>

        </div>
      </main>
    </ResponsiveAppShell>
  );
}