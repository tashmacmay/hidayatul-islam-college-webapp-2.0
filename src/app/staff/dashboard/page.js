"use client";

import StaffSidebar from "@/components/staff/StaffSidebar";

import {
  CalendarDays,
  Bell,
  BookOpen,
  Users,
  ArrowRight,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ============================================================
// LOGIN / AUTHENTICATION — TEMPORARILY DISABLED
// ============================================================
// Keep these imports for when authentication is enabled again.
//
// import { onAuthStateChanged } from "firebase/auth";
// import { auth } from "@/lib/firebase";
// ============================================================


// ============================================================
// STAT CARD
// ============================================================
// Reusable dashboard statistic card.
//
// The entire card is clickable.
//
// Bookings Today -> /staff/bookings
// Notices        -> /staff/notices
// Resources      -> /staff/resources
// Parents        -> /staff/users
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

      {/* ======================================================
          ICON
          ====================================================== */}

      <div className="mb-4 flex items-center justify-between">

        <div className="text-[#0d2260]">
          {icon}
        </div>

        <ArrowRight
          size={18}
          className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-[#c9a227]"
        />

      </div>


      {/* ======================================================
          TITLE
          ====================================================== */}

      <p className="text-sm text-[#5a6a82]">
        {title}
      </p>


      {/* ======================================================
          VALUE
          ====================================================== */}

      <h3 className="mt-1 text-3xl font-bold text-[#0d2260]">
        {value}
      </h3>


      {/* ======================================================
          SUBTITLE
          ====================================================== */}

      <p className="mt-1 text-sm text-[#5a6a82]">
        {subtitle}
      </p>

    </button>
  );
}


// ============================================================
// DASHBOARD CARD
// ============================================================
// Reusable white card used for:
//
// - Today's Bookings
// - Recent Notices
//
// "View all" is optional.
// ============================================================

