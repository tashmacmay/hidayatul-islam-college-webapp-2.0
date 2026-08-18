"use client";

import { useState } from "react";
import {
  Bell,
  Send,
  Clock3,
  FileText,
  Users,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Save,
  ShieldCheck,
  X,
} from "lucide-react";

const notices = [
  {
    id: 1,
    title: "Sports Day — 30 May 2026",
    category: "Event",
    recipients: "All Parents (156)",
    date: "10 May 2026",
    status: "Published",
  },
  {
    id: 2,
    title: "Winter Uniform Reminder",
    category: "Reminder",
    recipients: "All Parents (156)",
    date: "9 May 2026",
    status: "Published",
  },
  {
    id: 3,
    title: "School Fees — Term 2",
    category: "Finance",
    recipients: "All Parents (156)",
    date: "8 May 2026",
    status: "Published",
  },
  {
    id: 4,
    title: "Term 3 Registration Opens",
    category: "General",
    recipients: "All Parents (156)",
    date: "26 Jun 2026",
    status: "Scheduled",
  },
  {
    id: 5,
    title: "Grade 7 Farewell Plans",
    category: "Event",
    recipients: "Grade 7 Parents (18)",
    date: "-",
    status: "Draft",
  },
];

export default function NoticeManagementPage() {
  const [showModal, setShowModal] = useState(false);

  const statusStyles = {
    Published: "bg-green-100 text-green-700",
    Scheduled: "bg-amber-100 text-amber-700",
    Draft: "bg-gray-100 text-gray-600",
  };

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-text-muted">
              Create, schedule and manage school notices
            </p>

            <h1 className="text-4xl font-bold text-navy">
              Notices Management
            </h1>
          </div>

          <button
            onClick={() => setShowModal(true)}
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

            <p className="text-sm text-text-muted">
              Total Sent
            </p>

            <h2 className="mt-2 text-3xl font-bold text-navy">
              24
            </h2>

            <p className="mt-1 text-xs text-text-muted">
              This term
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <Clock3
              className="mb-4 text-amber-600"
              size={28}
            />

            <p className="text-sm text-text-muted">
              Scheduled
            </p>

            <h2 className="mt-2 text-3xl font-bold text-navy">
              2
            </h2>

            <p className="mt-1 text-xs text-text-muted">
              Pending delivery
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <FileText
              className="mb-4 text-gold"
              size={28}
            />

            <p className="text-sm text-text-muted">
              Drafts
            </p>

            <h2 className="mt-2 text-3xl font-bold text-navy">
              3
            </h2>

            <p className="mt-1 text-xs text-text-muted">
              Not published
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <Users
              className="mb-4 text-green-600"
              size={28}
            />

            <p className="text-sm text-text-muted">
              Recipients
            </p>

            <h2 className="mt-2 text-3xl font-bold text-navy">
              156
            </h2>

            <p className="mt-1 text-xs text-text-muted">
              Active users
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex gap-2">
            <button className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white">
              All
            </button>

            <button className="rounded-lg bg-white px-4 py-2 text-sm font-medium shadow-sm">
              Published
            </button>

            <button className="rounded-lg bg-white px-4 py-2 text-sm font-medium shadow-sm">
              Drafts
            </button>

            <button className="rounded-lg bg-white px-4 py-2 text-sm font-medium shadow-sm">
              Scheduled
            </button>
          </div>

          <div className="relative md:ml-auto">
            <Search
              size={18}
              className="absolute left-3 top-3 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search notices..."
              className="rounded-lg border bg-white py-2 pl-10 pr-4 text-sm outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Bell size={20} />

            <h2 className="text-xl font-bold text-navy">
              Notices
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Recipients</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {notices.map((notice) => (
                  <tr
                    key={notice.id}
                    className="border-b last:border-0"
                  >
                    <td className="py-4">
                      <p className="font-medium text-navy">
                        {notice.title}
                      </p>
                    </td>

                    <td>{notice.category}</td>

                    <td>{notice.recipients}</td>

                    <td>{notice.date}</td>

                    <td>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[notice.status]}`}
                      >
                        {notice.status}
                      </span>
                    </td>

                    <td>
                      <div className="flex justify-end gap-2">
                        {notice.status ===
                          "Published" && (
                          <>
                            <button className="rounded-lg bg-slate-100 p-2">
                              <Eye size={16} />
                            </button>

                            <button className="rounded-lg bg-slate-100 p-2">
                              <Pencil size={16} />
                            </button>

                            <button className="rounded-lg bg-red-100 p-2 text-red-600">
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}

                        {notice.status ===
                          "Scheduled" && (
                          <>
                            <button className="rounded-lg bg-slate-100 p-2">
                              <Pencil size={16} />
                            </button>

                            <button className="rounded-lg bg-red-100 p-2 text-red-600">
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}

                        {notice.status ===
                          "Draft" && (
                          <>
                            <button className="rounded-lg bg-navy px-3 py-2 text-sm text-white">
                              Publish
                            </button>

                            <button className="rounded-lg bg-slate-100 p-2">
                              <Pencil size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-navy">
                Compose Notice
              </h2>

              <button
                onClick={() => setShowModal(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Title
                </label>

                <input
                  className="w-full rounded-lg border p-3"
                  placeholder="Sports Day - 30 May 2026"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Category
                  </label>

                  <select className="w-full rounded-lg border p-3">
                    <option>General</option>
                    <option>Event</option>
                    <option>Reminder</option>
                    <option>Finance</option>
                    <option>Achievement</option>
                    <option>Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Send To
                  </label>

                  <select className="w-full rounded-lg border p-3">
                    <option>All Parents</option>
                    <option>Grade R Parents</option>
                    <option>Grade 1 Parents</option>
                    <option>Grade 4-7 Parents</option>
                    <option>All Staff</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Message
                </label>

                <textarea
                  rows={5}
                  className="w-full rounded-lg border p-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Schedule For (Optional)
                </label>

                <input
                  type="datetime-local"
                  className="w-full rounded-lg border p-3"
                />
              </div>

              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-gray-600">
                <div className="flex gap-2">
                  <ShieldCheck
                    size={18}
                    className="mt-0.5 text-gold"
                  />

                  <p>
                    This notice will be sent to
                    portal users only. Do not
                    include learner names or
                    sensitive personal
                    information. POPIA applies.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gold py-3 font-semibold text-navy">
                  <Send size={18} />
                  Send Now
                </button>

                <button className="flex items-center gap-2 rounded-lg border px-5 py-3">
                  <Save size={18} />
                  Save Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

