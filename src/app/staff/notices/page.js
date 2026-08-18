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
} from "lucide-react";
import StaffSidebar from "@/components/staff/StaffSidebar";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation"; // <-- add this import

export default function NoticeManagementPage() {
  const router = useRouter(); // <-- needed for redirect on 401
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "General",
    content: "",
    recipients: "All Parents",
    status: "Draft",
    scheduled_for: "",
  });
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Fetch notices
  const fetchNotices = useCallback(async () => {
    try {
      console.log("🔍 Fetching notices with filters:", { filterStatus, searchTerm });
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
      console.log("✅ Notices received:", data);
      setNotices(data);
    } catch (error) {
      console.error("❌ Error fetching notices:", error);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, searchTerm, router]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Open modal for new notice
  const openNewModal = () => {
    setEditingNotice(null);
    setFormData({
      title: "",
      category: "General",
      content: "",
      recipients: "All Parents",
      status: "Draft",
      scheduled_for: "",
    });
    setShowModal(true);
  };

  // Open modal for edit
  const openEditModal = (notice) => {
    console.log("✏️ Editing notice:", notice);
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      category: notice.category,
      content: notice.content || "",
      recipients: notice.recipients,
      status: notice.status,
      scheduled_for: notice.scheduled_for ? notice.scheduled_for.split("T")[0] : "",
    });
    setShowModal(true);
  };

  // Submit create/update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("🚀 Submitting form. Editing?", !!editingNotice);
      const token = await auth.currentUser.getIdToken();
      const method = editingNotice ? "PUT" : "POST";
      const url = editingNotice ? `/api/notices/${editingNotice.id}` : "/api/notices";
      console.log(`🔗 Sending ${method} request to ${url}`);
      console.log("📦 Payload:", formData);

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Save failed with status", res.status, errorText);
        throw new Error(`Failed to save (${res.status})`);
      }
      const responseData = await res.json();
      console.log("✅ Save successful:", responseData);
      setShowModal(false);
      fetchNotices();
    } catch (error) {
      console.error("❌ Save error:", error);
    }
  };

  // Delete notice
  const handleDelete = async (id) => {
    if (!confirm("Delete this notice?")) return;
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`/api/notices/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      console.log("🗑️ Deleted notice", id);
      fetchNotices();
    } catch (error) {
      console.error("❌ Delete error:", error);
    }
  };

  // Auth check (just for debug)
  useEffect(() => {
    const checkAuth = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.log("No user logged in");
        return;
      }
      const token = await user.getIdToken();
      console.log("Token exists?", !!token);
    };
    checkAuth();
  }, []);

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

          {/* Debug Panel */}
          <div className="bg-gray-100 p-4 rounded border border-red-300 text-sm">
            <p className="font-bold">🔍 Debug:</p>
            <p>Notices count: {notices.length}</p>
            <pre className="text-xs overflow-auto max-h-40">
              {JSON.stringify(notices, null, 2)}
            </pre>
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
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-lg border p-3"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Published">Published</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Schedule For (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduled_for"
                    value={formData.scheduled_for}
                    onChange={handleChange}
                    className="w-full rounded-lg border p-3"
                  />
                </div>
              </div>
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-gray-600">
                <div className="flex gap-2">
                  <ShieldCheck size={18} className="mt-0.5 text-gold" />
                  <p>
                    This notice will be sent to portal users only. Do not include
                    learner names or sensitive personal information. POPIA applies.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gold py-3 font-semibold text-navy hover:opacity-90"
                >
                  {editingNotice ? "Update" : "Send Now"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex items-center gap-2 rounded-lg border px-5 py-3"
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