function DashboardCard({
  title,
  children,
  onViewAll,
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">

      {/* ======================================================
          CARD HEADER
          ====================================================== */}

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


      {/* ======================================================
          CARD CONTENT
          ====================================================== */}

      {children}

    </div>
  );
}


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

  // ==========================================================
  // LOGIN / AUTHENTICATION — TEMPORARILY DISABLED
  // ==========================================================
  // When authentication is ready, uncomment this section.
  //
  // const [user, setUser] = useState(null);
  // const [authLoading, setAuthLoading] = useState(true);
  //
  // useEffect(() => {
  //
  //   const unsubscribe = onAuthStateChanged(
  //     auth,
  //     (currentUser) => {
  //
  //       if (!currentUser) {
  //
  //         router.push("/login");
  //
  //       } else {
  //
  //         setUser(currentUser);
  //
  //       }
  //
  //       setAuthLoading(false);
  //
  //     }
  //   );
  //
  //   return () => unsubscribe();
  //
  // }, [router]);
  //
  //
  // if (authLoading) {
  //
  //   return (
  //     <div className="flex min-h-[60vh] items-center justify-center">
  //
  //       <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#c9a227] border-t-transparent" />
  //
  //     </div>
  //   );
  //
  // }
  //
  //
  // if (!user) return null;
  // ==========================================================


  // ==========================================================
  // ROUTER
  // ==========================================================
  // Router is NOT part of login.
  //
  // It is required for dashboard navigation.
  //
  // Examples:
  //
  // router.push("/staff/bookings")
  // router.push("/staff/notices")
  // router.push("/staff/resources")
  // router.push("/staff/users")
  // ==========================================================

  const router = useRouter();


  // ==========================================================
  // DASHBOARD DATA
  // ==========================================================
  // Stores the information returned from:
  //
  // /api/staff/dashboard
  // ==========================================================

  const [dashboard, setDashboard] = useState({
    bookings: [],
    notices: [],
    resourceCount: 0,
    parentCount: 0,
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
  // LOAD DASHBOARD DATA
  // ==========================================================
  // Runs when the dashboard loads.
  //
  // Calls:
  //
  // GET /api/staff/dashboard
  //
  // The API gets information from SQL Server.
  // ==========================================================

  useEffect(() => {

    async function loadDashboard() {

      try {

        // ------------------------------------------------------
        // START LOADING
        // ------------------------------------------------------

        setLoading(true);

        setError("");


        // ------------------------------------------------------
        // REQUEST DASHBOARD DATA
        // ------------------------------------------------------

        const response = await fetch(
          "/api/staff/dashboard"
        );


        // ------------------------------------------------------
        // CHECK RESPONSE
        // ------------------------------------------------------

        if (!response.ok) {

          throw new Error(
            "Failed to load dashboard"
          );

        }


        // ------------------------------------------------------
        // CONVERT RESPONSE TO JSON
        // ------------------------------------------------------

        const data = await response.json();


        // ------------------------------------------------------
        // SAVE DASHBOARD DATA
        // ------------------------------------------------------

        setDashboard({

          bookings: Array.isArray(data.bookings)
            ? data.bookings
            : [],

          notices: Array.isArray(data.notices)
            ? data.notices
            : [],

          resourceCount:
            Number(data.resourceCount) || 0,

          parentCount:
            Number(data.parentCount) || 0,

        });

      } catch (err) {

        // ------------------------------------------------------
        // HANDLE ERROR
        // ------------------------------------------------------

        console.error(
          "❌ Error loading staff dashboard:",
          err
        );

        setError(
          "Unable to load dashboard data. Please try again."
        );

      } finally {

        // ------------------------------------------------------
        // STOP LOADING
        // ------------------------------------------------------

        setLoading(false);

      }

    }


    loadDashboard();

  }, []);


  // ==========================================================
  // DASHBOARD STATISTICS
  // ==========================================================

  const bookingsToday =
    dashboard.bookings.length;

  const noticesCount =
    dashboard.notices.length;


  // ==========================================================
  // FORMAT TIME
  // ==========================================================
  // Converts database date/time into readable time.
  //
  // Example:
  //
  // 2026-08-19T09:00:00
  //
  // becomes:
  //
  // 09:00
  // ==========================================================

  function formatTime(value) {

    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleTimeString(
      "en-ZA",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }
    );

  }


  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  function formatDate(value) {

    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString(
      "en-ZA",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );

  }


  // ==========================================================
  // PAGE
  // ==========================================================

  return (

    <div className="min-h-screen bg-[#f0f2f7]">


      {/* ======================================================
          STAFF SIDEBAR
          ====================================================== */}

      <StaffSidebar />


      {/* ======================================================
          MAIN CONTENT
          ====================================================== */}

      <main className="min-h-screen md:ml-[240px]">

        <div className="mx-auto w-full max-w-[1600px] px-6 py-6 md:px-8 md:py-8">


          {/* ==================================================
              WELCOME HEADER
              ================================================== */}

          <div className="mb-8">

            <p className="text-sm text-[#5a6a82]">
              Assalamu Alaikum,
            </p>

            <h1 className="mt-1 text-3xl font-bold text-[#0d2260] md:text-4xl">
              Welcome back, Staff Member
            </h1>

            <p className="mt-2 text-sm text-[#5a6a82]">
              Here's an overview of what's happening at
              Hidayatul Islam College.
            </p>

          </div>


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

          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">


            {/* =================================================
                BOOKINGS
                ================================================= */}

            <StatCard

              icon={
                <CalendarDays size={28} />
              }

              title="Bookings Today"

              value={
                loading
                  ? "..."
                  : bookingsToday
              }

              subtitle="Scheduled appointments"

              onClick={() =>
                router.push("/staff/bookings")
              }

            />


            {/* =================================================
                NOTICES
                ================================================= */}

            <StatCard

              icon={
                <Bell size={28} />
              }

              title="Notices"

              value={
                loading
                  ? "..."
                  : noticesCount
              }

              subtitle="Published announcements"

              onClick={() =>
                router.push("/staff/notices")
              }

            />


            {/* =================================================
                RESOURCES
                ================================================= */}

            <StatCard

              icon={
                <BookOpen size={28} />
              }

              title="Resources"

              value={
                loading
                  ? "..."
                  : dashboard.resourceCount
              }

              subtitle="Available resources"

              onClick={() =>
                router.push("/staff/resources")
              }

            />


            {/* =================================================
                PARENTS
                ================================================= */}

            <StatCard

              icon={
                <Users size={28} />
              }

              title="Parents"

              value={
                loading
                  ? "..."
                  : dashboard.parentCount
              }

              subtitle="Registered parents"

              onClick={() =>
                router.push("/staff/users")
              }

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

              onViewAll={() =>
                router.push("/staff/bookings")
              }

            >

              <div className="space-y-3">


                {/* ---------------------------------------------
                    LOADING
                    --------------------------------------------- */}

                {loading && (

                  <div className="rounded-lg bg-[#f7f8fc] p-4">

                    <p className="text-sm text-[#5a6a82]">
                      Loading bookings...
                    </p>

                  </div>

                )}


                {/* ---------------------------------------------
                    NO BOOKINGS
                    --------------------------------------------- */}

                {!loading &&
                  dashboard.bookings.length === 0 && (

                    <div className="rounded-lg bg-[#f7f8fc] p-4">

                      <p className="text-sm text-[#5a6a82]">
                        No bookings scheduled for today.
                      </p>

                    </div>

                )}


                {/* ---------------------------------------------
                    BOOKINGS
                    --------------------------------------------- */}

                {!loading &&
                  dashboard.bookings.length > 0 &&

                  dashboard.bookings.map(
                    (booking) => (

                      <button
                        key={booking.id}
                        type="button"
                        onClick={() =>
                          router.push(
                            "/staff/bookings"
                          )
                        }
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

                              {formatTime(
                                booking.start_time
                              )}

                              {booking.end_time
                                ? ` - ${formatTime(
                                    booking.end_time
                                  )}`
                                : ""}

                            </p>

                          </div>


                          <ArrowRight
                            size={16}
                            className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-[#c9a227]"
                          />

                        </div>


                        {/* STATUS */}

                        {booking.status && (

                          <span className="mt-2 inline-block rounded-full bg-[#0d2260]/10 px-2.5 py-1 text-xs font-semibold text-[#0d2260]">
                            {booking.status}
                          </span>

                        )}

                      </button>

                    )
                  )

                }

              </div>

            </DashboardCard>


            {/* =================================================
                RECENT NOTICES
                ================================================= */}

            <DashboardCard

              title="Recent Notices"

              onViewAll={() =>
                router.push("/staff/notices")
              }

            >

              <div className="space-y-3">


                {/* ---------------------------------------------
                    LOADING
                    --------------------------------------------- */}

                {loading && (

                  <div className="rounded-lg bg-[#f7f8fc] p-4">

                    <p className="text-sm text-[#5a6a82]">
                      Loading notices...
                    </p>

                  </div>

                )}


                {/* ---------------------------------------------
                    NO NOTICES
                    --------------------------------------------- */}

                {!loading &&
                  dashboard.notices.length === 0 && (

                    <div className="rounded-lg bg-[#f7f8fc] p-4">

                      <p className="text-sm text-[#5a6a82]">
                        No recent notices.
                      </p>

                    </div>

                )}


                {/* ---------------------------------------------
                    NOTICE LIST
                    --------------------------------------------- */}

                {!loading &&
                  dashboard.notices.length > 0 &&

                  dashboard.notices.map(
                    (notice) => (

                      <button
                        key={notice.id}
                        type="button"
                        onClick={() =>
                          router.push(
                            "/staff/notices"
                          )
                        }
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

                    )
                  )

                }

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


              {/* =================================================
                  MANAGE BOOKINGS
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

                <span className="text-sm font-semibold text-[#0d2260]">
                  Manage Bookings
                </span>

              </button>


              {/* =================================================
                  MANAGE NOTICES
                  ================================================= */}

              <button
                type="button"
                onClick={() =>
                  router.push("/staff/notices")
                }
                className="flex items-center gap-3 rounded-lg border border-[#0d2260]/10 p-4 text-left transition hover:border-[#c9a227] hover:bg-[#f7f8fc]"
              >

                <Bell
                  size={20}
                  className="text-[#0d2260]"
                />

                <span className="text-sm font-semibold text-[#0d2260]">
                  Manage Notices
                </span>

              </button>


              {/* =================================================
                  MANAGE RESOURCES
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

                <span className="text-sm font-semibold text-[#0d2260]">
                  Manage Resources
                </span>

              </button>


              {/* =================================================
                  VIEW PARENTS
                  ================================================= */}

              <button
                type="button"
                onClick={() =>
                  router.push("/staff/users")
                }
                className="flex items-center gap-3 rounded-lg border border-[#0d2260]/10 p-4 text-left transition hover:border-[#c9a227] hover:bg-[#f7f8fc]"
              >

                <Users
                  size={20}
                  className="text-[#0d2260]"
                />

                <span className="text-sm font-semibold text-[#0d2260]">
                  View Parents
                </span>

              </button>

            </div>

          </div>

        </div>

      </main>

    </div>

  );
}