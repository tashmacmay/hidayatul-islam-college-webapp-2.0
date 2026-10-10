"use client";

import { CalendarDays, Menu, Plus, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import BookingsCard from "@/components/bookings/BookingsCard";
import StaffSidebar from "@/components/staff/StaffSidebar";
import { auth } from "@/lib/firebase";
import BookingsStats from "@/components/bookings/BookingsStats";
import BookingStatusBadge from "@/components/bookings/BookingStatusBadge";

export default function BookingsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("upcoming");

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

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
        throw new Error(data.error || "Failed to retrieve bookings");
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

      const response = await fetch(`/api/staff/bookings/${bookingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to cancel booking");
      }

      await loadBookings();
    } catch (error) {
      console.error("Cancel failed:", error);
      alert(error.message || "Something went wrong cancelling this booking.");
    }
  }

  const filteredBookings = bookings
    .filter((booking) => {
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
    })
    .sort((a, b) => {
      const aTime = new Date(a.startDateTime).getTime();
      const bTime = new Date(b.startDateTime).getTime();
      if (activeFilter === "upcoming") return aTime - bTime;
      return bTime - aTime;
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
      <StaffSidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />

      <main
        className={`flex-1 p-6 transition-all duration-300 md:p-8 lg:p-10 ${
          isSidebarOpen ? "md:ml-64" : "ml-0"
        }`}
      >
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

            <h1 className="mt-1 text-4xl font-bold text-navy">My Bookings</h1>

            <div className="mt-3 h-1 w-12 rounded-full bg-gold" />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Stats */}
          <BookingsStats bookings={bookings} loading={loading} />

          {/* Bookings card */}
          <BookingsCard
            title="My Bookings"
            titleIcon={CalendarDays}
            actions={
              <Link
                href="/staff/bookings/create-booking"
                className="flex w-fit items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-navy transition hover:opacity-90"
              >
                <Plus size={16} />
                Book New Appointment
              </Link>
            }
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="pb-3 font-semibold text-navy">Parent</th>
                    <th className="pb-3 font-semibold text-navy">Learner</th>
                    <th className="pb-3 font-semibold text-navy">Date</th>
                    <th className="pb-3 font-semibold text-navy">Time</th>
                    <th className="pb-3 font-semibold text-navy">Appointment Type</th>
                    <th className="pb-3 font-semibold text-navy">Status</th>
                    <th className="pb-3 text-right font-semibold text-navy">Action</th>
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
                        <td className="py-4">
                          <div className="font-medium text-slate-800">
                            {booking.parentName || "—"}
                          </div>
                          <div className="text-xs text-text-muted">
                            {booking.parentEmail || ""}
                          </div>
                        </td>

                        <td className="py-4 text-slate-600">{booking.learner}</td>
                        <td className="py-4 text-slate-600">{booking.date}</td>
                        <td className="py-4 text-slate-600">{booking.time}</td>
                        <td className="py-4 text-slate-600">
                          {booking.appointmentType}
                        </td>

                        <td className="py-4">
                          <BookingStatusBadge status={booking.status} />
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
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}

                  {!loading && filteredBookings.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-10 text-center">
                        <CalendarDays
                          size={32}
                          className="mx-auto mb-3 text-gray-300"
                        />

                        <p className="font-medium text-navy">
                          No bookings found
                        </p>

                        <p className="mt-1 text-sm text-text-muted">
                          {searchTerm || activeFilter !== "upcoming"
                            ? "Try adjusting your search or filters."
                            : "No Microsoft Bookings appointments were returned."}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </BookingsCard>
        </div>
      </main>
    </div>
  );
}