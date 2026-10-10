"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

import { CalendarDays, Plus, X } from "lucide-react";

import BookingsCard from "@/components/bookings/BookingsCard";
import ParentSidebar from "@/components/parent/ParentSidebar";
import ResponsiveAppShell from "@/components/layout/ResponsiveAppShell";
import BookingsStats from "@/components/bookings/BookingsStats";
import BookingStatusBadge from "@/components/bookings/BookingStatusBadge";

export default function ParentBookingsPage() {
  const { user, loading: authLoading } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("upcoming");

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadBookings() {
    try {
      setLoading(true);

      const token = await user.getIdToken();

      const response = await fetch("/api/bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to retrieve bookings");
      }

      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error("Failed to load bookings:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    loadBookings();
  }, [authLoading, user]);

  async function handleCancel(bookingId) {
    const confirmed = window.confirm("Cancel this booking?");
    if (!confirmed) return;

    try {
      const token = await user.getIdToken();

      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to cancel booking");
      }

      await loadBookings();
    } catch (error) {
      console.error("Cancel failed:", error);
      alert("Something went wrong cancelling this booking.");
    }
  }

  const filteredBookings = bookings
    .filter((booking) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        String(booking.learner || "").toLowerCase().includes(search) ||
        String(booking.staff || "").toLowerCase().includes(search) ||
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

  return (
    <ResponsiveAppShell
      sidebar={(sidebarProps) => <ParentSidebar {...sidebarProps} />}
    >
      <main className="min-h-screen bg-off-white">
        <div className="w-full px-4 py-6 sm:px-6 md:px-8 md:py-8 xl:px-10">
          {/* Header */}
          <div className="mb-8">
            <p className="text-sm text-text-muted">
              Manage and track all your appointment bookings
            </p>

            <h1 className="mt-1 text-4xl font-bold text-navy">
              My Bookings
            </h1>

            <div className="mt-3 h-1 w-12 rounded-full bg-gold" />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Stats */}
          <div className="mb-8">
            <BookingsStats bookings={bookings} loading={loading} />
          </div>

          {/* Bookings card */}
          <BookingsCard
            title="All Bookings"
            titleIcon={CalendarDays}
            actions={
              <Link
                href="/my-bookings/create"
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
                    <th className="pb-3 font-semibold text-navy">Learner</th>
                    <th className="pb-3 font-semibold text-navy">Staff</th>
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
                        Loading bookings...
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    filteredBookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="py-4 text-slate-600">{booking.learner}</td>
                        <td className="py-4 text-slate-600">{booking.staff}</td>
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
    </ResponsiveAppShell>
  );
}