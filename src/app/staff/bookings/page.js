"use client";

import {
  CalendarDays,
  X,
  Menu,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import StaffSidebar from "@/components/staff/StaffSidebar";
import { auth } from "@/lib/firebase";

export default function BookingsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  /*
   * Check whether the staff member is logged in.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        window.location.href = "/login";
        return;
      }

      setUser(currentUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

    async function loadBookings() {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const token = await user.getIdToken();

      const response = await fetch("/api/staff/bookings", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to retrieve bookings"
        );
      }

      setBookings(data);
    } catch (error) {
      console.error("Failed to load staff bookings:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!user) return;
    loadBookings();
  }, [user]);

  async function handleCancel(bookingId) {
    const confirmed = window.confirm("Cancel this booking?");
    if (!confirmed) return;

    try {
      const token = await user.getIdToken();

      const response = await fetch(
        `/api/staff/bookings/${bookingId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to cancel booking");
      }

      await loadBookings();
    } catch (error) {
      console.error("Cancel failed:", error);
      alert(
        error.message || "Something went wrong cancelling this booking."
      );
    }
  }

  const upcomingCount = bookings.filter(
    (booking) => booking.status === "upcoming"
  ).length;

  const pastCount = bookings.filter(
    (booking) => booking.status === "past"
  ).length;

  const totalCount = bookings.length;

    const filteredBookings = bookings.filter((booking) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      String(booking.ref || "").toLowerCase().includes(search) ||
      String(booking.learner || "").toLowerCase().includes(search) ||
      String(booking.staff || "").toLowerCase().includes(search) ||
      String(booking.parentEmail || "").toLowerCase().includes(search) ||
      String(booking.parentName || "").toLowerCase().includes(search) ||
      String(booking.appointmentType || "").toLowerCase().includes(search);

    const matchesFilter =
      activeFilter === "all" ? true : booking.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <StaffSidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
      />

      {/* Main Content */}
      <main
        className={`flex-1 p-6 transition-all duration-300 md:p-8 lg:p-10 ${
          isSidebarOpen ? "md:ml-64" : "ml-0"
        }`}
      >
        {/* Mobile Sidebar Button */}
        {!isSidebarOpen && (
          <button
            type="button"
            onClick={toggleSidebar}
            className="mb-6 rounded-lg p-2 text-navy hover:bg-white md:hidden"
            aria-label="Open sidebar"
          >
            <Menu size={28} />
          </button>
        )}

        <div className="space-y-8">
          {/* Header */}
          <div>
            <p className="text-sm text-text-muted">
              View and manage your Microsoft Bookings appointments
            </p>

            <h1 className="mt-1 text-4xl font-bold text-navy">
              My Bookings
            </h1>

            <div className="mt-3 h-1 w-12 rounded-full bg-gold" />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm text-text-muted">
                Upcoming
              </p>

              <h2 className="mt-2 text-3xl font-bold text-navy">
                {loading ? "..." : upcomingCount}
              </h2>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm text-text-muted">
                Past
              </p>

              <h2 className="mt-2 text-3xl font-bold text-navy">
                {loading ? "..." : pastCount}
              </h2>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm text-text-muted">
                Total
              </p>

              <h2 className="mt-2 text-3xl font-bold text-navy">
                {loading ? "..." : totalCount}
              </h2>
            </div>
          </div>

          {/* My Bookings Table */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays size={20} className="text-navy" />

                <h2 className="text-xl font-bold text-navy">
                  My Bookings
                </h2>
              </div>

              <div className="relative w-full md:w-auto">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />

                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold md:w-72"
                />
              </div>
            </div>

            <div className="mb-5 flex flex-wrap gap-2">
              {["all", "upcoming", "past"].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    activeFilter === filter
                      ? "bg-navy text-white"
                      : "bg-gray-100 text-text-muted hover:bg-gray-200"
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="pb-3 font-semibold text-navy">
                      Booking
                    </th>

                    <th className="pb-3 font-semibold text-navy">
                      Date
                    </th>

                    <th className="pb-3 font-semibold text-navy">
                      Time
                    </th>

                    <th className="pb-3 font-semibold text-navy">
                      Learner
                    </th>

                    <th className="pb-3 font-semibold text-navy">
                      Parent
                    </th>

                    <th className="pb-3 font-semibold text-navy">
                      Status
                    </th>

                    <th className="pb-3 text-right font-semibold text-navy">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading && (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-10 text-center text-sm text-text-muted"
                      >
                        Loading bookings from Microsoft Bookings...
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    filteredBookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="py-4 font-medium text-slate-800">
                          {booking.appointmentType}
                        </td>

                        <td className="py-4 text-slate-600">
                          {booking.date}
                        </td>

                        <td className="py-4 text-slate-600">
                          {booking.time}
                        </td>

                        <td className="py-4 text-slate-600">
                          {booking.learner}
                        </td>

                        <td className="py-4">
                          <div className="font-medium text-slate-800">
                            {booking.parentName || "—"}
                          </div>
                          <div className="text-xs text-text-muted">
                            {booking.parentEmail || ""}
                          </div>
                        </td>

                        <td className="py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              booking.status === "upcoming"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {booking.status === "upcoming"
                              ? "Upcoming"
                              : "Past"}
                          </span>
                        </td>

                        <td className="py-4 text-right">
                          {booking.status === "upcoming" ? (
                            <button
                              type="button"
                              onClick={() => handleCancel(booking.id)}
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
                    ))}

                  {!loading && filteredBookings.length === 0 && (
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
                          {searchTerm || activeFilter !== "all"
                            ? "Try adjusting your search or filters."
                            : "No Microsoft Bookings appointments were returned."}
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
    </div>
  );
}