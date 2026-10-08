"use client";

import { useEffect, useMemo, useState } from "react";

import {
  BookOpen,
  CheckCircle,
  ChevronDown,
  Edit,
  Eye,
  Filter,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import StaffSidebar from "@/components/staff/StaffSidebar";
import { auth } from "@/lib/firebase";

const emptyForm = {
  grade: "General",
  category: "",
  resource_type: "Video",
  title: "",
  caption: "",
  description: "",
  youtube_url: "",
  file_url: "",
    thumbnail_url: "",

  is_published: true,
};

const grades = [
  "Grade R",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "General",
];

const topics = [
  "Literacy & Language",
  "Mathematics",
  "Islamic Studies",
  "Life Skills",
  "Parent Guides",
  "School Documents",
];

const resourceTypes = [
  "Video",
  "Worksheet",
  "Reading List",
  "Guide",
  "School Document",
  "Form",
  "Policy",
  "Other",
];

function getYouTubeEmbedUrl(url) {
  if (!url) return "";

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    let videoId = "";

    if (
      hostname === "youtu.be" ||
      hostname === "www.youtu.be"
    ) {
      videoId = parsedUrl.pathname
        .replace(/^\/+/, "")
        .split("/")[0];
    }

    if (
      hostname === "youtube.com" ||
      hostname === "www.youtube.com" ||
      hostname === "m.youtube.com"
    ) {
      videoId = parsedUrl.searchParams.get("v") || "";

      if (parsedUrl.pathname.startsWith("/embed/")) {
        videoId = parsedUrl.pathname
          .split("/embed/")[1]
          .split("/")[0];
      }

      if (parsedUrl.pathname.startsWith("/shorts/")) {
        videoId = parsedUrl.pathname
          .split("/shorts/")[1]
          .split("/")[0];
      }
    }

    if (!videoId) return "";

    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return "";
  }
}

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatCard({ title, value, description }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-text-muted">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold text-navy">
        {value}
      </p>

      <p className="mt-1 text-xs text-text-muted">
        {description}
      </p>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
        {label}
      </p>

      <p className="mt-1 text-sm text-text">
        {value || "—"}
      </p>
    </div>
  );
}

export default function LearningResourcesManagementPage() {
  const [resources, setResources] = useState([]);

  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formError, setFormError] = useState("");

  const [showFormModal, setShowFormModal] = useState(false);
  const [viewingResource, setViewingResource] = useState(null);
  const [editingResource, setEditingResource] = useState(null);
  const [deletingResource, setDeletingResource] = useState(null);

  const [form, setForm] = useState({ ...emptyForm });
  const [selectedFile, setSelectedFile] = useState(null);

  const toggleSidebar = () => {
    setIsSidebarOpen((current) => !current);
  };

  const getAuthHeaders = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("You must be logged in.");
    }

    const token = await currentUser.getIdToken();

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const getAuthTokenHeaders = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("You must be logged in.");
    }

    const token = await currentUser.getIdToken();

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError("");

      const headers = await getAuthHeaders();

      const response = await fetch(
        "/api/staff/admin/resources",
        {
          method: "GET",
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load resources."
        );
      }

      setResources(data.resources || []);
    } catch (err) {
      console.error(err);

      setError(
        err.message || "Failed to load learning resources."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const filteredResources = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return resources.filter((resource) => {
      const matchesSearch =
        !searchTerm ||
        resource.title
          ?.toLowerCase()
          .includes(searchTerm) ||
        resource.caption
          ?.toLowerCase()
          .includes(searchTerm) ||
        resource.description
          ?.toLowerCase()
          .includes(searchTerm);

      const matchesGrade =
        gradeFilter === "all" ||
        resource.grade === gradeFilter;

      const matchesTopic =
        topicFilter === "all" ||
        resource.category === topicFilter;

      const matchesType =
        typeFilter === "all" ||
        resource.resource_type === typeFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" &&
          resource.is_published) ||
        (statusFilter === "draft" &&
          !resource.is_published);

      return (
        matchesSearch &&
        matchesGrade &&
        matchesTopic &&
        matchesType &&
        matchesStatus
      );
    });
  }, [
    resources,
    search,
    gradeFilter,
    topicFilter,
    typeFilter,
    statusFilter,
  ]);

  const totalResources = resources.length;

  const publishedResources = resources.filter(
    (resource) => resource.is_published
  ).length;

  const draftResources = resources.filter(
    (resource) => !resource.is_published
  ).length;

  const videoResources = resources.filter(
    (resource) => resource.resource_type === "Video"
  ).length;

  const openCreateModal = () => {
    setEditingResource(null);
    setForm({ ...emptyForm });
    setSelectedFile(null);
    setFormError("");
    setShowFormModal(true);
  };

  const openEditModal = (resource) => {
    setEditingResource(resource);

    setForm({
      grade: resource.grade || "General",
      category: resource.category || "",
      resource_type: resource.resource_type || "Video",
      title: resource.title || "",
      caption: resource.caption || "",
      description: resource.description || "",
      youtube_url: resource.youtube_url || "",
      thumbnail_url: resource.thumbnail_url || "",
      file_url: resource.file_url || "",
      is_published: Boolean(resource.is_published),
    });

    setSelectedFile(null);
    setFormError("");
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    if (saving) return;

    setShowFormModal(false);
    setEditingResource(null);
    setSelectedFile(null);
    setFormError("");
    setForm({ ...emptyForm });
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setFormError("");
  };

  const handleResourceTypeChange = (event) => {
    const value = event.target.value;

    setForm((current) => ({
      ...current,
      resource_type: value,
      ...(value === "Video"
        ? { file_url: "" }
        : {}),
    }));

    if (value === "Video") {
      setSelectedFile(null);
    }

    setFormError("");
  };

  const handleStatusChange = (event) => {
    setForm((current) => ({
      ...current,
      is_published: event.target.value === "published",
    }));

    setFormError("");
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;

    setSelectedFile(file);
    setFormError("");

    if (file) {
      setForm((current) => ({
        ...current,
        file_url: "",
      }));
    }
  };

