"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  FileText,
  Play,
  BookMarked,
  School,
  ExternalLink,
  RefreshCw,
  Filter,
} from "lucide-react";
import ParentSidebar from "@/components/parent/ParentSidebar";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";

const RESOURCE_CATEGORIES = [
  "All Resources",
  "Literacy & Language",
  "Mathematics",
  "Islamic Studies",
  "Life Skills",
  "Parent Guides",
  "School Documents",
];

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
      videoId =
        parsedUrl.searchParams.get("v") || "";

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

function ResourceCard({ resource }) {
  const embedUrl = getYouTubeEmbedUrl(
    resource.youtube_url
  );

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      {/* Preview */}
      {embedUrl ? (
        <div className="aspect-video w-full bg-navy">
          <iframe
            src={embedUrl}
            title={resource.title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center bg-navy">
          <BookOpen
            size={40}
            className="text-gold"
          />
        </div>
      )}

      {/* Information */}
      <div className="p-5">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-gold/10 px-3 py-1 text-[10px] font-semibold text-navy">
            {resource.grade}
          </span>

          <span className="rounded-full bg-navy/5 px-3 py-1 text-[10px] font-semibold text-navy">
            {resource.category}
          </span>
        </div>

        <h3 className="mt-4 text-lg font-bold text-navy">
          {resource.title}
        </h3>

        {resource.caption && (
          <p className="mt-2 text-sm font-medium text-text-muted">
            {resource.caption}
          </p>
        )}

        {resource.description && (
          <p className="mt-3 text-sm leading-6 text-text-muted">
            {resource.description}
          </p>
        )}

        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-gold">
          {embedUrl ? (
            <Play size={14} />
          ) : (
            <FileText size={14} />
          )}

          {resource.resource_type}
        </div>

        {resource.file_url && (
          <a
            href={resource.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-xs font-semibold text-navy transition hover:opacity-90"
          >
            <FileText size={16} />
            Open Resource
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    </article>
  );
}

function FormPolicyCard({ resource }) {
  return (
    <article className="flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      {/* Thumbnail */}
      {resource.thumbnail_url ? (
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
          <img
            src={resource.thumbnail_url}
            alt={`First page of ${resource.title}`}
            className="h-56 w-full object-cover object-top"
          />
        </div>
      ) : (
        <div className="flex h-56 items-center justify-center rounded-xl bg-slate-50">
          <FileText
            size={48}
            className="text-slate-300"
          />
        </div>
      )}

      {/* Information */}
      <div className="mt-5 flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/10">
          <FileText
            size={20}
            className="text-gold"
          />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-navy/5 px-3 py-1 text-[10px] font-semibold text-navy">
              {resource.resource_type}
            </span>

            <span className="rounded-full bg-gold/10 px-3 py-1 text-[10px] font-semibold text-navy">
              {resource.grade}
            </span>
          </div>

          <h3 className="mt-3 text-lg font-bold text-navy">
            {resource.title}
          </h3>

          {resource.caption && (
            <p className="mt-2 text-sm font-medium text-text-muted">
              {resource.caption}
            </p>
          )}

          {resource.description && (
            <p className="mt-3 text-sm leading-6 text-text-muted">
              {resource.description}
            </p>
          )}
        </div>
      </div>

      {/* Open document */}
      {resource.file_url && (
        <a
          href={resource.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex w-fit items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-xs font-semibold text-navy transition hover:opacity-90"
        >
          <FileText size={16} />
          Open Document
          <ExternalLink size={14} />
        </a>
      )}

      {/* YouTube resource */}
      {resource.youtube_url &&
        !resource.file_url && (
          <a
            href={resource.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex w-fit items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-xs font-semibold text-navy transition hover:opacity-90"
          >
            <Play size={16} />
            Open Resource
            <ExternalLink size={14} />
          </a>
        )}
    </article>
  );
}

export default function ParentResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("All Resources");

  const [selectedGrade, setSelectedGrade] =
    useState("All Grades");

  // ==========================================================
  // Load resources
  // ==========================================================

  useEffect(() => {
    loadResources();
  }, []);

  async function loadResources() {
    try {
      setLoading(true);
      setError("");

      const auth = getAuth(app);
      const user = auth.currentUser;

      if (!user) {
        setError(
          "You must be logged in to view learning resources."
        );
        return;
      }

      const token = await user.getIdToken();

      const response = await fetch(
        "/api/resources",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to load learning resources."
        );
      }

      setResources(data.resources || []);
    } catch (error) {
      console.error(
        "Resources loading error:",
        error
      );

      setError(
        error.message ||
          "Failed to load learning resources."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // Filter normal learning resources
  // ==========================================================

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const isFormOrPolicy =
        resource.resource_type === "Form" ||
        resource.resource_type === "Policy";

      if (isFormOrPolicy) {
        return false;
      }

      const matchesCategory =
        selectedCategory === "All Resources" ||
        resource.category === selectedCategory;

      const matchesGrade =
        selectedGrade === "All Grades" ||
        resource.grade === selectedGrade ||
        resource.grade === "General";

      return (
        matchesCategory &&
        matchesGrade
      );
    });
  }, [
    resources,
    selectedCategory,
    selectedGrade,
  ]);

  // ==========================================================
  // Filter forms and policies
  // ==========================================================

  const formPolicyResources = useMemo(() => {
    return resources.filter((resource) => {
      const isFormOrPolicy =
        resource.resource_type === "Form" ||
        resource.resource_type === "Policy";

      if (!isFormOrPolicy) {
        return false;
      }

      const matchesGrade =
        selectedGrade === "All Grades" ||
        resource.grade === selectedGrade ||
        resource.grade === "General";

      return matchesGrade;
    });
  }, [resources, selectedGrade]);

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
              <BookOpen
                size={21}
                className="text-gold"
              />

              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Parent Portal
              </span>
            </div>

            <h1 className="text-2xl font-bold text-navy md:text-3xl">
              Learning Resources
            </h1>

            <p className="mt-1 text-sm text-text-muted">
              Access educational materials, videos,
              guides and school documents for your learner.
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
                Filter Resources
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              {/* Category */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-navy">
                  Category
                </label>

                <select
                  value={selectedCategory}
                  onChange={(e) =>
                    setSelectedCategory(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-text outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                >
                  {RESOURCE_CATEGORIES.map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    )
                  )}
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
                Loading learning resources...
              </p>
            </div>
          ) : (
            <>
              {/* ================================================= */}
              {/* Learning Resources */}
              {/* ================================================= */}

              <section>
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen
                      size={18}
                      className="text-gold"
                    />

                    <h2 className="text-lg font-bold text-navy">
                      Learning Materials
                    </h2>
                  </div>

                  <p className="mt-1 text-sm text-text-muted">
                    Educational resources relevant to your
                    selected grade and category.
                  </p>
                </div>

                {filteredResources.length === 0 ? (
                  <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-navy">
                      <BookOpen
                        size={22}
                        className="text-gold"
                      />
                    </div>

                    <h2 className="mt-4 text-base font-bold text-navy">
                      No resources found
                    </h2>

                    <p className="mx-auto mt-1 max-w-md text-sm text-text-muted">
                      There are currently no published
                      learning resources matching your
                      selected filters.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredResources.map(
                      (resource) => (
                        <ResourceCard
                          key={resource.id}
                          resource={resource}
                        />
                      )
                    )}
                  </div>
                )}
              </section>

              {/* ================================================= */}
              {/* Forms & Policies */}
              {/* ================================================= */}

              <section className="mt-12">
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <School
                      size={18}
                      className="text-gold"
                    />

                    <h2 className="text-lg font-bold text-navy">
                      Forms & Policies
                    </h2>
                  </div>

                  <p className="mt-1 text-sm text-text-muted">
                    Official school forms, policies and
                    documents available to parents.
                  </p>
                </div>

                {formPolicyResources.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                    <FileText
                      size={25}
                      className="mx-auto mb-2 text-slate-300"
                    />

                    <p className="text-sm font-semibold text-text-muted">
                      No forms or policies available
                    </p>

                    <p className="mt-1 text-xs text-text-muted">
                      School forms, policies and official
                      documents will appear here when
                      available.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {formPolicyResources.map(
                      (resource) => (
                        <FormPolicyCard
                          key={resource.id}
                          resource={resource}
                        />
                      )
                    )}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}