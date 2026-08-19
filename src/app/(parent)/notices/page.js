"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  CalendarDays,
  Shirt,
  Coins,
  Trophy,
  Search,
  Check,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

import ParentSidebar from "@/components/parent/ParentSidebar";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ParentNoticesPage() {
  const router = useRouter();

  // ============================================================
  // STATE
  // ============================================================

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  const [filter, setFilter] = useState("All notices");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedNotice, setSelectedNotice] = useState(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Read status is currently stored locally in the browser.
  // This can later be moved to SQL if the team wants
  // read/unread status to persist across devices.
  const [readNotices, setReadNotices] = useState([]);

  // ============================================================
  // SIDEBAR
  // ============================================================

  const toggleSidebar = () => {
    setIsSidebarOpen((previous) => !previous);
  };

  // ============================================================
  // AUTHENTICATION
  // ============================================================
  // Parents must be logged into Firebase before notices
  // can be requested from the API.
  //
  // The API also verifies the Firebase token server-side.
  // ============================================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        if (!currentUser) {
          router.push("/login");
          return;
        }

        setAuthLoading(false);
      }
    );

    return () => unsubscribe();
  }, [router]);

  // ============================================================
  // FETCH PUBLISHED NOTICES
  // ============================================================
  //
  // DATA SOURCE:
  // SQL Server -> Notices table -> /api/notices -> this page
  //
  // Parents only request Published notices.
  //
  // ============================================================

  const fetchNotices = useCallback(async () => {
    try {
      setLoading(true);

      const currentUser = auth.currentUser;

      if (!currentUser) {
        router.push("/login");
        return;
      }

      // Get Firebase authentication token.
      const token = await currentUser.getIdToken();

      const params = new URLSearchParams();

      // Parents should only see published notices.
      params.append("status", "Published");

      // Search is passed to the API so the database can
      // perform the search.
      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim());
      }

      const response = await fetch(
        `/api/notices?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      // ========================================================
      // AUTH ERROR
      // ========================================================

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      // ========================================================
      // OTHER API ERRORS
      // ========================================================

      if (!response.ok) {
        throw new Error("Failed to fetch notices");
      }

      // ========================================================
      // DATABASE RESPONSE
      // ========================================================

      const data = await response.json();

      setNotices(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {
      console.error(
        "❌ Error fetching parent notices:",
        error
      );

      setNotices([]);

    } finally {
      setLoading(false);
    }
  }, [searchTerm, router]);

  // ============================================================
  // LOAD NOTICES
  // ============================================================

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
    setReadNotices(
      notices.map((notice) => notice.id)
    );
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

    if (filter === "Unread") {
      return !isRead;
    }

    if (filter === "Events") {
      return notice.category === "Event";
    }

    if (filter === "Reminders") {
      return notice.category === "Reminder";
    }

    if (filter === "Emergency") {
      return notice.category === "Emergency";
    }

    return true;
  });

  // ============================================================
  // CATEGORY CONFIGURATION
  // ============================================================

  const getCategoryConfig = (category) => {
    switch (category) {
      case "Event":
        return {
          icon: CalendarDays,
          iconClass:
            "bg-[rgba(201,162,39,.12)] text-[#7a5c00]",
          pillClass:
            "bg-[rgba(201,162,39,.12)] text-[#7a5c00]",
        };

      case "Reminder":
        return {
          icon: Shirt,
          iconClass: "bg-blue-50 text-blue-700",
          pillClass: "bg-blue-50 text-blue-700",
        };

      case "Finance":
        return {
          icon: Coins,
          iconClass: "bg-amber-50 text-amber-700",
          pillClass: "bg-amber-50 text-amber-700",
        };

      case "Achievement":
        return {
          icon: Trophy,
          iconClass: "bg-green-50 text-green-700",
          pillClass: "bg-green-50 text-green-700",
        };

      case "Emergency":
        return {
          icon: Bell,
          iconClass: "bg-red-50 text-red-700",
          pillClass: "bg-red-50 text-red-700",
        };

      default:
        return {
          icon: Bell,
          iconClass: "bg-slate-100 text-[#0d2260]",
          pillClass: "bg-slate-100 text-[#0d2260]",
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

    return date.toLocaleDateString(
      "en-ZA",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ============================================================
  // SUMMARY STATISTICS
  // ============================================================

  const unreadCount = notices.filter(
    (notice) =>
      !readNotices.includes(notice.id)
  ).length;

  const thisWeekCount = notices.filter(
    (notice) => {
      if (!notice.created_at) {
        return false;
      }

      const created = new Date(
        notice.created_at
      );

      const now = new Date();

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(
        now.getDate() - 7
      );

      return (
        created >= sevenDaysAgo &&
        created <= now
      );
    }
  ).length;

  const categoryCount = (category) =>
    notices.filter(
      (notice) =>
        notice.category === category
    ).length;

  // ============================================================
  // LOADING SCREEN
  // ============================================================

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f0f2f7]">
        <p className="text-sm text-[#5a6a82]">
          Loading notices...
        </p>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-[#f0f2f7] text-[#1a2540]">

      {/* ========================================================
          SIDEBAR
          ======================================================== */}

      <ParentSidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
      />

      {/* ========================================================
          MAIN CONTENT
          ======================================================== */}

      <main
        className={`min-h-screen transition-all duration-300 ${
          isSidebarOpen
            ? "md:ml-[240px]"
            : "ml-0"
        }`}
      >

        {/* ======================================================
            TOP BAR
            ====================================================== */}

        <div className="sticky top-0 z-40 flex h-[58px] items-center justify-between border-b border-[#0d2260]/10 bg-white px-6 shadow-sm md:px-8">

          <div className="font-serif text-[17px] font-bold text-[#0d2260]">
            Parent Portal
          </div>

          <div className="flex items-center gap-3">

            <div className="hidden h-[34px] w-[34px] items-center justify-center rounded-[9px] border border-[#0d2260]/10 bg-[#f7f8fc] text-[#5a6a82] sm:flex">
              <Search size={17} />
            </div>

            <div className="relative flex h-[34px] w-[34px] items-center justify-center rounded-[9px] border border-[#0d2260]/10 bg-[#f7f8fc] text-[#5a6a82]">
              <Bell size={17} />

              {unreadCount > 0 && (
                <span className="absolute right-[6px] top-[6px] h-[7px] w-[7px] rounded-full border-2 border-white bg-[#c9a227]" />
              )}
            </div>

            <div className="hidden items-center gap-2 sm:flex">

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0d2260] text-[11px] font-bold text-[#c9a227]">
                AA
              </div>

              <span className="text-[13px] font-semibold text-[#0d2260]">
                Parent
              </span>

              <ChevronDown
                size={14}
                className="text-[#5a6a82]"
              />

            </div>

          </div>

        </div>

        {/* ======================================================
            BODY
            ====================================================== */}

        <div className="w-full px-5 py-6 md:px-8 md:py-8 xl:px-10">

          {/* Mobile menu */}

          {!isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="mb-4 text-[#0d2260] md:hidden"
            >
              <Menu size={28} />
            </button>
          )}

          {/* ====================================================
              HEADER
              ==================================================== */}

          <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="text-sm text-[#5a6a82]">
                Stay informed with the latest school communications.
              </p>

              <h1 className="mt-1 font-serif text-3xl font-bold text-[#0d2260] md:text-4xl">
                Notices & Announcements
              </h1>

            </div>

            <div className="flex flex-wrap gap-2">

              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 rounded-lg bg-[#0d2260]/5 px-3 py-2 text-xs font-semibold text-[#0d2260] transition hover:bg-[#0d2260]/10"
              >
                <Check size={14} />
                Mark all read
              </button>

              <select
                value={filter}
                onChange={(e) =>
                  setFilter(e.target.value)
                }
                className="rounded-lg border border-[#0d2260]/10 bg-white px-3 py-2 text-sm text-[#1a2540] outline-none focus:border-[#c9a227]"
              >
                <option>All notices</option>
                <option>Unread</option>
                <option>Events</option>
                <option>Reminders</option>
                <option>Emergency</option>
              </select>

            </div>

          </div>

          {/* ====================================================
              SEARCH
              ==================================================== */}

          <div className="mb-6">

            <div className="flex items-center gap-2 rounded-lg border border-[#0d2260]/10 bg-white px-4 py-3 shadow-sm">

              <Search
                size={17}
                className="text-[#5a6a82]"
              />

              <input
                type="text"
                placeholder="Search notices..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                className="w-full bg-transparent text-sm text-[#0d2260] outline-none"
              />

            </div>

          </div>

          {/* ====================================================
              MAIN GRID
              ==================================================== */}

          <div className="grid w-full gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">

            {/* ==================================================
                NOTICE LIST
                ================================================== */}

            <div className="min-w-0 space-y-3">

              {loading ? (

                <div className="rounded-xl bg-white p-10 text-center shadow-sm">
                  <p className="text-sm text-[#5a6a82]">
                    Loading notices...
                  </p>
                </div>

              ) : filteredNotices.length === 0 ? (

                <div className="rounded-xl bg-white p-10 text-center shadow-sm">

                  <Bell
                    size={38}
                    className="mx-auto mb-3 text-[#c9a227]"
                  />

                  <h3 className="font-serif text-lg font-bold text-[#0d2260]">
                    No notices found
                  </h3>

                  <p className="mt-1 text-sm text-[#5a6a82]">
                    There are currently no published notices matching your search or filter.
                  </p>

                </div>

              ) : (

                filteredNotices.map((notice) => {

                  const config =
                    getCategoryConfig(
                      notice.category
                    );

                  const Icon =
                    config.icon;

                  const isUnread =
                    !readNotices.includes(
                      notice.id
                    );

                  return (

                    <button
                      key={notice.id}
                      type="button"
                      onClick={() =>
                        openNotice(notice)
                      }
                      className={`w-full rounded-xl border border-[#0d2260]/[0.07] bg-white p-5 text-left shadow-sm transition hover:-translate-y-[1px] hover:shadow-md md:p-6 ${
                        isUnread
                          ? "border-l-4 border-l-[#c9a227]"
                          : ""
                      }`}
                    >

                      <div className="flex items-start gap-4">

                        {/* ICON */}

                        <div
                          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px] ${config.iconClass}`}
                        >
                          <Icon size={20} />
                        </div>

                        {/* CONTENT */}

                        <div className="min-w-0 flex-1">

                          <div className="mb-2 flex flex-wrap items-center gap-2">

                            <span className="text-base font-bold text-[#0d2260]">
                              {notice.title}
                            </span>

                            {notice.category && (
                              <span
                                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${config.pillClass}`}
                              >
                                {notice.category}
                              </span>
                            )}

                            {isUnread && (
                              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                                Unread
                              </span>
                            )}

                          </div>

                          <p className="line-clamp-2 text-sm leading-6 text-[#5a6a82]">
                            {notice.content ||
                              "No additional information available."}
                          </p>

                          <p className="mt-3 text-xs text-[#5a6a82]">
                            Posted by School Administration
                            {" · "}
                            {formatDate(
                              notice.created_at
                            )}
                          </p>

                        </div>

                      </div>

                    </button>

                  );
                })

              )}

            </div>

            {/* ==================================================
                RIGHT SUMMARY
                ================================================== */}

            <aside className="space-y-5">

              {/* SUMMARY */}

              <div className="rounded-xl bg-white p-6 shadow-sm">

                <h2 className="mb-4 font-serif text-lg font-bold text-[#0d2260]">
                  Summary
                </h2>

                <div className="space-y-1">

                  <div className="flex justify-between border-b border-[#0d2260]/5 py-3 text-sm">
                    <span className="text-[#5a6a82]">
                      Total notices
                    </span>

                    <span className="font-bold text-[#0d2260]">
                      {notices.length}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-[#0d2260]/5 py-3 text-sm">

                    <span className="text-[#5a6a82]">
                      Unread
                    </span>

                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                      {unreadCount}
                    </span>

                  </div>

                  <div className="flex justify-between py-3 text-sm">

                    <span className="text-[#5a6a82]">
                      This week
                    </span>

                    <span className="font-bold text-[#0d2260]">
                      {thisWeekCount}
                    </span>

                  </div>

                </div>

              </div>

              {/* CATEGORIES */}

              <div className="rounded-xl bg-white p-6 shadow-sm">

                <h2 className="mb-4 font-serif text-lg font-bold text-[#0d2260]">
                  Categories
                </h2>

                <div className="space-y-1.5">

                  <CategoryRow
                    name="Events"
                    count={categoryCount("Event")}
                    className="bg-[rgba(201,162,39,.12)] text-[#7a5c00]"
                  />

                  <CategoryRow
                    name="Reminders"
                    count={categoryCount("Reminder")}
                    className="bg-blue-50 text-blue-700"
                  />

                  <CategoryRow
                    name="Finance"
                    count={categoryCount("Finance")}
                    className="bg-amber-50 text-amber-700"
                  />

                  <CategoryRow
                    name="Achievements"
                    count={categoryCount("Achievement")}
                    className="bg-green-50 text-green-700"
                  />

                  <CategoryRow
                    name="Emergency"
                    count={categoryCount("Emergency")}
                    className="bg-red-50 text-red-700"
                  />

                  <CategoryRow
                    name="General"
                    count={categoryCount("General")}
                    className="bg-slate-100 text-[#0d2260]"
                  />

                </div>

              </div>

            </aside>

          </div>

        </div>

      </main>

      {/* ========================================================
          NOTICE MODAL
          ======================================================== */}

      {selectedNotice && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-7 shadow-xl">

            <div className="mb-5 flex items-start justify-between gap-4">

              <div>

                {selectedNotice.category && (
                  <span className="mb-2 inline-block rounded-full bg-[#0d2260]/10 px-3 py-1 text-xs font-bold text-[#0d2260]">
                    {selectedNotice.category}
                  </span>
                )}

                <h2 className="font-serif text-2xl font-bold text-[#0d2260]">
                  {selectedNotice.title}
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedNotice(null)
                }
                className="rounded-lg p-2 transition hover:bg-slate-100"
              >
                <X size={20} />
              </button>

            </div>

            <div className="mb-5 text-xs text-[#5a6a82]">
              Posted by School Administration
              {" · "}
              {formatDate(
                selectedNotice.created_at
              )}
            </div>

            <div className="rounded-xl bg-[#f7f8fc] p-5">

              <p className="whitespace-pre-wrap text-sm leading-7 text-[#1a2540]">
                {selectedNotice.content ||
                  "No additional information available."}
              </p>

            </div>

            <div className="mt-6 flex justify-end">

              <button
                type="button"
                onClick={() =>
                  setSelectedNotice(null)
                }
                className="rounded-lg bg-[#0d2260] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a3070]"
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

// ============================================================
// CATEGORY ROW
// ============================================================

function CategoryRow({
  name,
  count,
  className,
}) {
  return (
    <div className="flex items-center justify-between rounded-lg px-2.5 py-2 text-sm">

      <span className="text-[#5a6a82]">
        {name}
      </span>

      <span
        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${className}`}
      >
        {count}
      </span>

    </div>
  );
}