const uploadFile = async () => {
  if (!selectedFile) {
    return {
      file_url: form.file_url || "",
      thumbnail_url: form.thumbnail_url || "",
    };
  }

  const headers = await getAuthTokenHeaders();

  const formData = new FormData();
  formData.append("file", selectedFile);

  const response = await fetch(
    "/api/staff/admin/resources/upload",
    {
      method: "POST",
      headers,
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Failed to upload file."
    );
  }

  return {
    file_url: data.file_url || "",
    thumbnail_url: data.thumbnail_url || "",
  };
};

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setFormError("");

      if (!form.grade) {
        throw new Error("Please select a grade.");
      }

      if (!form.category) {
        throw new Error("Please select a topic.");
      }

      if (!form.resource_type) {
        throw new Error(
          "Please select a resource type."
        );
      }

      if (!form.title.trim()) {
        throw new Error("Please enter a title.");
      }

      if (!form.caption.trim()) {
        throw new Error("Please enter a caption.");
      }

      let youtubeUrl = form.youtube_url.trim();
      let fileUrl = form.file_url || "";
      let thumbnailUrl = form.thumbnail_url || "";

      if (form.resource_type === "Video") {
        if (!youtubeUrl) {
          throw new Error(
            "A YouTube URL is required for video resources."
          );
        }

        if (!getYouTubeEmbedUrl(youtubeUrl)) {
          throw new Error(
            "Please enter a valid YouTube URL."
          );
        }

        fileUrl = "";
      } else {
        if (youtubeUrl && !getYouTubeEmbedUrl(youtubeUrl)) {
          throw new Error(
            "Please enter a valid YouTube URL or leave it blank."
          );
        }

      if (selectedFile) {
  const uploadedFile = await uploadFile();

  fileUrl = uploadedFile.file_url;
  thumbnailUrl = uploadedFile.thumbnail_url;
}

        if (!youtubeUrl && !fileUrl) {
          throw new Error(
            "Please provide a YouTube URL or upload a PDF/image for this resource."
          );
        }
      }

      const headers = await getAuthHeaders();

