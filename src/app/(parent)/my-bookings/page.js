"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  CalendarDays,
  Plus,
  Search,
  X,
} from "lucide-react";

import ParentSidebar from "@/components/parent/ParentSidebar";
import ResponsiveAppShell from "@/components/layout/ResponsiveAppShell";

// ============================================================
// MY BOOKINGS — PARENT
// ============================================================
//
// This page is currently a UI SHELL.
//
// Microsoft Bookings is the actual booking system.
// The SQL booking table/API will be connected once the database
// structure has been finalised.
//
// SEARCH FOR:
// connectBookingTable
//
// This comment marks the areas that must be connected to the
// final booking table/API.
//
// ============================================================

export default function ParentBookingsPage() {

  // ==========================================================
  // SEARCH / FILTER STATE
  // ==========================================================

  const [searchTerm, setSearchTerm] = useState("");

  const [activeFilter, setActiveFilter] =
    useState("all");


  // ==========================================================
  // CONNECT BOOKING TABLE
  // ==========================================================
  //
  // connectBookingTable
  //
  // Replace this temporary array with data retrieved from the
  // final SQL Bookings table/API.
  //
  // Expected information:
  //
  // - id
  // - booking reference
  // - date
  // - time
  // - appointment type
  // - learner name
  // - staff member
  // - status
  //
  // Microsoft Bookings should remain the source of truth.
  //
  // ==========================================================

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadBookings() {
    try {
      setLoading(true);

      const response = await fetch("/api/bookings");

      if (!response.ok) {
        throw new Error("Failed to retrieve bookings");
      }

      const data = await response.json();

      console.log(
        "Bookings returned by API:",
        data
      );

      setBookings(data);

    } catch (error) {
      console.error(
        "Failed to load bookings:",
        error
      );

      setError(error.message);

    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);


  // ==========================================================
  // CANCEL BOOKING
  // ==========================================================

  async function handleCancel(bookingId) {

    const confirmed = window.confirm(
      "Cancel this booking?"
    );

    if (!confirmed) return;

    try {

      const response = await fetch(
        `/api/bookings/${bookingId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to cancel booking"
        );
      }

      await loadBookings();

    } catch (error) {

      console.error(
        "Cancel failed:",
        error
      );

      alert(
        "Something went wrong cancelling this booking."
      );
    }
  }


  // ==========================================================
  // BOOKING COUNTS
  // ==========================================================

  const upcomingCount =
    bookings.filter(
      (booking) =>
        booking.status === "upcoming"
    ).length;

  const pastCount =
    bookings.filter(
      (booking) =>
        booking.status === "past"
    ).length;

  const totalCount =
    bookings.length;


  // ==========================================================
  // SEARCH / FILTER BOOKINGS
  // ==========================================================

  const filteredBookings =
    bookings.filter((booking) => {

      const search =
        searchTerm.toLowerCase();

      const matchesSearch =
        String(booking.ref || "")
          .toLowerCase()
          .includes(search) ||

        String(booking.learner || "")
          .toLowerCase()
          .includes(search) ||

        String(booking.staff || "")
          .toLowerCase()
          .includes(search) ||

        String(booking.appointmentType || "")
          .toLowerCase()
          .includes(search);

      const matchesFilter =
        activeFilter === "all"
          ? true
          : booking.status === activeFilter;

      return (
        matchesSearch &&
        matchesFilter
      );
    });


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

          {/* ==================================================
              HEADER
              ================================================== */}

          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-sm text-text-muted">
                Manage and track all your appointment bookings
              </p>

              <h1 className="mt-1 text-4xl font-bold text-navy">
                My Bookings
              </h1>

              <div className="mt-3 h-1 w-12 rounded-full bg-gold" />

            </div>


            {/* ================================================
                CREATE NEW BOOKING
                ================================================ */}

            <Link
              href="/my-bookings/create"
              className="flex w-fit items-center gap-2 rounded-lg bg-gold px-4 py-2 font-semibold text-navy transition hover:opacity-90"
            >
              <Plus size={18} />

              Book New Appointment
            </Link>

          </div>


          {/* ==================================================
              ERROR MESSAGE
              ================================================== */}

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3">

              <p className="text-sm text-red-700">
                {error}
              </p>

            </div>
          )}


          {/* ==================================================
              STATS
              ================================================== */}

          <div className="mb-8 grid gap-4 md:grid-cols-3">

            {/* Upcoming */}

            <div className="rounded-xl bg-white p-6 shadow-sm">

              <p className="text-sm text-text-muted">
                Upcoming
              </p>

              <h2 className="mt-2 text-3xl font-bold text-navy">
                {loading
                  ? "..."
                  : upcomingCount}
              </h2>

            </div>


            {/* Past */}

            <div className="rounded-xl bg-white p-6 shadow-sm">

              <p className="text-sm text-text-muted">
                Past
              </p>

              <h2 className="mt-2 text-3xl font-bold text-navy">
                {loading
                  ? "..."
                  : pastCount}
              </h2>

            </div>


            {/* Total */}

            <div className="rounded-xl bg-white p-6 shadow-sm">

              <p className="text-sm text-text-muted">
                Total
              </p>

              <h2 className="mt-2 text-3xl font-bold text-navy">
                {loading
                  ? "..."
                  : totalCount}
              </h2>

            </div>

          </div>


          {/* ==================================================
              ALL BOOKINGS
              ================================================== */}

          <div className="rounded-xl bg-white p-4 shadow-sm sm:p-6">

            {/* ================================================
                TABLE HEADER
                ================================================ */}

            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

              <div className="flex items-center gap-2">

                <CalendarDays
                  size={20}
                  className="shrink-0 text-navy"
                />

                <h2 className="text-xl font-bold text-navy">
                  All Bookings
                </h2>

              </div>


              {/* Search */}

              <div className="relative w-full md:w-auto">

                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />

                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold md:w-72"
                />

              </div>

            </div>


            {/* ================================================
                FILTERS
                ================================================ */}

            <div className="mb-6 flex flex-wrap gap-2">

              {[
                "all",
                "upcoming",
                "past",
              ].map((filter) => (

                <button
                  key={filter}
                  type="button"
                  onClick={() =>
                    setActiveFilter(filter)
                  }
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    activeFilter === filter
                      ? "bg-navy text-white"
                      : "bg-gray-100 text-text-muted hover:bg-gray-200"
                  }`}
                >

                  {filter
                    .charAt(0)
                    .toUpperCase() +
                    filter.slice(1)}

                </button>

              ))}

            </div>


            {/* ================================================
                TABLE

                overflow-x-auto is intentional.

                On narrow screens the booking table can scroll
                horizontally instead of breaking the layout.
                ================================================ */}

            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px] text-left">

                <thead>

                  <tr className="border-b">

                    <th className="pb-3">
                      Ref
                    </th>

                    <th className="pb-3">
                      Date
                    </th>

                    <th className="pb-3">
                      Time
                    </th>

                    <th className="pb-3">
                      Appointment Type
                    </th>

                    <th className="pb-3">
                      Learner Name
                    </th>

                    <th className="pb-3">
                      Staff
                    </th>

                    <th className="pb-3 text-right">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {/* ==========================================
                      LOADING STATE
                      ========================================== */}

                  {loading && (

                    <tr>

                      <td
                        colSpan={7}
                        className="py-10 text-center text-sm text-text-muted"
                      >
                        Loading bookings...
                      </td>

                    </tr>

                  )}


                  {/* ==========================================
                      BOOKING RECORDS
                      ========================================== */}

                  {!loading &&
                    filteredBookings.map(
                      (booking) => (

                        <tr
                          key={booking.id}
                          className="border-b last:border-0"
                        >

                          <td className="py-4 font-medium text-navy">
                            {booking.ref}
                          </td>

                          <td>
                            {booking.date}
                          </td>

                          <td>
                            {booking.time}
                          </td>

                          <td>
                            {booking.appointmentType}
                          </td>

                          <td>
                            {booking.learner}
                          </td>

                          <td>
                            {booking.staff}
                          </td>

                          <td className="text-right">

                            {booking.status ===
                            "upcoming" ? (

                              <button
                                type="button"
                                onClick={() =>
                                  handleCancel(
                                    booking.id
                                  )
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                              >
                                <X size={16} />

                                Cancel

                              </button>

                            ) : (

                              <span className="text-gray-400">
                                —
                              </span>

                            )}

                          </td>

                        </tr>

                      )
                    )}


                  {/* ==========================================
                      EMPTY STATE
                      ========================================== */}

                  {!loading &&
                    filteredBookings.length ===
                      0 && (

                      <tr>

                        <td
                          colSpan={7}
                          className="py-10 text-center"
                        >

                          <CalendarDays
                            size={32}
                            className="mx-auto mb-3 text-gray-300"
                          />

                          <p className="font-medium text-navy">
                            No bookings found
                          </p>

                          <p className="mt-1 text-sm text-text-muted">
                            Your Microsoft Bookings appointments
                            will appear here once the booking
                            database is connected.
                          </p>

                        </td>

                      </tr>

                    )}

                </tbody>

              </table>

            </div>

          </div>

        </div>

      </main>

    </ResponsiveAppShell>
  );
}