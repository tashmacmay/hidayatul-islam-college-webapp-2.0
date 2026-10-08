"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  CalendarDays,
  Upload,
  Eye,
  Trash2,
  RefreshCw,
  FileText,
  Image as ImageIcon,
  X,
} from "lucide-react";

import { auth } from "@/lib/firebase";
import StaffSidebar from "@/components/staff/StaffSidebar";

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

const TERMS = [1, 2, 3, 4];

export default function CalendarManagementPage() {
  const [user, setUser] = useState(null);
  const [calendars, setCalendars] = useState([]);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Upload modal
  const [showUploadModal, setShowUploadModal] = useState(false);

  // View modal
  const [viewingCalendar, setViewingCalendar] = useState(null);

  // Upload form
  const [uploadTerm, setUploadTerm] = useState("1");
  const [uploadGrade, setUploadGrade] =
    useState("All Grades");
  const [selectedFile, setSelectedFile] = useState(null);

  // Editing from the view modal
  const [editingCalendar, setEditingCalendar] =
    useState(null);

  // ==========================================================
  // Firebase authentication
  // ==========================================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
      }
    );

    return () => unsubscribe();
  }, []);

  // ==========================================================
  // Fetch calendars
  // ==========================================================

  const fetchCalendars = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError("");

      const token = await user.getIdToken();

      const response = await fetch(
        "/api/staff/admin/calendar",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to load calendars."
        );
      }

      setCalendars(data.calendars || []);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Failed to load calendars."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendars();
  }, [user]);

  // ==========================================================
  // Get calendar for term + grade
  // ==========================================================

  const getCalendar = (term, grade) => {
    return calendars.find(
      (calendar) =>
        calendar.term === term &&
        calendar.grade === grade
    );
  };

  // ==========================================================
  // Open upload modal
  // ==========================================================

  const openUploadModal = (
    term = "1",
    grade = "All Grades",
    calendar = null
  ) => {
    setEditingCalendar(calendar);

    setUploadTerm(
      String(calendar?.term || term)
    );

    setUploadGrade(
      calendar?.grade || grade
    );

    setSelectedFile(null);

    setError("");
    setSuccess("");

    setShowUploadModal(true);
  };

  // ==========================================================
  // Close upload modal
  // ==========================================================

  const closeUploadModal = () => {
    if (uploading) return;

    setShowUploadModal(false);
    setEditingCalendar(null);
    setSelectedFile(null);
  };

  // ==========================================================
  // View calendar
  // ==========================================================

  const openViewModal = (calendar) => {
    setError("");
    setSuccess("");
    setViewingCalendar(calendar);
  };

  const closeViewModal = () => {
    setViewingCalendar(null);
  };

  // ==========================================================
  // Edit calendar from view modal
  // ==========================================================

  const editFromView = () => {
    if (!viewingCalendar) return;

    const calendar = viewingCalendar;

    setViewingCalendar(null);

    openUploadModal(
      String(calendar.term),
      calendar.grade,
      calendar
    );
  };

  // ==========================================================
  // Upload / replace calendar
  // ==========================================================

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("You are not logged in.");
      return;
    }

    if (!selectedFile) {
      setError(
        "Please select a PDF or PNG file."
      );
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/png",
    ];

    if (
      !allowedTypes.includes(
        selectedFile.type
      )
    ) {
      setError(
        "Only PDF and PNG files are allowed."
      );

      return;
    }

    if (
      selectedFile.size >
      10 * 1024 * 1024
    ) {
      setError(
        "File size cannot exceed 10 MB."
      );

      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const token =
        await user.getIdToken();

// ======================================================
// Step 1: Upload physical calendar file
// ======================================================

const formData = new FormData();

formData.append(
  "file",
  selectedFile
);

const uploadResponse =
  await fetch(
    "/api/staff/admin/calendar/upload",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

const uploadData =
  await uploadResponse.json();

if (!uploadResponse.ok) {
  throw new Error(
    uploadData.error ||
      "File upload failed."
  );
}

      // ======================================================
      // Step 2: Save calendar record
      // ======================================================

      const calendarData = {
        term: Number(uploadTerm),
        grade: uploadGrade,
        file_name:
          uploadData.file_name ||
          selectedFile.name,
        file_url:
          uploadData.file_url,
        file_type:
          uploadData.file_type ||
          (
            selectedFile.type ===
            "application/pdf"
              ? "PDF"
              : "PNG"
          ),
      };

      const endpoint =
        editingCalendar
          ? `/api/staff/admin/calendar/${editingCalendar.id}`
          : "/api/staff/admin/calendar";

      const method =
        editingCalendar
          ? "PUT"
          : "POST";

      const response =
        await fetch(endpoint, {
          method,
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(
            calendarData
          ),
        });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to save calendar."
        );
      }

      setSuccess(
        editingCalendar
          ? "Calendar replaced successfully."
          : "Calendar uploaded successfully."
      );

      closeUploadModal();

      await fetchCalendars();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Failed to upload calendar."
      );
    } finally {
      setUploading(false);
    }
  };

  // ==========================================================
  // Delete calendar
  // ==========================================================

  const handleDelete = async (
    calendar
  ) => {
    const confirmed =
      window.confirm(
        `Delete the ${calendar.grade} calendar for Term ${calendar.term}?`
      );

    if (!confirmed) return;

    try {
      const token =
        await user.getIdToken();

      const response =
        await fetch(
          `/api/staff/admin/calendar/${calendar.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to delete calendar."
        );
      }

      setViewingCalendar(null);

      setSuccess(
        "Calendar deleted successfully."
      );

      await fetchCalendars();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Failed to delete calendar."
      );
    }
  };

  // ==========================================================
// Render
// ==========================================================

return (
  <div className="min-h-screen bg-slate-100">
    <StaffSidebar />

    <main className="min-h-screen md:ml-[240px]">
      <div className="mx-auto w-full max-w-[1600px] px-5 py-6 md:px-8 md:py-8">

        {/* ================================================= */}
        {/* Header */}
        {/* ================================================= */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <CalendarDays
                size={21}
                className="text-gold"
              />

              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Administration
              </span>
            </div>

            <h1 className="text-2xl font-bold text-navy md:text-3xl">
              Term Calendar Management
            </h1>

            <p className="mt-1 text-sm text-text-muted">
              Manage school calendars by term and grade.
            </p>
          </div>

          {/* ONLY upload button */}
          <button
            onClick={() => openUploadModal()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 font-semibold text-navy shadow-sm transition hover:opacity-90"
          >
            <Upload size={17} />
            Upload Calendar
          </button>
        </div>

        {/* ================================================= */}
        {/* Messages */}
        {/* ================================================= */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* ================================================= */}
        {/* Calendar */}
        {/* ================================================= */}

        {loading ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm">
            <RefreshCw
              className="mx-auto mb-3 animate-spin text-gold"
              size={24}
            />

            <p className="text-sm text-text-muted">
              Loading calendars...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {TERMS.map((term) => (
              <section
                key={term}
                className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
              >
                {/* Term heading */}

                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <div className="flex items-center gap-3">
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
                        Click a grade to view its calendar.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grade buttons */}

                <div className="p-5">
                  <div className="flex flex-wrap gap-2">
                    {GRADES.map((grade) => {
                      const calendar = getCalendar(
                        term,
                        grade
                      );

                      return (
                        <button
                          key={`${term}-${grade}`}
                          onClick={() => {
                            if (calendar) {
                              openViewModal(calendar);
                            }
                          }}
                          disabled={!calendar}
                          className={`
                            inline-flex items-center gap-2
                            rounded-xl border
                            px-3 py-2
                            text-xs font-semibold
                            transition
                            ${
                              calendar
                                ? "border-slate-200 bg-white text-navy hover:border-gold hover:bg-slate-50"
                                : "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300"
                            }
                          `}
                        >
                          {calendar ? (
                            calendar.file_type === "PDF" ? (
                              <FileText
                                size={14}
                                className="text-red-500"
                              />
                            ) : (
                              <ImageIcon
                                size={14}
                                className="text-blue-500"
                              />
                            )
                          ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                          )}

                          {grade}

                          {calendar && (
                            <span className="ml-0.5 text-gold">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>

    {/* ===================================================== */}
    {/* View Calendar Modal */}
    {/* ===================================================== */}

    {viewingCalendar && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/40 p-4">
        <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

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
            {viewingCalendar.file_type === "PDF" ? (
              <iframe
                src={viewingCalendar.file_url}
                title={viewingCalendar.file_name}
                className="h-[60vh] w-full rounded-xl border border-slate-100 bg-white"
              />
            ) : (
              <div className="flex min-h-[50vh] items-center justify-center">
                <img
                  src={viewingCalendar.file_url}
                  alt={viewingCalendar.file_name}
                  className="max-h-[65vh] max-w-full rounded-xl border border-slate-100 bg-white object-contain shadow-sm"
                />
              </div>
            )}
          </div>

          {/* Actions */}

          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-text-muted">
              {viewingCalendar.file_type} calendar
            </div>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  handleDelete(viewingCalendar)
                }
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <Trash2 size={15} />
                Delete
              </button>

              <button
                onClick={editFromView}
                className="inline-flex items-center gap-2 rounded-xl border border-gold px-4 py-2.5 text-sm font-semibold text-navy transition hover:bg-gold/10"
              >
                <RefreshCw size={15} />
                Replace
              </button>

              <button
                onClick={closeViewModal}
                className="rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* ===================================================== */}
    {/* Upload Modal */}
    {/* ===================================================== */}

    {showUploadModal && (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-navy/40 p-4">
        <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

          {/* Header */}

          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-xl font-bold text-navy">
                {editingCalendar
                  ? "Replace Calendar"
                  : "Upload Calendar"}
              </h2>

              <p className="mt-1 text-sm text-text-muted">
                Upload a PNG or PDF calendar.
              </p>
            </div>

            <button
              onClick={closeUploadModal}
              disabled={uploading}
              className="rounded-lg p-2 text-text-muted transition hover:bg-slate-100"
            >
              <X size={19} />
            </button>
          </div>

          {/* Form */}

          <form
            onSubmit={handleUpload}
            className="space-y-5 p-5"
          >

            {/* Term */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-navy">
                Term
              </label>

              <select
                value={uploadTerm}
                onChange={(e) =>
                  setUploadTerm(e.target.value)
                }
                disabled={uploading}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-text outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              >
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
                value={uploadGrade}
                onChange={(e) =>
                  setUploadGrade(e.target.value)
                }
                disabled={uploading}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-text outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              >
                {GRADES.map((grade) => (
                  <option
                    key={grade}
                    value={grade}
                  >
                    {grade}
                  </option>
                ))}
              </select>
            </div>

            {/* File */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-navy">
                Calendar File
              </label>

              <input
                type="file"
                accept=".pdf,.png,application/pdf,image/png"
                onChange={(e) =>
                  setSelectedFile(
                    e.target.files?.[0] || null
                  )
                }
                disabled={uploading}
                className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-text outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              />

              <p className="mt-1.5 text-xs text-text-muted">
                PDF or PNG • Maximum 10 MB
              </p>
            </div>

            {/* Selected file */}

            {selectedFile && (
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-text-muted">
                <span className="font-semibold text-navy">
                  Selected:
                </span>{" "}
                {selectedFile.name}
              </div>
            )}

            {/* Modal error */}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Buttons */}

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={closeUploadModal}
                disabled={uploading}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-text transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  uploading || !selectedFile
                }
                className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-navy transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <RefreshCw
                      size={15}
                      className="animate-spin"
                    />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={15} />
                    {editingCalendar
                      ? "Replace Calendar"
                      : "Upload Calendar"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
);
}