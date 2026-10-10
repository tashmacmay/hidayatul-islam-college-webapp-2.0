"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Search,
  Check,
  ChevronDown,
  X,
  AlertTriangle,
  Clock3,
  Megaphone,
} from "lucide-react";

import ParentSidebar from "@/components/parent/ParentSidebar";
import ResponsiveAppShell from "@/components/layout/ResponsiveAppShell";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ParentNoticesPage() {
  const router = useRouter();

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  const [filter, setFilter] = useState("All notices");
const [typeFilter, setTypeFilter] = useState("All");
const [gradeFilter, setGradeFilter] = useState("All");
const [searchTerm, setSearchTerm] = useState("");
  const [selectedNotice, setSelectedNotice] = useState(null);

  // Stored locally in the browser for now.
  const [readNotices, setReadNotices] = useState([]);

  // ============================================================
  // AUTHENTICATION
  // ============================================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // ============================================================
  // FETCH PUBLISHED NOTICES
  // ============================================================

  const fetchNotices = useCallback(async () => {
    try {
      setLoading(true);

      const currentUser = auth.currentUser;

      if (!currentUser) {
        router.push("/login");
        return;
      }

      const token = await currentUser.getIdToken();

      const params = new URLSearchParams();

      // Parents only receive published notices.
      params.append("status", "Published");

      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim());
      }

      const response = await fetch(`/api/notices?${params.toString()}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch notices");
      }

      const data = await response.json();

      setNotices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching parent notices:", error);
      setNotices([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, router]);

  useEffect(() => {
    if (!authLoading) {
      fetchNotices();
    }
  }, [authLoading, fetchNotices]);

  // ============================================================
  // READ / UNREAD
  // ============================================================

  const markAsRead = (noticeId) => {
    setReadNotices((previous) => {
      if (previous.includes(noticeId)) {
        return previous;
      }

      return [...previous, noticeId];
    });
  };

  const markAllAsRead = () => {
    setReadNotices(notices.map((notice) => notice.id));
  };

  const openNotice = (notice) => {
    markAsRead(notice.id);
    setSelectedNotice(notice);
  };

  // ============================================================
  // FILTERING
  // ============================================================

const filteredNotices = notices.filter((notice) => {
  const isRead = readNotices.includes(notice.id);

  // Read / unread filter
  if (filter === "Unread" && isRead) {
    return false;
  }

  if (filter === "Read" && !isRead) {
    return false;
  }

  // Type filter
  if (typeFilter !== "All" && notice.type !== typeFilter) {
    return false;
  }

  // Grade filter
  if (
    gradeFilter !== "All" &&
    notice.grade !== gradeFilter &&
    notice.grade !== "All Grades"
  ) {
    return false;
  }

  return true;
});

  // ============================================================
  // TYPE CONFIGURATION
  // ============================================================

  const getTypeConfig = (type) => {
    switch (type) {
      case "Emergency":
        return {
          icon: AlertTriangle,
          iconClass: "bg-red-50 text-red-700",
          pillClass: "bg-red-50 text-red-700",
        };

      case "Reminder":
        return {
          icon: Clock3,
          iconClass: "bg-blue-50 text-blue-700",
          pillClass: "bg-blue-50 text-blue-700",
        };

      case "General":
      default:
        return {
          icon: Megaphone,
          iconClass: "bg-slate-100 text-navy",
          pillClass: "bg-slate-100 text-navy",
        };
    }
  };

  // ============================================================
  // DATE FORMATTING
  // ============================================================

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // ============================================================
  // SUMMARY STATISTICS
  // ============================================================

  const totalNotices = notices.length;

  const generalCount = notices.filter(
    (notice) => notice.type === "General"
  ).length;

  const reminderCount = notices.filter(
    (notice) => notice.type === "Reminder"
  ).length;

  const emergencyCount = notices.filter(
    (notice) => notice.type === "Emergency"
  ).length;

  const unreadCount = notices.filter(
    (notice) => !readNotices.includes(notice.id)
  ).length;

  // ============================================================
  // LOADING
  // ============================================================

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-sm font-medium text-text-muted">
          Loading notices...
        </p>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <ResponsiveAppShell
      sidebar={(sidebarProps) => <ParentSidebar {...sidebarProps} />}
    >
      <main className="min-w-0 flex-1 bg-slate-100">
        <div className="min-w-0 p-5 sm:p-6 md:p-8 lg:p-10">

          {/* ====================================================
              PAGE HEADER
              ==================================================== */}
            <div className="mb-1 flex items-center gap-2">
              <Bell
                size={21}
                className="text-gold"
              />

              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Parent Portal
              </span>
              </div>
          <div className="mb-7">
            <h1 className="mt-1 text-3xl font-bold text-navy md:text-4xl">
              Notices & Announcements
            </h1>
            <p className="text-sm font-medium text-text-muted">
              Stay informed with the latest school communications
            </p>
          </div>

          {/* ====================================================
              STATISTICS
              ==================================================== */}

          <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">

            {/* TOTAL */}

            <StatCard
              label="Total Notices"
              value={totalNotices}
              icon={Bell}
              iconClass="bg-navy/10 text-navy"
            />

            {/* GENERAL */}

            <StatCard
              label="General"
              value={generalCount}
              icon={Megaphone}
              iconClass="bg-slate-100 text-navy"
            />

            {/* REMINDERS */}

            <StatCard
              label="Reminders"
              value={reminderCount}
              icon={Clock3}
              iconClass="bg-blue-50 text-blue-700"
            />

            {/* EMERGENCY */}

            <StatCard
              label="Emergency"
              value={emergencyCount}
              icon={AlertTriangle}
              iconClass="bg-red-50 text-red-700"
            />
          </div>

          {/* ====================================================
              FILTERS
              ==================================================== */}

          <div className="mb-7 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:p-5">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

              {/* SEARCH */}

              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />

                <input
                  type="text"
                  placeholder="Search notices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-navy outline-none transition placeholder:text-text-muted focus:border-gold focus:bg-white focus:ring-2 focus:ring-gold/20"
                />
              </div>

              {/* TYPE */}

              <div className="relative w-full lg:w-48">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-10 text-sm font-medium text-navy outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                >
                  <option value="All">All types</option>
                  <option value="General">General</option>
                  <option value="Reminder">Reminder</option>
                  <option value="Emergency">Emergency</option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              </div>
{/* GRADE */}

<div className="relative w-full lg:w-48">
  <select
    value={gradeFilter}
    onChange={(e) => setGradeFilter(e.target.value)}
    className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-10 text-sm font-medium text-navy outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
  >
    <option value="All">All grades</option>
    <option value="All Grades">All Grades</option>
    <option value="Grade R">Grade R</option>
    <option value="Grade 1">Grade 1</option>
    <option value="Grade 2">Grade 2</option>
    <option value="Grade 3">Grade 3</option>
    <option value="Grade 4">Grade 4</option>
    <option value="Grade 5">Grade 5</option>
    <option value="Grade 6">Grade 6</option>
    <option value="Grade 7">Grade 7</option>
  </select>

  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
</div>
              {/* READ STATUS */}

              <div className="relative w-full lg:w-48">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-10 text-sm font-medium text-navy outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                >
                  <option value="All notices">All notices</option>
                  <option value="Unread">Unread</option>
                  <option value="Read">Read</option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              </div>

            </div>

            {/* ACTIVE FILTER SUMMARY */}
<div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
  {/* RESULTS COUNT */}

  <p className="text-sm text-text-muted">
    Showing{" "}
    <span className="font-semibold text-navy">
      {filteredNotices.length}
    </span>{" "}
    {filteredNotices.length === 1 ? "notice" : "notices"}
  </p>

  {/* RIGHT SIDE */}

  <div className="flex flex-wrap items-center gap-3">
    {unreadCount > 0 && (
      <p className="text-sm font-medium text-blue-700">
        {unreadCount} unread
      </p>
    )}

    <button
      type="button"
      onClick={markAllAsRead}
      disabled={unreadCount === 0}
      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-navy shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Check className="h-4 w-4" />
      Mark all read
    </button>
  </div>
</div>
</div>

          {/* ====================================================
              NOTICE LIST
              ==================================================== */}

          <div className="min-w-0">

            {loading ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white shadow-sm">
                <Bell className="h-8 w-8 text-gold" />

                <p className="mt-3 text-sm text-text-muted">
                  Loading notices...
                </p>
              </div>
            ) : filteredNotices.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white px-6 text-center shadow-sm">
                <Bell className="h-10 w-10 text-slate-300" />

                <h3 className="mt-4 text-lg font-bold text-navy">
                  No notices found
                </h3>

                <p className="mt-1 max-w-md text-sm leading-6 text-text-muted">
                  There are currently no published notices matching your
                  search or filters.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotices.map((notice) => {
                  const config = getTypeConfig(notice.type);
                  const Icon = config.icon;

                  const isUnread = !readNotices.includes(notice.id);

                  return (
                    <button
                      key={notice.id}
                      type="button"
                      onClick={() => openNotice(notice)}
                      className={`w-full rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:p-6 ${
                        isUnread
                          ? "border-gold/40"
                          : "border-slate-100"
                      }`}
                    >
                      <div className="flex items-start gap-4">

                        {/* ICON */}

                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${config.iconClass}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        {/* CONTENT */}

                        <div className="min-w-0 flex-1">

                          <div className="mb-2 flex flex-wrap items-center gap-2">

                            <span className="break-words text-base font-bold text-navy">
                              {notice.title}
                            </span>

                            {notice.type && (
                              <span
                                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${config.pillClass}`}
                              >
                                {notice.type}
                              </span>
                            )}

                            {isUnread && (
                              <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                                Unread
                              </span>
                            )}
                          </div>

                          <p className="line-clamp-2 text-sm leading-6 text-text-muted">
                            {notice.content ||
                              "No additional information available."}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-muted">
                            <span>
                              Posted by School Administration
                            </span>

                            <span>·</span>

                            <span>
                              {formatDate(notice.created_at)}
                            </span>

                            {notice.grade && (
                              <>
                                <span>·</span>

                                <span>
                                  {notice.grade}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ========================================================
          NOTICE MODAL
          ======================================================== */}

      {selectedNotice && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-navy/40 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">

              <div className="min-w-0">

                {selectedNotice.type && (
                  <span
                    className={`mb-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      getTypeConfig(selectedNotice.type).pillClass
                    }`}
                  >
                    {selectedNotice.type}
                  </span>
                )}

                <h2 className="break-words text-2xl font-bold text-navy">
                  {selectedNotice.title}
                </h2>

                {selectedNotice.grade && (
                  <p className="mt-2 text-sm text-text-muted">
                    {selectedNotice.grade}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="shrink-0 rounded-lg p-2 text-text-muted transition hover:bg-slate-100 hover:text-navy"
                aria-label="Close notice"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* CONTENT */}

            <div className="p-6">

              <div className="mb-5 text-xs text-text-muted">
                Posted by School Administration
                {" · "}
                {formatDate(selectedNotice.created_at)}
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="whitespace-pre-wrap text-sm leading-7 text-text">
                  {selectedNotice.content ||
                    "No additional information available."}
                </p>
              </div>

              <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setSelectedNotice(null)}
                  className="rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-navy transition hover:opacity-90"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ResponsiveAppShell>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  label,
  value,
  icon: Icon,
  iconClass,
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">

        <div className="min-w-0">
          <p className="text-sm font-medium text-text-muted">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold text-navy sm:text-3xl">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}