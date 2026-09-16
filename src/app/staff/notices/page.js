"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Send,
  Clock3,
  FileText,
  Users,
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
} from "lucide-react";
import StaffSidebar from "@/components/staff/StaffSidebar";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function NoticeManagementPage() {
  const router = useRouter();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [toastType, setToastType] = useState("success"); // 'success' or 'error'
  const [formData, setFormData] = useState({
    title: "",
    category: "General",
    content: "",
    recipients: "All Parents",
    scheduled_for: "",
  });
  const [selectedAction, setSelectedAction] = useState("publish"); // for UI highlight
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Toast helper
  const showToast = (message, type = "success") => {
    setSuccessMessage(message);
    setToastType(type);
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  const fetchNotices = useCallback(async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const params = new URLSearchParams();
      if (filterStatus !== "All") params.append("status", filterStatus);
      if (searchTerm) params.append("search", searchTerm);
      const res = await fetch(`/api/notices?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch");
      }
      const data = await res.json();
      setNotices(data);
    } catch (error) {
      console.error("Error fetching notices:", error);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, searchTerm, router]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const openNewModal = () => {
    setEditingNotice(null);
    setFormData({
      title: "",
      category: "General",
      content: "",
      recipients: "All Parents",
      scheduled_for: "",
    });
    setSelectedAction("publish");
    setShowModal(true);
  };

  const openEditModal = (notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      category: notice.category,
      content: notice.content || "",
      recipients: notice.recipients,
      scheduled_for: notice.scheduled_for ? notice.scheduled_for.split("T")[0] : "",
    });
    // Set default action based on current status
    if (notice.status === "Published") setSelectedAction("publish");
    else if (notice.status === "Scheduled") setSelectedAction("schedule");
    else setSelectedAction("draft");
    setShowModal(true);
  };

  const handleSubmit = async (e, action) => {
    e.preventDefault();
    // Determine status based on action
    let status = "";
    if (action === "publish") {
      status = "Published";
    } else if (action === "schedule") {
      status = "Scheduled";
      // Validate date presence
      if (!formData.scheduled_for) {
        showToast("Please select a date and time to schedule.", "error");
        // Focus the date input
        const dateInput = document.querySelector('input[name="scheduled_for"]');
        if (dateInput) dateInput.focus();
        return;
      }
    } else if (action === "draft") {
      status = "Draft";
    }

    try {
      const token = await auth.currentUser.getIdToken();
      const method = editingNotice ? "PUT" : "POST";
      const url = editingNotice ? `/api/notices/${editingNotice.id}` : "/api/notices";
      const payload = { ...formData, status };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let errorMsg = `Failed to save (${res.status})`;
        try {
          const errorData = await res.json();
          if (errorData.error) errorMsg = errorData.error;
        } catch (_) {}
        throw new Error(errorMsg);
      }
      const responseData = await res.json();
      setShowModal(false);
      let msg = "";
      if (editingNotice) {
        msg = "Notice updated successfully!";
      } else {
        if (status === "Published") msg = "Notice published successfully!";
        else if (status === "Scheduled") msg = "Notice scheduled successfully!";
        else msg = "Notice saved as draft.";
      }
      showToast(msg, "success");
      fetchNotices();
    } catch (error) {
      console.error("Save error:", error);
      showToast(`❌ ${error.message}`, "error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this notice?")) return;
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`/api/notices/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      showToast("Notice deleted successfully.", "success");
      fetchNotices();
    } catch (error) {
      console.error("Delete error:", error);
      showToast("Failed to delete notice.", "error");
    }
  };

  const statusStyles = {
    Published: "bg-green-100 text-green-700",
    Scheduled: "bg-amber-100 text-amber-700",
    Draft: "bg-gray-100 text-gray-600",
  };

  const modalTitle = editingNotice ? "Edit Notice" : "Compose Notice";

  return (
    <div className="flex min-h-screen bg-off-white">
      <StaffSidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      <div
        className={`flex-1 p-8 md:p-10 transition-all duration-300 ${
          isSidebarOpen ? "ml-0 md:ml-64" : "ml-0"
        }`}
      >
        {!isSidebarOpen && (
          <button onClick={toggleSidebar} className="mb-4 text-navy md:hidden">
            <Menu size={28} />
          </button>
        )}

        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-text-muted">
                Create, schedule and manage school notices
              </p>
              <h1 className="text-4xl font-bold text-navy">Notices Management</h1>
            </div>
            <button
              onClick={openNewModal}
              className="flex items-center gap-2 rounded-lg bg-gold px-4 py-2 font-semibold text-navy transition hover:opacity-90"
            >
              <Plus size={18} />
              Compose Notice
            </button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <Send className="mb-4 text-navy" size={28} />
              <p className="text-sm text-text-muted">Published</p>
              <h2 className="mt-2 text-3xl font-bold text-navy">
                {notices.filter((n) => n.status === "Published").length}
              </h2>
              <p className="mt-1 text-xs text-text-muted">Sent notices</p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <Clock3 className="mb-4 text-amber-600" size={28} />
              <p className="text-sm text-text-muted">Scheduled</p>
              <h2 className="mt-2 text-3xl font-bold text-navy">
                {notices.filter((n) => n.status === "Scheduled").length}
              </h2>
              <p className="mt-1 text-xs text-text-muted">Pending delivery</p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <FileText className="mb-4 text-gold" size={28} />
              <p className="text-sm text-text-muted">Drafts</p>
              <h2 className="mt-2 text-3xl font-bold text-navy">
                {notices.filter((n) => n.status === "Draft").length}
              </h2>
              <p className="mt-1 text-xs text-text-muted">Not published</p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <Users className="mb-4 text-green-600" size={28} />
              <p className="text-sm text-text-muted">Total</p>
              <h2 className="mt-2 text-3xl font-bold text-navy">{notices.length}</h2>
              <p className="mt-1 text-xs text-text-muted">All notices</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex flex-wrap gap-2">
              {["All", "Published", "Draft", "Scheduled"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    filterStatus === status
                      ? "bg-navy text-white"
                      : "bg-white shadow-sm hover:bg-gray-50"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            <div className="relative md:ml-auto">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search notices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-gold md:w-64"
              />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <Bell size={20} />
              <h2 className="text-xl font-bold text-navy">Notices</h2>
            </div>
            {loading ? (
              <p className="text-text-muted">Loading...</p>
            ) : notices.length === 0 ? (
              <p className="text-text-muted">No notices found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-3">Title</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Recipients</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notices.map((notice) => (
                      <tr key={notice.id} className="border-b last:border-0">
                        <td className="py-4">
                          <p className="font-medium text-navy">{notice.title}</p>
                        </td>
                        <td>{notice.category}</td>
                        <td>{notice.recipients}</td>
                        <td>
                          {notice.created_at
                            ? new Date(notice.created_at).toLocaleDateString()
                            : "-"}
                        </td>
                        <td>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              statusStyles[notice.status]
                            }`}
                          >
                            {notice.status}
                          </span>
                        </td>
                        <td>
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditModal(notice)}
                              className="rounded-lg bg-slate-100 p-2 hover:bg-slate-200"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(notice.id)}
                              className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200"
                            >
                              <Trash2 size={16} />
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
        </div>
      </div>

      {/* Floating Toast Notification */}
      {successMessage && (
        <div
          className={`fixed bottom-4 left-4 z-50 max-w-sm rounded-lg border px-4 py-3 shadow-lg flex items-center gap-2 ${
            toastType === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-green-50 border-green-200 text-green-800"
          }`}
        >
          <CheckCircle
            size={18}
            className={toastType === "error" ? "text-red-600" : "text-green-600"}
          />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-navy">{modalTitle}</h2>
              <button onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>
            <form className="space-y-4">
              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-medium">Title</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full rounded-lg border p-3"
                  placeholder="Sports Day - 30 May 2026"
                  required
                />
              </div>
              {/* Category & Recipients */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full rounded-lg border p-3"
                  >
                    <option value="General">General</option>
                    <option value="Event">Event</option>
                    <option value="Reminder">Reminder</option>
                    <option value="Finance">Finance</option>
                    <option value="Achievement">Achievement</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Recipients</label>
                  <select
                    name="recipients"
                    value={formData.recipients}
                    onChange={handleChange}
                    className="w-full rounded-lg border p-3"
                  >
                    <option value="All Parents">All Parents</option>
                    <option value="Grade R Parents">Grade R Parents</option>
                    <option value="Grade 1 Parents">Grade 1 Parents</option>
                    <option value="Grade 4-7 Parents">Grade 4-7 Parents</option>
                    <option value="All Staff">All Staff</option>
                  </select>
                </div>
              </div>
              {/* Message */}
              <div>
                <label className="mb-2 block text-sm font-medium">Message</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={5}
                  className="w-full rounded-lg border p-3"
                  required
                />
              </div>
              {/* Schedule field */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Schedule For
                  {selectedAction === "schedule" && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <input
                  type="datetime-local"
                  name="scheduled_for"
                  value={formData.scheduled_for}
                  onChange={handleChange}
                  className={`w-full rounded-lg border p-3 ${
                    selectedAction === "schedule" ? "border-gold" : ""
                  }`}
                />
                {selectedAction === "schedule" && (
                  <p className="mt-1 text-xs text-text-muted">
                    Required when scheduling a notice.
                  </p>
                )}
              </div>
              {/* POPIA notice */}
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-gray-600">
                <div className="flex gap-2">
                  <ShieldCheck size={18} className="mt-0.5 text-gold" />
                  <p>
                    This notice will be sent to portal users only. Do not include
                    learner names or sensitive personal information. POPIA applies.
                  </p>
                </div>
              </div>
              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    setSelectedAction("publish");
                    handleSubmit(e, "publish");
                  }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 font-semibold transition ${
                    selectedAction === "publish"
                      ? "bg-navy text-white"
                      : "bg-gold text-navy hover:opacity-90"
                  }`}
                >
                  <Send size={18} />
                  {editingNotice ? "Publish Now" : "Publish Now"}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    setSelectedAction("schedule");
                    // If no date, focus the input after a short delay
                    if (!formData.scheduled_for) {
                      setTimeout(() => {
                        const dateInput = document.querySelector('input[name="scheduled_for"]');
                        if (dateInput) dateInput.focus();
                      }, 100);
                    }
                    
                    handleSubmit(e, "schedule");
                  }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-3 font-semibold transition ${
                    selectedAction === "schedule"
                      ? "border-gold bg-gold/10 text-navy"
                      : "border-gray-300 bg-white text-navy hover:bg-gray-50"
                  }`}
                >
                  <Calendar size={18} />
                  Schedule
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    setSelectedAction("draft");
                    handleSubmit(e, "draft");
                  }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-3 font-semibold transition ${
                    selectedAction === "draft"
                      ? "border-gold bg-gold/10 text-navy"
                      : "border-gray-300 bg-white text-navy hover:bg-gray-50"
                  }`}
                >
                  <Save size={18} />
                  Save Draft
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border px-5 py-2 text-sm text-gray-600 hover:bg-gray-50"
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