const payload = {
  ...form,
  youtube_url: youtubeUrl || "",
  file_url: fileUrl || "",
  thumbnail_url: thumbnailUrl || "",
};

      if (editingResource) {
        payload.id = editingResource.id;
      }

      const response = await fetch(
        "/api/staff/admin/resources",
        {
          method: editingResource ? "PUT" : "POST",
          headers,
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to save learning resource."
        );
      }

      setShowFormModal(false);
      setEditingResource(null);
      setSelectedFile(null);
      setForm({ ...emptyForm });

      setSuccess(
        editingResource
          ? "Learning resource updated successfully."
          : form.is_published
            ? "Learning resource published successfully."
            : "Learning resource saved as a draft."
      );

      await fetchResources();

      setTimeout(() => {
        setSuccess("");
      }, 4000);
    } catch (err) {
      console.error(err);

      setFormError(
        err.message || "Failed to save learning resource."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingResource) return;

    try {
      setSaving(true);
      setError("");

      const headers = await getAuthHeaders();

      const response = await fetch(
        `/api/staff/admin/resources?id=${deletingResource.id}`,
        {
          method: "DELETE",
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete learning resource."
        );
      }

      setDeletingResource(null);

      setSuccess(
        "Learning resource deleted successfully."
      );

      await fetchResources();

      setTimeout(() => {
        setSuccess("");
      }, 4000);
    } catch (err) {
      console.error(err);

      setError(
        err.message || "Failed to delete learning resource."
      );
    } finally {
      setSaving(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setGradeFilter("all");
    setTopicFilter("all");
    setTypeFilter("all");
    setStatusFilter("all");
  };

  const previewUrl = getYouTubeEmbedUrl(
    form.youtube_url
  );

  return (
    <div className="flex min-h-screen bg-slate-100">
      <StaffSidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
      />

      <main
        className={`flex-1 p-6 transition-all duration-300 md:p-8 lg:p-10 ${
          isSidebarOpen ? "md:ml-64" : "ml-0"
        }`}
      >
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>

            <div className="mb-1 flex items-center gap-2">
              <BookOpen
                size={21}
                className="text-gold"
              />

              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Admin Portal
              </span>
            </div>
                       <h1 className="mt-1 text-3xl font-bold text-navy md:text-4xl">
              Learning Resources Management
            </h1>
            <p className="text-sm font-medium text-text-muted">
              Manage learning resources available to
              learners and parents
            </p>


          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 font-semibold text-navy shadow-sm transition hover:opacity-90"
          >
            <Plus className="h-5 w-5" />
            Add Resource
          </button>
        </div>

        {/* Alerts outside form */}
        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle className="h-5 w-5" />
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>

            <button
              onClick={() => setError("")}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Resources"
            value={totalResources}
            description="All learning resources"
          />

          <StatCard
            title="Published"
            value={publishedResources}
            description="Visible on the public site"
          />

          <StatCard
            title="Drafts"
            value={draftResources}
            description="Not currently published"
          />

          <StatCard
            title="Videos"
            value={videoResources}
            description="YouTube resources"
          />
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Filter className="h-5 w-5 text-navy" />

            <h2 className="font-semibold text-navy">
              Filter Resources
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search resources..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>

            <div className="relative">
              <select
                value={gradeFilter}
                onChange={(event) =>
                  setGradeFilter(event.target.value)
                }
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm text-text outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
              >
                <option value="all">All Grades</option>

                {grades.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            </div>

            <div className="relative">
              <select
                value={topicFilter}
                onChange={(event) =>
                  setTopicFilter(event.target.value)
                }
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm text-text outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
              >
                <option value="all">All Topics</option>

                {topics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            </div>

            <div className="relative">
              <select
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(event.target.value)
                }
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm text-text outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
              >
                <option value="all">All Types</option>

                {resourceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm text-text outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
              >
                <option value="all">All Status</option>

                <option value="published">
                  Published
                </option>

                <option value="draft">
                  Draft
                </option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            </div>
          </div>

          {(search ||
            gradeFilter !== "all" ||
            topicFilter !== "all" ||
            typeFilter !== "all" ||
            statusFilter !== "all") && (
            <button
              onClick={resetFilters}
              className="mt-4 text-sm font-medium text-gold hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Resources Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-navy">
                Learning Resources
              </h2>

              <p className="mt-1 text-sm text-text-muted">
                Showing {filteredResources.length} of{" "}
                {resources.length} resources
              </p>
            </div>

            <button
              onClick={fetchResources}
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

          {loading ? (
            <div className="flex min-h-[250px] items-center justify-center">
              <div className="text-center">
                <RefreshCw className="mx-auto h-7 w-7 animate-spin text-gold" />

                <p className="mt-3 text-sm text-text-muted">
                  Loading learning resources...
                </p>
              </div>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="flex min-h-[250px] flex-col items-center justify-center px-6 text-center">
              <BookOpen className="h-10 w-10 text-slate-300" />

              <h3 className="mt-4 font-semibold text-navy">
                No learning resources found
              </h3>

              <p className="mt-1 max-w-md text-sm text-text-muted">
                {resources.length === 0
                  ? "No resources have been published or saved yet."
                  : "Try changing your search or filters."}
              </p>

              {resources.length === 0 && (
                <button
                  onClick={openCreateModal}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-navy"
                >
                  <Plus className="h-4 w-4" />
                  Add First Resource
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Resource
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Grade
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Topic
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Type
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredResources.map((resource) => (
                    <tr
                      key={resource.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="min-w-0">
                          <p className="font-semibold text-navy">
                            {resource.title}
                          </p>

                          <p className="mt-1 max-w-md truncate text-sm text-text-muted">
                            {resource.caption}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-text">
                        {resource.grade}
                      </td>

                      <td className="px-5 py-4 text-sm text-text">
                        {resource.category}
                      </td>

                      <td className="px-5 py-4 text-sm text-text">
                        {resource.resource_type}
                      </td>

                      <td className="px-5 py-4">
                        {resource.is_published ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-text-muted">
                            Draft
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              setViewingResource(resource)
                            }
                            title="View resource"
                            className="rounded-lg p-2 text-text-muted transition hover:bg-slate-100 hover:text-navy"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() =>
                              openEditModal(resource)
                            }
                            title="Edit resource"
                            className="rounded-lg p-2 text-text-muted transition hover:bg-slate-100 hover:text-navy"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() =>
                              setDeletingResource(resource)
                            }
                            title="Delete resource"
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

        {/* Create / Edit Modal */}
        {showFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <h2 className="text-xl font-bold text-navy">
                    {editingResource
                      ? "Edit Learning Resource"
                      : "Add Learning Resource"}
                  </h2>

                  <p className="mt-1 text-sm text-text-muted">
                    {editingResource
                      ? "Update the learning resource details."
                      : "Add a resource for learners and parents."}
                  </p>
                </div>

                <button
                  onClick={closeFormModal}
                  disabled={saving}
                  className="rounded-lg p-2 text-text-muted hover:bg-slate-100 disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="p-6"
              >
                {/* Form Error */}
                {formError && (
                  <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <X className="mt-0.5 h-5 w-5 shrink-0" />

                    <div>
                      <p className="font-semibold">
                        Unable to save resource
                      </p>

                      <p className="mt-1">
                        {formError}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {/* 1. Grade */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-navy">
                      Grade *
                    </label>

                    <select
                      name="grade"
                      value={form.grade}
                      onChange={handleFormChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                    >
                      {grades.map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. Topic */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-navy">
                      Topic *
                    </label>

                    <select
                      name="category"
                      value={form.category}
                      onChange={handleFormChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                    >
                      <option value="">
                        Select topic
                      </option>

                      {topics.map((topic) => (
                        <option key={topic} value={topic}>
                          {topic}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 3. Resource Type */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-navy">
                      Resource Type *
                    </label>

                    <select
                      name="resource_type"
                      value={form.resource_type}
                      onChange={handleResourceTypeChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                    >
                      {resourceTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 4. Title */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-navy">
                      Title *
                    </label>

                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleFormChange}
                      placeholder="e.g. Introduction to Fractions"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                    />
                  </div>

                  {/* 5. Caption */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-navy">
                      Caption *
                    </label>

                    <input
                      type="text"
                      name="caption"
                      value={form.caption}
                      onChange={handleFormChange}
                      placeholder="Short caption displayed with the resource"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                    />
                  </div>

                  {/* 6. Description */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-navy">
                      Description
                    </label>

                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleFormChange}
                      rows={4}
                      placeholder="Provide more information about this resource..."
                      className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                    />
                  </div>

                  {/* 7. Resource Content */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="font-semibold text-navy">
                      Resource Content
                    </h3>

                    <p className="mt-1 text-sm text-text-muted">
                      {form.resource_type === "Video"
                        ? "Video resources must include a YouTube link."
                        : "You can provide a YouTube link, upload a file, or provide both."}
                    </p>

                    {/* YouTube */}
                    <div className="mt-5">
                      <label className="mb-2 block text-sm font-semibold text-navy">
                        YouTube URL{" "}
                        {form.resource_type === "Video"
                          ? "*"
                          : "(Optional)"}
                      </label>

                      <input
                        type="url"
                        name="youtube_url"
                        value={form.youtube_url}
                        onChange={handleFormChange}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                      />

                      {previewUrl && (
                        <div className="mt-4 overflow-hidden rounded-xl bg-slate-100">
                          <div className="aspect-video">
                            <iframe
                              src={previewUrl}
                              title="YouTube preview"
                              className="h-full w-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* File upload */}
                    {form.resource_type !== "Video" && (
                      <div className="mt-5">
                        <label className="mb-2 block text-sm font-semibold text-navy">
                          Upload File{" "}
                          <span className="font-normal text-text-muted">
                            (PDF, PNG, JPG or JPEG)
                          </span>
                        </label>

                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                          onChange={handleFileChange}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-text outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-navy hover:file:bg-slate-200"
                        />

                        {selectedFile && (
                          <div className="mt-3 flex items-center gap-3 rounded-lg bg-white p-3">
                            <FileText className="h-5 w-5 text-navy" />

                            <div>
                              <p className="text-sm font-medium text-text">
                                {selectedFile.name}
                              </p>

                              <p className="text-xs text-text-muted">
                                {(
                                  selectedFile.size /
                                  1024 /
                                  1024
                                ).toFixed(2)}{" "}
                                MB
                              </p>
                            </div>
                          </div>
                        )}

                        {!selectedFile &&
                          form.file_url && (
                            <div className="mt-3 rounded-lg bg-white p-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                                Current File
                              </p>

                              <a
                                href={form.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-navy hover:underline"
                              >
                                <FileText className="h-4 w-4" />
                                View current file
                              </a>
                            </div>
                          )}
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-navy">
                      Status *
                    </label>

                    <select
                      value={
                        form.is_published
                          ? "published"
                          : "draft"
                      }
                      onChange={handleStatusChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                    >
                      <option value="published">
                        Published
                      </option>

                      <option value="draft">
                        Draft
                      </option>
                    </select>

                    <p className="mt-2 text-xs text-text-muted">
                      Draft resources are saved but will not
                      appear on the public website.
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={closeFormModal}
                    disabled={saving}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-text transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-navy transition hover:opacity-90 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />

                        {editingResource
                          ? "Save Changes"
                          : form.is_published
                            ? "Publish Resource"
                            : "Save Draft"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal */}
        {viewingResource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <h2 className="text-xl font-bold text-navy">
                    Resource Details
                  </h2>

                  <p className="mt-1 text-sm text-text-muted">
                    View learning resource information.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setViewingResource(null)
                  }
                  className="rounded-lg p-2 text-text-muted hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6 p-6">
                {getYouTubeEmbedUrl(
                  viewingResource.youtube_url
                ) && (
                  <div className="overflow-hidden rounded-xl bg-slate-100">
                    <div className="aspect-video">
                      <iframe
                        src={getYouTubeEmbedUrl(
                          viewingResource.youtube_url
                        )}
                        title={viewingResource.title}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-2xl font-bold text-navy">
                    {viewingResource.title}
                  </h3>

                  <p className="mt-2 text-text-muted">
                    {viewingResource.caption}
                  </p>
                </div>

                {viewingResource.description && (
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-sm leading-6 text-text">
                      {viewingResource.description}
                    </p>
                  </div>
                )}
{viewingResource.file_url && (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
    <p className="text-sm font-semibold text-navy">
      Resource File
    </p>

    <p className="mt-1 text-sm text-text-muted">
      Open the document in a new tab to read it. You can
      download it using the browser's download option.
    </p>

    <a
      href={viewingResource.file_url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-3 text-sm font-semibold text-navy transition hover:opacity-90"
    >
      <FileText className="h-4 w-4" />
      Open Document
    </a>
  </div>
)}

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Detail
                    label="Grade"
                    value={viewingResource.grade}
                  />

                  <Detail
                    label="Topic"
                    value={viewingResource.category}
                  />

                  <Detail
                    label="Resource Type"
                    value={viewingResource.resource_type}
                  />

                  <Detail
                    label="Status"
                    value={
                      viewingResource.is_published
                        ? "Published"
                        : "Draft"
                    }
                  />

                  <Detail
                    label="Created By"
                    value={
                      viewingResource.created_by_name
                    }
                  />

                  <Detail
                    label="Created"
                    value={formatDate(
                      viewingResource.created_at
                    )}
                  />

                  <Detail
                    label="Last Updated"
                    value={formatDate(
                      viewingResource.updated_at
                    )}
                  />
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                  <button
                    onClick={() => {
                      setViewingResource(null);
                      openEditModal(viewingResource);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-navy"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Resource
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {deletingResource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <Trash2 className="h-5 w-5 text-red-500" />
              </div>

              <h2 className="mt-5 text-xl font-bold text-navy">
                Delete Resource?
              </h2>

              <p className="mt-2 text-sm leading-6 text-text-muted">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-text">
                  {deletingResource.title}
                </span>
                ? This action cannot be undone.
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() =>
                    setDeletingResource(null)
                  }
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-text"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}