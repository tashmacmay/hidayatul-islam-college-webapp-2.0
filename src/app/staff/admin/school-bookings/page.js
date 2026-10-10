"use client";

import {
  CalendarDays,
  Clock3,
  FileSpreadsheet,
  Plus,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import BookingsCard from "@/components/bookings/BookingsCard";
import StaffSidebar from "@/components/staff/StaffSidebar";
import { auth } from "@/lib/firebase";
import BookingsStats from "@/components/bookings/BookingsStats";
import BookingStatusBadge from "@/components/bookings/BookingStatusBadge";

export default function SchoolBookingsPage() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("upcoming");

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportFrom, setReportFrom] = useState("");
  const [reportTo, setReportTo] = useState("");
  const [reportError, setReportError] = useState("");
  const [downloading, setDownloading] = useState(false);

  // Auth
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

      const response = await fetch("/api/admin/bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to retrieve bookings");
      }

      setBookings(data);
    } catch (err) {
      console.error("Failed to load admin bookings:", err);
      setError(err.message);
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

      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
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
    } catch (err) {
      console.error("Cancel failed:", err);
      alert(err.message || "Something went wrong cancelling this booking.");
    }
  }

  async function handleDownloadCsv() {
    setReportError("");

    if (reportFrom && reportTo && reportFrom > reportTo) {
      setReportError("'From' must be on or before 'To'.");
      return;
    }

    try {
      setDownloading(true);

      const token = await user.getIdToken();

      const params = new URLSearchParams();
      if (reportFrom) params.append("from", reportFrom);
      if (reportTo) params.append("to", reportTo);

      const qs = params.toString();
      const url = `/api/admin/reporting/bookings.csv${qs ? `?${qs}` : ""}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        let msg = "Failed to download report";
        try {
          const data = await response.json();
          if (data.error) msg = data.error;
        } catch (_) {}
        throw new Error(msg);
      }

      const blob = await response.blob();

      const disposition = response.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename =
        match?.[1] || `bookings-${new Date().toISOString().slice(0, 10)}.csv`;

      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);

      setShowReportModal(false);
      setReportFrom("");
      setReportTo("");
    } catch (err) {
      console.error("Download failed:", err);
      setReportError(err.message);
    } finally {
      setDownloading(false);
    }
  }

  // Search / filter
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
      <StaffSidebar />

      <main className="flex-1 p-6 transition-all duration-300 md:ml-64 md:p-8 lg:p-10">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[3px] text-gold">
              Admin
            </p>

            <h1 className="mt-2 text-4xl font-bold text-navy">
              School Bookings
            </h1>

            <div className="mt-4 h-1 w-16 rounded-full bg-gold" />

            <p className="mt-4 max-w-2xl text-text-muted">
              Manage and monitor all bookings made across the school.
              Administrators can view appointments, search records,
              and create bookings on behalf of parents.
            </p>
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
            title="School Booking Overview"
            titleIcon={Clock3}
            searchPlaceholder="Search by parent, learner, staff or type..."
            actions={
              <>
                <Link
                  href="/staff/admin/school-bookings/create-booking"
                  className="flex w-fit items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-navy transition hover:opacity-90"
                >
                  <Plus size={16} />
                  Book New Appointment
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setReportError("");
                    setShowReportModal(true);
                  }}
                  className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  <FileSpreadsheet size={16} />
                  Generate Report
                </button>
              </>
            }
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="pb-3 font-semibold text-navy">Parent</th>
                    <th className="pb-3 font-semibold text-navy">Learner</th>
                    <th className="pb-3 font-semibold text-navy">Staff</th>
                    <th className="pb-3 font-semibold text-navy">Date</th>
                    <th className="pb-3 font-semibold text-navy">Time</th>
                    <th className="pb-3 font-semibold text-navy">
                      Appointment Type
                    </th>
                    <th className="pb-3 font-semibold text-navy">Status</th>
                    <th className="pb-3 text-right font-semibold text-navy">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading && (
                    <tr>
                      <td
                        colSpan={8}
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
                          <div className="font-medium text-navy">
                            {booking.parentName || "—"}
                          </div>
                          <div className="text-xs text-text-muted">
                            {booking.parentEmail || ""}
                          </div>
                        </td>

                        <td className="py-4 text-slate-600">
                          {booking.learner}
                        </td>

                        <td className="py-4 text-slate-600">
                          {booking.staff}
                        </td>

                        <td className="py-4 text-slate-600">
                          {booking.date}
                        </td>

                        <td className="py-4 text-slate-600">
                          {booking.time}
                        </td>

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
                      <td colSpan={8} className="py-10 text-center">
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

      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-navy">
                Generate Booking Report
              </h2>

              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  From date (optional)
                </label>

                <input
                  type="date"
                  value={reportFrom}
                  onChange={(e) => setReportFrom(e.target.value)}
                  className="w-full rounded-lg border p-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  To date (optional)
                </label>

                <input
                  type="date"
                  value={reportTo}
                  onChange={(e) => setReportTo(e.target.value)}
                  className="w-full rounded-lg border p-3"
                />
              </div>

              <p className="text-xs text-text-muted">
                Leave both blank to export all bookings. Dates are
                interpreted as SAST.
              </p>

              {reportError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm text-red-700">{reportError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  disabled={downloading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gold px-4 py-3 font-semibold text-navy transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FileSpreadsheet size={18} />
                  {downloading ? "Downloading…" : "Download CSV"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="rounded-lg border px-5 py-3 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}