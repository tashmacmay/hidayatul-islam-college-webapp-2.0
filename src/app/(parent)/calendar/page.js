"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  FileText,
  Image as ImageIcon,
  RefreshCw,
  X,
  Filter,
} from "lucide-react";
import ParentSidebar from "@/components/parent/ParentSidebar";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";

const TERMS = [1, 2, 3, 4];

const GRADES = [
  "All Grades",
  "Grade R",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
];

export default function ParentCalendarPage() {
  const [calendars, setCalendars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedTerm, setSelectedTerm] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("all");

  const [viewingCalendar, setViewingCalendar] =
    useState(null);

  // ==========================================================
  // Load calendars
  // ==========================================================

  useEffect(() => {
    loadCalendars();
  }, []);

  async function loadCalendars() {
    try {
      setLoading(true);
      setError("");

      const auth = getAuth(app);
      const user = auth.currentUser;

      if (!user) {
        setError(
          "You must be logged in to view the school calendar."
        );
        return;
      }

      const token = await user.getIdToken();

      const response = await fetch("/api/calendar", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to load calendars."
        );
      }

      setCalendars(data.calendars || []);
    } catch (error) {
      console.error(
        "Calendar loading error:",
        error
      );

      setError(
        error.message ||
          "Failed to load calendars."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // Filter calendars
  // ==========================================================

  const filteredCalendars = useMemo(() => {
    return calendars.filter((calendar) => {
      const matchesTerm =
        selectedTerm === "all" ||
        String(calendar.term) === selectedTerm;

      const matchesGrade =
        selectedGrade === "all" ||
        calendar.grade === selectedGrade ||
        calendar.grade === "All Grades";

      return matchesTerm && matchesGrade;
    });
  }, [
    calendars,
    selectedTerm,
    selectedGrade,
  ]);

  // ==========================================================
  // Group calendars by term
  // ==========================================================

  const calendarsByTerm = useMemo(() => {
    const grouped = {};

    TERMS.forEach((term) => {
      grouped[term] = filteredCalendars.filter(
        (calendar) =>
          Number(calendar.term) === term
      );
    });

    return grouped;
  }, [filteredCalendars]);

  // ==========================================================
  // Open calendar
  // ==========================================================

  function openViewModal(calendar) {
    setViewingCalendar(calendar);
  }

  function closeViewModal() {
    setViewingCalendar(null);
  }

  // ==========================================================
  // Render
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-100">
      <ParentSidebar />

      <main className="min-h-screen md:ml-[240px]">
        <div className="mx-auto w-full max-w-[1600px] px-5 py-6 md:px-8 md:py-8">

          {/* ================================================= */}
          {/* Header */}
          {/* ================================================= */}

          <div className="mb-6">
            <div className="mb-1 flex items-center gap-2">
              <CalendarDays
                size={21}
                className="text-gold"
              />

              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Parent Portal
              </span>
            </div>

            <h1 className="text-2xl font-bold text-navy md:text-3xl">
              School Calendar
            </h1>

            <p className="mt-1 text-sm text-text-muted">
              View the school calendar by term and grade.
            </p>
          </div>

          {/* ================================================= */}
          {/* Filters */}
          {/* ================================================= */}

          <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Filter
                size={17}
                className="text-gold"
              />

              <h2 className="text-sm font-bold text-navy">
                Filter Calendar
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              {/* Term */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-navy">
                  Term
                </label>

                <select
                  value={selectedTerm}
                  onChange={(e) =>
                    setSelectedTerm(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-text outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                >
                  <option value="all">
                    All Terms
                  </option>

                  {TERMS.map((term) => (
                    <option
                      key={term}
                      value={term}
                    >
                      Term {term}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grade */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-navy">
                  Grade
                </label>

                <select
                  value={selectedGrade}
                  onChange={(e) =>
                    setSelectedGrade(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-text outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                >
                  <option value="all">
                    All Grades
                  </option>

                  {GRADES.filter(
                    (grade) =>
                      grade !== "All Grades"
                  ).map((grade) => (
                    <option
                      key={grade}
                      value={grade}
                    >
                      {grade}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* Error */}
          {/* ================================================= */}

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ================================================= */}
          {/* Loading */}
          {/* ================================================= */}

          {loading ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm">
              <RefreshCw
                size={24}
                className="mx-auto mb-3 animate-spin text-gold"
              />

              <p className="text-sm text-text-muted">
                Loading calendars...
              </p>
            </div>
          ) : (
            <>
              {/* ================================================= */}
              {/* Terms */}
              {/* ================================================= */}

              <div className="space-y-4">
                {TERMS.map((term) => {
                  const termCalendars =
                    calendarsByTerm[term];

                  // Don't show empty terms when a
                  // specific term is selected.
                  if (
                    selectedTerm !== "all" &&
                    String(term) !== selectedTerm
                  ) {
                    return null;
                  }

                  return (
                    <section
                      key={term}
                      className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
                    >
                      {/* Term heading */}

                      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy">
                          <CalendarDays
                            size={17}
                            className="text-gold"
                          />
                        </div>

                        <div>
                          <h2 className="text-lg font-bold text-navy">
                            Term {term}
                          </h2>

                          <p className="text-xs text-text-muted">
                            School calendar
                          </p>
                        </div>
                      </div>

                      {/* Calendars */}

                      <div className="p-5">
                        {termCalendars.length ===
                        0 ? (
                          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
                            <CalendarDays
                              size={24}
                              className="mx-auto mb-2 text-slate-300"
                            />

                            <p className="text-sm font-semibold text-text-muted">
                              No calendar available
                            </p>

                            <p className="mt-1 text-xs text-text-muted">
                              There is no calendar uploaded
                              for this selection yet.
                            </p>
                          </div>
                        ) : (
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {termCalendars.map(
                              (calendar) => (
                                <button
                                  key={calendar.id}
                                  onClick={() =>
                                    openViewModal(
                                      calendar
                                    )
                                  }
                                  className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-gold hover:bg-slate-50"
                                >
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                                    {calendar.file_type ===
                                    "PDF" ? (
                                      <FileText
                                        size={19}
                                        className="text-red-500"
                                      />
                                    ) : (
                                      <ImageIcon
                                        size={19}
                                        className="text-blue-500"
                                      />
                                    )}
                                  </div>

                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-navy">
                                      {calendar.grade}
                                    </p>

                                    <p className="mt-0.5 truncate text-xs text-text-muted">
                                      {calendar.file_name}
                                    </p>

                                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-gold">
                                      View Calendar
                                    </p>
                                  </div>
                                </button>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </section>
                  );
                })}
              </div>

              {/* ================================================= */}
              {/* No results */}
              {/* ================================================= */}

              {filteredCalendars.length === 0 && (
                <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm">
                  <CalendarDays
                    size={28}
                    className="mx-auto mb-3 text-slate-300"
                  />

                  <h2 className="text-base font-bold text-navy">
                    No calendars found
                  </h2>

                  <p className="mt-1 text-sm text-text-muted">
                    Try changing your term or grade filter.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ===================================================== */}
      {/* View Calendar Modal */}
      {/* ===================================================== */}

      {viewingCalendar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/40 p-4">
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* Header */}

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-navy">
                    Term {viewingCalendar.term}
                  </h2>

                  <span className="text-slate-300">
                    /
                  </span>

                  <span className="text-sm font-semibold text-text-muted">
                    {viewingCalendar.grade}
                  </span>
                </div>

                <p className="mt-0.5 text-xs text-text-muted">
                  {viewingCalendar.file_name}
                </p>
              </div>

              <button
                onClick={closeViewModal}
                className="rounded-lg p-2 text-text-muted transition hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            {/* Preview */}

            <div className="min-h-0 flex-1 overflow-auto bg-slate-100 p-5">
              {viewingCalendar.file_type ===
              "PDF" ? (
                <iframe
                  src={
                    viewingCalendar.file_url
                  }
                  title={
                    viewingCalendar.file_name
                  }
                  className="h-[70vh] w-full rounded-xl border border-slate-100 bg-white"
                />
              ) : (
                <div className="flex min-h-[60vh] items-center justify-center">
                  <img
                    src={
                      viewingCalendar.file_url
                    }
                    alt={
                      viewingCalendar.file_name
                    }
                    className="max-h-[70vh] max-w-full rounded-xl border border-slate-100 bg-white object-contain shadow-sm"
                  />
                </div>
              )}
            </div>

            {/* Footer */}

            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
              <p className="text-xs text-text-muted">
                {viewingCalendar.file_type} calendar
              </p>

              <button
                onClick={closeViewModal}
                className="rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}