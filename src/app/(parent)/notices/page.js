"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  CalendarDays,
  Shirt,
  Coins,
  Trophy,
  Calendar,
  Search,
  Check,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

import ParentSidebar from "@/components/parent/ParentSidebar";
//import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function ParentNoticesPage() {
  const router = useRouter();

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All notices");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [readNotices, setReadNotices] = useState([]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // FETCH PUBLISHED NOTICES

  const fetchNotices = useCallback(async () => {
    try {
      setLoading(true);

      const user = auth.currentUser;

      if (!user) {
        router.push("/login");
        return;
      }

      const token = await user.getIdToken();

      const params = new URLSearchParams();

      // Parents should only receive published notices
      params.append("status", "Published");

      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim());
      }

      const res = await fetch(`/api/notices?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to fetch notices");
      }

      const data = await res.json();

      setNotices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Error fetching parent notices:", error);
      setNotices([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, router]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  // ---------------------------------------------------------
  // READ / UNREAD
  // ---------------------------------------------------------

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

  // ---------------------------------------------------------
  // FILTERING
  // ---------------------------------------------------------

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

  // ---------------------------------------------------------
  // CATEGORY HELPERS
  // ---------------------------------------------------------

  const getCategoryConfig = (category) => {
    switch (category) {
      case "Event":
        return {
          icon: CalendarDays,
          iconClass: "bg-[rgba(201,162,39,.12)] text-[#7a5c00]",
          pillClass: "bg-[rgba(201,162,39,.12)] text-[#7a5c00]",
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
          icon: Calendar,
          iconClass: "bg-slate-100 text-navy",
          pillClass: "bg-slate-100 text-navy",
        };
    }
  };

  // ---------------------------------------------------------
  // DATE FORMATTING
  // ---------------------------------------------------------

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const unreadCount = notices.filter(
    (notice) => !readNotices.includes(notice.id)
  ).length;

  const thisWeekCount = notices.filter((notice) => {
    if (!notice.created_at) return false;

    const created = new Date(notice.created_at);
    const now = new Date();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    return created >= sevenDaysAgo && created <= now;
  }).length;

  const categoryCount = (category) =>
    notices.filter((notice) => notice.category === category).length;

  return (
    <div className="min-h-screen bg-[#f0f2f7] text-[#1a2540]">
      <ParentSidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
      />

      <main
        className={`min-h-screen transition-all duration-300 ${
          isSidebarOpen ? "md:ml-60" : "ml-0"
        }`}
      >
        {/* ------------------------------------------------ */}
        {/* TOP BAR */}
        {/* ------------------------------------------------ */}

        <div className="sticky top-0 z-40 flex h-[58px] items-center justify-between border-b border-[#0d2260]/10 bg-white px-7 shadow-sm">
          <div className="font-serif text-[17px] font-bold text-[#0d2260]">
            Notices & Announcements
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
                Aisha Adams
              </span>

              <ChevronDown size={14} className="text-[#5a6a82]" />
            </div>
          </div>
        </div>

        {/* ------------------------------------------------ */}
        {/* PAGE BODY */}
        {/* ------------------------------------------------ */}

        <div className="p-6 md:p-7">

          {/* Mobile sidebar button */}

          {!isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="mb-4 text-[#0d2260] md:hidden"
            >
              <Menu size={28} />
            </button>
          )}

          {/* ------------------------------------------------ */}
          {/* PAGE HEADER */}
          {/* ------------------------------------------------ */}

          <div className="mb-[22px] flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-serif text-[20px] font-bold text-[#0d2260]">
                Notices & Announcements
              </h1>

              <p className="mt-[3px] text-[13px] text-[#5a6a82]">
                Stay informed with the latest school communications.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 rounded-[7px] bg-[#0d2260]/5 px-3 py-1.5 text-xs font-semibold text-[#0d2260] transition hover:bg-[#0d2260]/10"
              >
                <Check size={14} />
                Mark all read
              </button>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-[8px] border border-[#0d2260]/10 bg-[#f7f8fc] px-3 py-1.5 text-[13px] text-[#1a2540] outline-none focus:border-[#c9a227]"
              >
                <option>All notices</option>
                <option>Unread</option>
                <option>Events</option>
                <option>Reminders</option>
                <option>Emergency</option>
              </select>
            </div>
          </div>

          {/* ------------------------------------------------ */}
          {/* SEARCH */}
          {/* ------------------------------------------------ */}

          <div className="mb-5">
            <div className="flex items-center gap-2 rounded-[9px] border border-[#0d2260]/10 bg-[#f7f8fc] px-3 py-2">
              <Search size={16} className="text-[#5a6a82]" />

              <input
                type="text"
                placeholder="Search notices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-[13px] text-[#0d2260] outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-5 xl:flex-row">

            {/* ------------------------------------------------ */}
            {/* NOTICE LIST */}
            {/* ------------------------------------------------ */}

            <div className="flex flex-1 flex-col gap-3">

              {loading ? (
                <div className="rounded-[14px] border border-[#0d2260]/5 bg-white p-8 text-center">
                  <p className="text-[13px] text-[#5a6a82]">
                    Loading notices...
                  </p>
                </div>
              ) : filteredNotices.length === 0 ? (
                <div className="rounded-[14px] border border-[#0d2260]/5 bg-white p-8 text-center">
                  <Bell
                    size={35}
                    className="mx-auto mb-3 text-[#c9a227]"
                  />

                  <h3 className="font-serif text-[16px] font-bold text-[#0d2260]">
                    No notices found
                  </h3>

                  <p className="mt-1 text-[13px] text-[#5a6a82]">
                    There are currently no notices matching your filter.
                  </p>
                </div>
              ) : (
                filteredNotices.map((notice) => {
                  const config = getCategoryConfig(notice.category);
                  const Icon = config.icon;
                  const isUnread = !readNotices.includes(notice.id);

                  return (
                    <div
                      key={notice.id}
                      onClick={() => openNotice(notice)}
                      className={`cursor-pointer rounded-[14px] border border-[#0d2260]/[0.07] bg-white p-[22px] transition hover:-translate-y-[1px] hover:shadow-md ${
                        isUnread
                          ? "border-l-4 border-l-[#c9a227]"
                          : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">

                        {/* ICON */}

                        <div
                          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] ${config.iconClass}`}
                        >
                          <Icon size={19} />
                        </div>

                        {/* CONTENT */}

                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex flex-wrap items-center gap-2">

                            <span className="text-[15px] font-bold text-[#0d2260]">
                              {notice.title}
                            </span>

                            <span
                              className={`rounded-full px-2.5 py-[3px] text-[11px] font-bold ${config.pillClass}`}
                            >
                              {notice.category}
                            </span>

                            {isUnread && (
                              <span className="rounded-full bg-blue-50 px-2.5 py-[3px] text-[11px] font-bold text-blue-700">
                                Unread
                              </span>
                            )}
                          </div>

                          <p className="text-[13px] leading-[1.6] text-[#5a6a82]">
                            {notice.content ||
                              "No additional information available."}
                          </p>

                          <div className="mt-2 text-[11px] text-[#5a6a82]">
                            Posted by School Administration{" "}
                            &nbsp;·&nbsp;{" "}
                            {formatDate(notice.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ------------------------------------------------ */}
            {/* RIGHT SIDEBAR */}
            {/* ------------------------------------------------ */}

            <div className="w-full flex-shrink-0 xl:w-[260px]">

              {/* SUMMARY */}

              <div className="mb-[22px] rounded-[14px] border border-[#0d2260]/[0.07] bg-white p-[22px]">
                <div className="mb-3 font-serif text-[15px] font-bold text-[#0d2260]">
                  Summary
                </div>

                <div className="flex flex-col gap-2.5">

                  <div className="flex justify-between border-b border-[#0d2260]/5 py-2 text-[13px]">
                    <span className="text-[#5a6a82]">
                      Total notices
                    </span>

                    <span className="font-bold text-[#0d2260]">
                      {notices.length}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-[#0d2260]/5 py-2 text-[13px]">
                    <span className="text-[#5a6a82]">
                      Unread
                    </span>

                    <span className="rounded-full bg-blue-50 px-2.5 py-[3px] text-[11px] font-bold text-blue-700">
                      {unreadCount}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 text-[13px]">
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

              <div className="rounded-[14px] border border-[#0d2260]/[0.07] bg-white p-[22px]">
                <div className="mb-3 font-serif text-[15px] font-bold text-[#0d2260]">
                  Categories
                </div>

                <div className="flex flex-col gap-1.5">

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
                    name="General"
                    count={categoryCount("General")}
                    className="bg-slate-100 text-[#0d2260]"
                  />

                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

   
      {/* NOTICE MODAL */}

      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-7">

            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#0d2260]/10 px-3 py-1 text-xs font-bold text-[#0d2260]">
                    {selectedNotice.category}
                  </span>
                </div>

                <h2 className="font-serif text-2xl font-bold text-[#0d2260]">
                  {selectedNotice.title}
                </h2>
              </div>

              <button
                onClick={() => setSelectedNotice(null)}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-5 text-xs text-[#5a6a82]">
              Posted by School Administration{" "}
              &nbsp;·&nbsp;{" "}
              {formatDate(selectedNotice.created_at)}
            </div>

            <div className="rounded-xl bg-[#f7f8fc] p-5">
              <p className="whitespace-pre-wrap text-sm leading-7 text-[#1a2540]">
                {selectedNotice.content ||
                  "No additional information available."}
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedNotice(null)}
                className="rounded-lg bg-[#0d2260] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1a3070]"
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

// ---------------------------------------------------------
// CATEGORY ROW
// ---------------------------------------------------------

function CategoryRow({ name, count, className }) {
  return (
    <div className="flex items-center justify-between rounded-lg px-2.5 py-[7px] text-[13px]">
      <span>{name}</span>

      <span
        className={`rounded-full px-2.5 py-[3px] text-[11px] font-bold ${className}`}
      >
        {count}
      </span>
    </div>
  );
}