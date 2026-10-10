"use client";

import StaffSidebar from "@/components/staff/StaffSidebar";

import {
  CalendarDays,
  Bell,
  BookOpen,
  ArrowRight,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  icon,
  title,
  value,
  subtitle,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-xl border border-gray-100 bg-white p-6 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#c9a227]"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="text-[#0d2260]">
          {icon}
        </div>

        <ArrowRight
          size={18}
          className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-[#c9a227]"
        />
      </div>

      <p className="text-sm text-[#5a6a82]">
        {title}
      </p>

      <h3 className="mt-1 text-3xl font-bold text-[#0d2260]">
        {value}
      </h3>

      <p className="mt-1 text-sm text-[#5a6a82]">
        {subtitle}
      </p>
    </button>
  );
}

// ============================================================
// DASHBOARD CARD
// ============================================================

function DashboardCard({
  title,
  children,
  onViewAll,
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#0d2260]">
          {title}
        </h2>

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
// STAFF DASHBOARD
// ============================================================

export default function DashboardPage() {
  const router = useRouter();

  // ============================================================
  // AUTH
  // ============================================================

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ============================================================
  // DASHBOARD DATA
  // ============================================================

  const [bookings, setBookings] = useState([]);
  const [notices, setNotices] = useState([]);

  // ============================================================
  // LOADING
  // ============================================================

  const [loading, setLoading] = useState(true);

  // ============================================================
  // ERROR
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
  // LOAD DASHBOARD
  // ============================================================

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        // ------------------------------------------------------
        // Firebase ID token
        // ------------------------------------------------------

        const token = await user.getIdToken();

        // ------------------------------------------------------
        // Notices
        //
        // Uses the existing Notices API as the source of truth.
        // ------------------------------------------------------

        const noticesResponse = await fetch("/api/notices", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!noticesResponse.ok) {
          throw new Error(
            `Failed to load notices (${noticesResponse.status})`
          );
        }

        const noticesData = await noticesResponse.json();

        setNotices(
          Array.isArray(noticesData)
            ? noticesData
            : []
        );

        // ------------------------------------------------------
        // BOOKINGS
        //
        // The actual staff bookings page uses Microsoft Graph.
        //
        // We are intentionally not adding SQL booking logic here.
        // Once the Graph staff endpoint is finalised, the dashboard
        // can use that same source.
        // ------------------------------------------------------

        setBookings([]);

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
  // AUTH LOADING
  // ============================================================

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#c9a227] border-t-transparent" />
      </div>
    );
  }

  // ============================================================
  // NOT LOGGED IN
  // ============================================================

  if (!user) {
    return null;
  }

  // ============================================================
  // STAFF NAME
  // ============================================================

  const staffName =
    user.displayName ||
    user.email?.split("@")[0] ||
    "Staff Member";

  // ============================================================
  // NOTICE DATA
  // ============================================================

  const noticesCount = notices.length;

  const recentNotices = notices.slice(0, 5);

  // ============================================================
  // DATE FORMAT
  // ============================================================

  function formatDate(value) {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-[#f0f2f7]">

      {/* ======================================================
          SIDEBAR
          ====================================================== */}

      <StaffSidebar />

      {/* ======================================================
          MAIN CONTENT
          ====================================================== */}

      <main className="min-h-screen md:ml-[240px]">

        <div className="mx-auto w-full max-w-[1600px] px-6 py-6 md:px-8 md:py-8">

          {/* ==================================================
              WELCOME
              ================================================== */}

          <div className="mb-8">

            <p className="text-sm text-[#5a6a82]">
              Assalamu Alaikum,
            </p>

            <h1 className="mt-1 text-3xl font-bold text-[#0d2260] md:text-4xl">
              Welcome back, {staffName}
            </h1>

            <p className="mt-2 text-sm text-[#5a6a82]">
              Here's an overview of your bookings and the
              latest school notices.
            </p>

          </div>

          {/* ==================================================
              ERROR
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
              SUMMARY CARDS
              ================================================== */}

          <div className="mb-8 grid gap-4 sm:grid-cols-2">

            {/* =================================================
                MY BOOKINGS
                ================================================= */}

            <StatCard
              icon={<CalendarDays size={28} />}
              title="My Bookings"
              value={
                loading
                  ? "..."
                  : bookings.length
              }
              subtitle="Upcoming appointments"
              onClick={() =>
                router.push("/staff/bookings")
              }
            />

            {/* =================================================
                SCHOOL NOTICES
                ================================================= */}

            <StatCard
              icon={<Bell size={28} />}
              title="School Notices"
              value={
                loading
                  ? "..."
                  : noticesCount
              }
              subtitle="Published notices"
              onClick={() =>
                router.push("/staff/school-notices")
              }
            />

          </div>

          {/* ==================================================
              LOWER DASHBOARD
              ================================================== */}

          <div className="grid gap-6 lg:grid-cols-2">

            {/* =================================================
                MY BOOKINGS
                ================================================= */}

            <DashboardCard
              title="My Bookings"
              onViewAll={() =>
                router.push("/staff/bookings")
              }
            >

              {loading ? (
                <div className="rounded-lg bg-[#f7f8fc] p-4">
                  <p className="text-sm text-[#5a6a82]">
                    Loading bookings...
                  </p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="rounded-lg bg-[#f7f8fc] p-4">

                  <p className="text-sm text-[#5a6a82]">
                    Your booking information will appear
                    here.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      router.push("/staff/bookings")
                    }
                    className="mt-3 text-sm font-semibold text-[#0d2260] hover:text-[#c9a227]"
                  >
                    View my bookings →
                  </button>

                </div>
              ) : (
                <div className="space-y-3">

                  {bookings
                    .slice(0, 5)
                    .map((booking) => (
                      <button
                        key={booking.id}
                        type="button"
                        onClick={() =>
                          router.push("/staff/bookings")
                        }
                        className="group w-full rounded-lg bg-[#f7f8fc] p-4 text-left transition hover:bg-[#eef1f8]"
                      >

                        <div className="flex items-center justify-between gap-4">

                          <div>

                            <p className="font-semibold text-[#0d2260]">
                              {booking.appointmentType ||
                                booking.serviceName ||
                                "Appointment"}
                            </p>

                            <p className="mt-1 text-sm text-[#5a6a82]">
                              {booking.date}
                              {booking.time
                                ? ` • ${booking.time}`
                                : ""}
                            </p>

                          </div>

                          <ArrowRight
                            size={16}
                            className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-[#c9a227]"
                          />

                        </div>

                      </button>
                    ))}

                </div>
              )}

            </DashboardCard>

            {/* =================================================
                SCHOOL NOTICES
                ================================================= */}

            <DashboardCard
              title="School Notices"
              onViewAll={() =>
                router.push("/staff/school-notices")
              }
            >

              <div className="space-y-3">

                {loading && (
                  <div className="rounded-lg bg-[#f7f8fc] p-4">
                    <p className="text-sm text-[#5a6a82]">
                      Loading notices...
                    </p>
                  </div>
                )}

                {!loading &&
                  recentNotices.length === 0 && (
                    <div className="rounded-lg bg-[#f7f8fc] p-4">

                      <p className="text-sm text-[#5a6a82]">
                        No published school notices.
                      </p>

                    </div>
                  )}

                {!loading &&
                  recentNotices.length > 0 &&
                  recentNotices.map((notice) => (
                    <button
                      key={notice.id}
                      type="button"
                      onClick={() =>
                        router.push(
                          "/staff/school-notices"
                        )
                      }
                      className="group w-full rounded-lg bg-[#f7f8fc] p-4 text-left transition hover:bg-[#eef1f8]"
                    >

                      <div className="flex items-center justify-between gap-4">

                        <div className="min-w-0">

                          <p className="truncate font-semibold text-[#0d2260]">
                            {notice.title}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-2">

                            {notice.type && (
                              <span className="rounded-full bg-[#c9a227]/15 px-2 py-1 text-[11px] font-semibold text-[#7a5c00]">
                                {notice.type}
                              </span>
                            )}

                            {notice.grade && (
                              <span className="rounded-full bg-[#0d2260]/10 px-2 py-1 text-[11px] font-semibold text-[#0d2260]">
                                {notice.grade}
                              </span>
                            )}

                            {notice.created_at && (
                              <span className="text-xs text-[#5a6a82]">
                                {formatDate(
                                  notice.created_at
                                )}
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
              QUICK LINKS
              ================================================== */}

          <div className="mt-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">

            <h2 className="mb-4 text-lg font-bold text-[#0d2260]">
              Quick Links
            </h2>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

              {/* =================================================
                  BOOKINGS
                  ================================================= */}

              <button
                type="button"
                onClick={() =>
                  router.push("/staff/bookings")
                }
                className="flex items-center gap-3 rounded-lg border border-[#0d2260]/10 p-4 text-left transition hover:border-[#c9a227] hover:bg-[#f7f8fc]"
              >

                <CalendarDays
                  size={20}
                  className="text-[#0d2260]"
                />

                <div>
                  <p className="text-sm font-semibold text-[#0d2260]">
                    My Bookings
                  </p>

                  <p className="text-xs text-[#5a6a82]">
                    View your appointments
                  </p>
                </div>

              </button>

              {/* =================================================
                  NOTICES
                  ================================================= */}

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/staff/school-notices"
                  )
                }
                className="flex items-center gap-3 rounded-lg border border-[#0d2260]/10 p-4 text-left transition hover:border-[#c9a227] hover:bg-[#f7f8fc]"
              >

                <Bell
                  size={20}
                  className="text-[#0d2260]"
                />

                <div>
                  <p className="text-sm font-semibold text-[#0d2260]">
                    School Notices
                  </p>

                  <p className="text-xs text-[#5a6a82]">
                    View published notices
                  </p>
                </div>

              </button>

              {/* =================================================
                  RESOURCES
                  ================================================= */}

              <button
                type="button"
                onClick={() =>
                  router.push("/staff/resources")
                }
                className="flex items-center gap-3 rounded-lg border border-[#0d2260]/10 p-4 text-left transition hover:border-[#c9a227] hover:bg-[#f7f8fc]"
              >

                <BookOpen
                  size={20}
                  className="text-[#0d2260]"
                />

                <div>
                  <p className="text-sm font-semibold text-[#0d2260]">
                    Resources
                  </p>

                  <p className="text-xs text-[#5a6a82]">
                    Access school resources
                  </p>
                </div>

              </button>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}