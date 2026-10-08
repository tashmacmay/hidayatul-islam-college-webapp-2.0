"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Send,
  Clock3,
  FileText,
  Plus,
  Search,
  Pencil,
  Trash2,
  ShieldCheck,
  X,
  Menu,
  CheckCircle,
  Calendar,
  Save,
  Filter,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import StaffSidebar from "@/components/staff/StaffSidebar";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function NoticeManagementPage() {
  // =========================================================
  // State
  // =========================================================

  const [notices, setNotices] = useState([]);
  const [totalNotices, setTotalNotices] = useState(0);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  // Notice form
  const [formData, setFormData] = useState({
    title: "",
    type: "General",
    content: "",
    grade: "All Grades",
    scheduled_for: "",
  });

  // Current action
  const [selectedAction, setSelectedAction] = useState("publish");

  // Filters
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [filterGrade, setFilterGrade] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // =========================================================
  // Sidebar
  // =========================================================

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // =========================================================
  // Toast
  // =========================================================

  const showToast = (message, type = "success") => {
    setSuccessMessage(message);
    setToastType(type);

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  // =========================================================
  // Fetch Notices
  // =========================================================

  const fetchNotices = useCallback(async () => {
    try {
      setLoading(true);

      if (!auth.currentUser) {
        setLoading(false);
        return;
      }

      const token = await auth.currentUser.getIdToken();

      const params = new URLSearchParams();

      if (filterStatus !== "All") {
        params.append("status", filterStatus);
      }

      if (filterType !== "All") {
        params.append("type", filterType);
      }

      if (filterGrade !== "All") {
        params.append("grade", filterGrade);
      }

      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim());
      }

      const queryString = params.toString();

      const url = queryString
        ? `/api/staff/admin/notices?${queryString}`
        : "/api/staff/admin/notices";

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to fetch notices"
        );
      }

      setNotices(data.notices || []);
      setTotalNotices(data.total || 0);
    } catch (error) {
      console.error("Error fetching notices:", error);

      setNotices([]);
      setTotalNotices(0);
    } finally {
      setLoading(false);
    }
  }, [
    filterStatus,
    filterType,
    filterGrade,
    searchTerm,
  ]);

  // =========================================================
  // Firebase Auth
  // =========================================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchNotices();
      } else {
        setNotices([]);
        setTotalNotices(0);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchNotices]);

  // =========================================================
  // Form Change
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // Open New Notice
  // =========================================================

  const openNewModal = () => {
    setEditingNotice(null);

    setFormData({
      title: "",
      type: "General",
      content: "",
      grade: "All Grades",
      scheduled_for: "",
    });

    setSelectedAction("publish");
    setShowModal(true);
  };

  // =========================================================
  // Open Edit Notice
  // =========================================================

  const openEditModal = (notice) => {
    setEditingNotice(notice);

    setFormData({
      title: notice.title || "",
      type: notice.type || "General",
      content: notice.content || "",
      grade: notice.grade || "All Grades",
      scheduled_for: notice.scheduled_for
        ? new Date(notice.scheduled_for)
            .toISOString()
            .slice(0, 16)
        : "",
    });

    if (notice.status === "Published") {
      setSelectedAction("publish");
    } else if (notice.status === "Scheduled") {
      setSelectedAction("schedule");
    } else {
      setSelectedAction("draft");
    }

    setShowModal(true);
  };

  // =========================================================
  // Submit Notice
  // =========================================================

  const handleSubmit = async (e, action) => {
    e.preventDefault();

    try {
      if (!auth.currentUser) {
        throw new Error("You must be logged in.");
      }

      // Determine status from button clicked
      let status = "Draft";

      if (action === "publish") {
        status = "Published";
      } else if (action === "schedule") {
        status = "Scheduled";

        if (!formData.scheduled_for) {
          showToast(
            "Please select a date and time to schedule the notice.",
            "error"
          );
          return;
        }
      }

      const token = await auth.currentUser.getIdToken();

      // IMPORTANT:
      // Only fields that exist in the new Notices table
      // are sent to the API.
      const payload = {
        title: formData.title.trim(),
        type: formData.type,
        content: formData.content.trim(),
        grade: formData.grade,
        status,
        scheduled_for:
          status === "Scheduled"
            ? formData.scheduled_for
            : null,
      };

      console.log("Submitting notice:", payload);

      const url = editingNotice
        ? `/api/staff/admin/notices/${editingNotice.id}`
        : "/api/staff/admin/notices";

      const method = editingNotice ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to save notice"
        );
      }

      // Close modal
      setShowModal(false);
      setEditingNotice(null);

      // Reset form.
      // DO NOT add category or recipients here.
      setFormData({
        title: "",
        type: "General",
        content: "",
        grade: "All Grades",
        scheduled_for: "",
      });

      // Success message
      if (editingNotice) {
        showToast("Notice updated successfully.");
      } else if (action === "publish") {
        showToast("Notice published successfully.");
      } else if (action === "schedule") {
        showToast("Notice scheduled successfully.");
      } else {
        showToast("Notice saved as draft.");
      }

      // Refresh table
      await fetchNotices();
    } catch (error) {
      console.error("Error saving notice:", error);

      showToast(
        error.message || "Failed to save notice.",
        "error"
      );
    }
  };

  // =========================================================
  // Delete Notice
  // =========================================================

  const handleDelete = async (id) => {
    if (
      !confirm(
        "Are you sure you want to delete this notice?"
      )
    ) {
      return;
    }

    try {
      if (!auth.currentUser) {
        throw new Error("You must be logged in.");
      }

      const token = await auth.currentUser.getIdToken();

      const res = await fetch(
        `/api/staff/admin/notices/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to delete notice"
        );
      }

      showToast("Notice deleted successfully.");

      await fetchNotices();
    } catch (error) {
      console.error("Error deleting notice:", error);

      showToast(
        error.message || "Failed to delete notice.",
        "error"
      );
    }
  };

  // =========================================================
  // Status Styles
  // =========================================================

  const statusStyles = {
    Published: "bg-green-100 text-green-700",
    Scheduled: "bg-amber-100 text-amber-700",
    Draft: "bg-slate-100 text-slate-600",
  };

  const modalTitle = editingNotice
    ? "Edit Notice"
    : "Compose Notice";

  // =========================================================
  // Page
  // =========================================================

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* =====================================================
          Sidebar
      ====================================================== */}

      <StaffSidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
      />

      {/* =====================================================
          Main Content
      ====================================================== */}

<main
  className={`flex-1 p-6 transition-all duration-300 md:p-8 lg:p-10 ${
    isSidebarOpen ? "md:ml-64" : "ml-0"
  }`}
>        {/* Mobile sidebar button */}
        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="mb-4 rounded-lg p-2 text-navy transition hover:bg-white md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
        )}

        {/* ===================================================
            Header
        ==================================================== */}

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>

            <div className="mb-1 flex items-center gap-2">
              <Bell
                size={21}
                className="text-gold"
              />

              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Administration
              </span>
            </div>

            <h1 className="mt-1 text-3xl font-bold text-navy md:text-4xl">
              Notices Management
            </h1>
            <p className="text-sm font-medium text-text-muted">
              Create, schedule and manage school notices
            </p>

          </div>

          <button
            onClick={openNewModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 font-semibold text-navy shadow-sm transition hover:opacity-90"
          >
            <Plus className="h-5 w-5" />
            Compose Notice
          </button>
        </div>

        {/* ===================================================
            Toast
        ==================================================== */}

        {successMessage && (
          <div
            className={`mb-6 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
              toastType === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            <CheckCircle className="h-5 w-5 shrink-0" />

            <span>{successMessage}</span>

            <button
              onClick={() => setSuccessMessage("")}
              className="ml-auto rounded-lg p-1 transition hover:bg-white/60"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ===================================================
            Statistics
        ==================================================== */}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Published */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-text-muted">
                  Published
                </p>

                <h2 className="mt-1 text-3xl font-bold text-navy">
                  {
                    notices.filter(
                      (notice) =>
                        notice.status === "Published"
                    ).length
                  }
                </h2>

                <p className="mt-1 text-xs text-text-muted">
                  Published notices
                </p>
              </div>

              <Send className="h-7 w-7 text-navy" />
            </div>
          </div>

          {/* Scheduled */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-text-muted">
                  Scheduled
                </p>

                <h2 className="mt-1 text-3xl font-bold text-navy">
                  {
                    notices.filter(
                      (notice) =>
                        notice.status === "Scheduled"
                    ).length
                  }
                </h2>

                <p className="mt-1 text-xs text-text-muted">
                  Pending publication
                </p>
              </div>

              <Clock3 className="h-7 w-7 text-amber-600" />
            </div>
          </div>

          {/* Drafts */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-text-muted">
                  Drafts
                </p>

                <h2 className="mt-1 text-3xl font-bold text-navy">
                  {
                    notices.filter(
                      (notice) =>
                        notice.status === "Draft"
                    ).length
                  }
                </h2>

                <p className="mt-1 text-xs text-text-muted">
                  Not published
                </p>
              </div>

              <FileText className="h-7 w-7 text-gold" />
            </div>
          </div>

          {/* Total */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-text-muted">
                  Total Notices
                </p>

                <h2 className="mt-1 text-3xl font-bold text-navy">
                  {totalNotices}
                </h2>

                <p className="mt-1 text-xs text-text-muted">
                  All notices
                </p>
              </div>

              <Bell className="h-7 w-7 text-green-600" />
            </div>
          </div>
        </div>

        {/* ===================================================
            Filters
        ==================================================== */}

        <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Filter className="h-5 w-5 text-navy" />

            <h2 className="font-semibold text-navy">
              Filter Notices
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />

              <input
                type="text"
                placeholder="Search notices..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>

            {/* Type */}
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) =>
                  setFilterType(e.target.value)
                }
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              >
                <option value="All">All Types</option>
                <option value="General">General</option>
                <option value="Reminder">Reminder</option>
                <option value="Emergency">Emergency</option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            </div>

            {/* Grade */}
            <div className="relative">
              <select
                value={filterGrade}
                onChange={(e) =>
                  setFilterGrade(e.target.value)
                }
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              >
                <option value="All">All Grades</option>
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

            {/* Status */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value)
                }
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              >
                <option value="All">All Status</option>
                <option value="Published">Published</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Draft">Draft</option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            </div>
          </div>

          {/* Clear filters */}
          {(searchTerm ||
            filterType !== "All" ||
            filterGrade !== "All" ||
            filterStatus !== "All") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterType("All");
                setFilterGrade("All");
                setFilterStatus("All");
              }}
              className="mt-4 text-sm font-medium text-gold hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* ===================================================
            Notices Table
        ==================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          {/* Table Header */}
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-navy" />

                <h2 className="font-semibold text-navy">
                  School Notices
                </h2>
              </div>

              <p className="mt-1 text-sm text-text-muted">
                Showing {notices.length} of {totalNotices}{" "}
                notices
              </p>
            </div>

            <button
              onClick={fetchNotices}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-text transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex min-h-[250px] flex-col items-center justify-center">
              <RefreshCw className="h-7 w-7 animate-spin text-gold" />

              <p className="mt-3 text-sm text-text-muted">
                Loading notices...
              </p>
            </div>
          ) : notices.length === 0 ? (
            /* Empty State */
            <div className="flex min-h-[250px] flex-col items-center justify-center px-6 text-center">
              <Bell className="h-10 w-10 text-slate-300" />

              <h3 className="mt-4 font-semibold text-navy">
                No notices found
              </h3>

              <p className="mt-1 max-w-md text-sm text-text-muted">
                {totalNotices === 0
                  ? "No notices have been created yet."
                  : "Try changing your search or filters."}
              </p>

              {totalNotices === 0 && (
                <button
                  onClick={openNewModal}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-navy transition hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  Compose First Notice
                </button>
              )}
            </div>
          ) : (
            /* Table */
            <div className="w-full">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="w-[32%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Notice
                    </th>

                    <th className="w-[14%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Grade
                    </th>

                    <th className="w-[14%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Type
                    </th>

                    <th className="w-[14%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Date
                    </th>

                    <th className="w-[12%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Status
                    </th>

                    <th className="w-[14%] px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {notices.map((notice) => (
                    <tr
                      key={notice.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                    >
                      {/* Notice */}
                      <td className="max-w-0 px-4 py-4">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-navy">
                            {notice.title}
                          </p>

                          <p className="mt-1 truncate text-sm text-text-muted">
                            {notice.content}
                          </p>
                        </div>
                      </td>

                      {/* Grade */}
                      <td className="px-4 py-4 text-sm text-text">
                        {notice.grade || "All Grades"}
                      </td>

                      {/* Type */}
                      <td className="px-4 py-4 text-sm text-text">
                        {notice.type || "General"}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4 text-sm text-text">
                        {notice.created_at
                          ? new Date(
                              notice.created_at
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            statusStyles[notice.status] ||
                            "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {notice.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              openEditModal(notice)
                            }
                            title="Edit notice"
                            className="rounded-lg p-2 text-text-muted transition hover:bg-slate-100 hover:text-navy"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(notice.id)
                            }
                            title="Delete notice"
                            className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* =====================================================
          Create / Edit Modal
      ====================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-navy">
                  {modalTitle}
                </h2>

                <p className="mt-1 text-sm text-text-muted">
                  {editingNotice
                    ? "Update the notice details."
                    : "Create a notice for parents and staff."}
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-text-muted transition hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={(e) => e.preventDefault()}
              className="p-6"
            >
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-navy">
                    Title *
                  </label>

                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Sports Day - 30 May 2026"
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                  />
                </div>

                {/* Type + Grade */}
                <div className="grid gap-5 md:grid-cols-2">
                  {/* Type */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-navy">
                      Type *
                    </label>

                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                    >
                      <option value="General">
                        General
                      </option>

                      <option value="Reminder">
                        Reminder
                      </option>

                      <option value="Emergency">
                        Emergency
                      </option>
                    </select>
                  </div>

                  {/* Grade */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-navy">
                      Grade *
                    </label>

                    <select
                      name="grade"
                      value={formData.grade}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                    >
                      <option value="All Grades">
                        All Grades
                      </option>

                      <option value="Grade R">
                        Grade R
                      </option>

                      <option value="Grade 1">
                        Grade 1
                      </option>

                      <option value="Grade 2">
                        Grade 2
                      </option>

                      <option value="Grade 3">
                        Grade 3
                      </option>

                      <option value="Grade 4">
                        Grade 4
                      </option>

                      <option value="Grade 5">
                        Grade 5
                      </option>

                      <option value="Grade 6">
                        Grade 6
                      </option>

                      <option value="Grade 7">
                        Grade 7
                      </option>
                    </select>
                  </div>
                </div>

                {/* Audience */}
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <div className="flex gap-3">
                    <Bell className="mt-0.5 h-5 w-5 shrink-0 text-navy" />

                    <div>
                      <p className="text-sm font-semibold text-navy">
                        Notice Audience
                      </p>

                      <p className="mt-1 text-sm leading-6 text-gray-600">
                        All published notices are available
                        to both parents and staff. The
                        selected grade determines which
                        learners the notice applies to.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-navy">
                    Message *
                  </label>

                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows={6}
                    required
                    placeholder="Enter the notice message..."
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                  />
                </div>

                {/* Schedule */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-navy">
                    Schedule For
                    {selectedAction === "schedule" && (
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    )}
                  </label>

                  <input
                    type="datetime-local"
                    name="scheduled_for"
                    value={formData.scheduled_for}
                    onChange={handleChange}
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20 ${
                      selectedAction === "schedule"
                        ? "border-gold"
                        : "border-slate-200"
                    }`}
                  />

                  {selectedAction === "schedule" && (
                    <p className="mt-2 text-xs text-text-muted">
                      A date and time are required when
                      scheduling a notice.
                    </p>
                  )}
                </div>

                {/* POPIA */}
                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                  <div className="flex gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold" />

                    <div>
                      <p className="text-sm font-semibold text-navy">
                        POPIA Reminder
                      </p>

                      <p className="mt-1 text-sm leading-6 text-gray-600">
                        Do not include learner names or
                        sensitive personal information in
                        notices.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* =================================================
                  Action Buttons
              ================================================== */}

              <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
                {/* Cancel */}
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-text transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                {/* Save Draft */}
                <button
                  type="button"
                  onClick={(e) => {
                    setSelectedAction("draft");
                    handleSubmit(e, "draft");
                  }}
                  className={`inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition ${
                    selectedAction === "draft"
                      ? "border-gold bg-gold/10 text-navy"
                      : "border-slate-200 text-text hover:bg-slate-50"
                  }`}
                >
                  <Save className="h-4 w-4" />
                  Save Draft
                </button>

                {/* Schedule */}
                <button
                  type="button"
                  onClick={(e) => {
                    setSelectedAction("schedule");

                    if (!formData.scheduled_for) {
                      setTimeout(() => {
                        const dateInput =
                          document.querySelector(
                            'input[name="scheduled_for"]'
                          );

                        if (dateInput) {
                          dateInput.focus();
                        }
                      }, 100);
                    }

                    handleSubmit(e, "schedule");
                  }}
                  className={`inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition ${
                    selectedAction === "schedule"
                      ? "border-gold bg-gold/10 text-navy"
                      : "border-slate-200 text-text hover:bg-slate-50"
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  Schedule
                </button>

                {/* Publish */}
                <button
                  type="button"
                  onClick={(e) => {
                    setSelectedAction("publish");
                    handleSubmit(e, "publish");
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-navy transition hover:opacity-90"
                >
                  <Send className="h-4 w-4" />
                  Publish Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}