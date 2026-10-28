"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  FileText,
  Play,
  School,
  ExternalLink,
  Filter,
} from "lucide-react";
import ParentSidebar from "@/components/parent/ParentSidebar";
import StaffSidebar from "@/components/staff/StaffSidebar";
import ShellPage from "@/components/layout/ShellPage";
import LoadingState from "@/components/ui/LoadingState";
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

function getYouTubeVideoId(url) {
  if (!url) return "";

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();
    let videoId = "";

    if (
      hostname === "youtu.be" ||
      hostname === "www.youtu.be"
    ) {
      videoId =
        parsedUrl.pathname.split("/").filter(Boolean)[0] || "";
    } else if (
      [
        "youtube.com",
        "www.youtube.com",
        "m.youtube.com",
        "music.youtube.com",
      ].includes(hostname)
    ) {
      videoId = parsedUrl.searchParams.get("v") || "";

      const match = parsedUrl.pathname.match(
        /^\/(?:embed|shorts|live)\/([^/?]+)/
      );

      if (!videoId && match) {
        videoId = match[1];
      }
    }

    return /^[A-Za-z0-9_-]{11}$/.test(videoId)
      ? videoId
      : "";
  } catch {
    return "";
  }
}

function getYouTubeThumbnail(url) {
  const videoId = getYouTubeVideoId(url);

  return videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : "";
}

async function openProtectedResource(resourceId) {
  const newTab = window.open("about:blank", "_blank");

  if (!newTab) {
    alert("Please allow pop-ups to open this document.");
    return;
  }

  newTab.opener = null;
  newTab.document.title = "Opening resource...";

  try {
    const user = getAuth(app).currentUser;

    if (!user) {
      throw new Error(
        "Please sign in again to open this document."
      );
    }

    const token = await user.getIdToken();

    const response = await fetch("/api/storage/sign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ resourceId }),
    });

    const data = await response.json();

    if (!response.ok || !data.url) {
      throw new Error(
        data.error || "Unable to open this document."
      );
    }

    newTab.location.replace(data.url);
  } catch (error) {
    newTab.close();
    alert(
      error.message || "Unable to open this document."
    );
  }
}

function ResourcePreview({ resource }) {
  const videoId = getYouTubeVideoId(resource.youtube_url);
  const videoThumbnail = getYouTubeThumbnail(
    resource.youtube_url
  );

  const storedThumbnail =
    typeof resource.thumbnail_url === "string" &&
    (
      /^https?:\/\//i.test(resource.thumbnail_url) ||
      (
        resource.thumbnail_url.startsWith("/") &&
        !resource.thumbnail_url.startsWith("//")
      )
    )
      ? resource.thumbnail_url
      : "";

  // Prefer a YouTube thumbnail for videos; otherwise use the
  // thumbnail stored with the resource.
  const imageUrl = videoThumbnail || storedThumbnail;
  const isPdf = /\.pdf(?:[?#]|$)/i.test(
    resource.file_url || ""
  );

  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  // Do not reserve a large preview area when no image exists.
  if (!imageUrl || imageFailed) {
    if (!videoId) return null;

    return (
      <div className="flex h-16 w-full items-center justify-center bg-navy">
        <Play size={24} className="text-gold" />
      </div>
    );
  }

  return (
    <div
      className={`relative w-full overflow-hidden bg-slate-100 ${
        isPdf ? "h-56" : "aspect-video"
      }`}
    >
      <img
        src={imageUrl}
        alt={
          videoId
            ? `Video thumbnail: ${resource.title}`
            : `Preview of ${resource.title}`
        }
        loading="lazy"
        className={`h-full w-full ${
          isPdf
            ? "object-contain object-top"
            : "object-cover"
        }`}
        onError={() => setImageFailed(true)}
      />

      {videoId && (
        <a
          href={resource.youtube_url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Watch ${resource.title} on YouTube`}
          className="absolute inset-0 flex items-center justify-center bg-black/10 transition hover:bg-black/25"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 shadow-lg">
            <Play
              size={25}
              className="ml-1 text-red-600"
              fill="currentColor"
            />
          </span>
        </a>
      )}
    </div>
  );
}

function ResourceCard({ resource }) {
  const videoId = getYouTubeVideoId(resource.youtube_url);
  const isVideo = Boolean(videoId);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <ResourcePreview resource={resource} />

      <div className="p-5">
        <div className="flex flex-wrap gap-2">
          {resource.grade && (
            <span className="rounded-full bg-gold/10 px-3 py-1 text-[10px] font-semibold text-navy">
              {resource.grade}
            </span>
          )}

          {resource.category && (
            <span className="rounded-full bg-navy/5 px-3 py-1 text-[10px] font-semibold text-navy">
              {resource.category}
            </span>
          )}
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
          {isVideo ? (
            <Play size={14} />
          ) : (
            <FileText size={14} />
          )}
          {resource.resource_type}
        </div>

        {resource.file_url && (
          <button
            type="button"
            onClick={() => openProtectedResource(resource.id)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-xs font-semibold text-navy transition hover:opacity-90"
          >
            <FileText size={16} />
            Open Resource
            <ExternalLink size={14} />
          </button>
        )}

        {isVideo && (
          <a
            href={resource.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-xs font-semibold text-navy transition hover:opacity-90"
          >
            <Play size={16} />
            Watch Video
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    </article>
  );
}

function FormPolicyCard({ resource }) {
  const videoThumbnail = getYouTubeThumbnail(
    resource.youtube_url
  );

  const hasStoredThumbnail =
    typeof resource.thumbnail_url === "string" &&
    (
      /^https?:\/\//i.test(resource.thumbnail_url) ||
      (
        resource.thumbnail_url.startsWith("/") &&
        !resource.thumbnail_url.startsWith("//")
      )
    );

  const hasPreview = Boolean(
    videoThumbnail || hasStoredThumbnail
  );

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      {hasPreview && (
        <div className="overflow-hidden border-b border-slate-100 bg-slate-50">
          <ResourcePreview resource={resource} />
        </div>
      )}

      <div className="flex flex-col p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/10">
            <FileText size={20} className="text-gold" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2">
              {resource.resource_type && (
                <span className="rounded-full bg-navy/5 px-3 py-1 text-[10px] font-semibold text-navy">
                  {resource.resource_type}
                </span>
              )}

              {resource.grade && (
                <span className="rounded-full bg-gold/10 px-3 py-1 text-[10px] font-semibold text-navy">
                  {resource.grade}
                </span>
              )}
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

        {resource.file_url && (
          <button
            type="button"
            onClick={() => openProtectedResource(resource.id)}
            className="mt-5 inline-flex w-fit items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-xs font-semibold text-navy transition hover:opacity-90"
          >
            <FileText size={16} />
            Open Document
            <ExternalLink size={14} />
          </button>
        )}

        {resource.youtube_url && !resource.file_url && (
          <a
            href={resource.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex w-fit items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-xs font-semibold text-navy transition hover:opacity-90"
          >
            <Play size={16} />
            Watch Video
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    </article>
  );
}

export default function LearningResourcesView({ role }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("All Resources");

  const [selectedGrade, setSelectedGrade] =
    useState("All Grades");

  useEffect(() => {
    let cancelled = false;

    async function loadResources() {
      try {
        setLoading(true);
        setError("");

        const auth = getAuth(app);
        const user = auth.currentUser;

        if (!user) {
          throw new Error(
            "You must be logged in to view learning resources."
          );
        }

        const token = await user.getIdToken();

        const response = await fetch("/api/resources", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to load learning resources."
          );
        }

        if (!cancelled) {
          setResources(data.resources || []);
        }
      } catch (error) {
        console.error("Resources loading error:", error);

        if (!cancelled) {
          setError(
            error.message ||
              "Failed to load learning resources."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadResources();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const isFormOrPolicy =
        resource.resource_type === "Form" ||
        resource.resource_type === "Policy";

      if (isFormOrPolicy) return false;

      const matchesCategory =
        selectedCategory === "All Resources" ||
        resource.category === selectedCategory;

      const matchesGrade =
        selectedGrade === "All Grades" ||
        resource.grade === selectedGrade ||
        resource.grade === "General";

      return matchesCategory && matchesGrade;
    });
  }, [resources, selectedCategory, selectedGrade]);

  const formPolicyResources = useMemo(() => {
    return resources.filter((resource) => {
      const isFormOrPolicy =
        resource.resource_type === "Form" ||
        resource.resource_type === "Policy";

      if (!isFormOrPolicy) return false;

      const matchesGrade =
        selectedGrade === "All Grades" ||
        resource.grade === selectedGrade ||
        resource.grade === "General";

      return matchesGrade;
    });
  }, [resources, selectedGrade]);

  return (
    <ShellPage
      sidebar={(sidebarProps) =>
        role === "parent" ? (
          <ParentSidebar {...sidebarProps} />
        ) : (
          <StaffSidebar {...sidebarProps} />
        )
      }
      spaceY=""
    >
      {/* Header */}
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <BookOpen size={21} className="text-gold" />

          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            {role === "parent" ? "Parent Portal" : "Staff Portal"}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-navy md:text-3xl">
          Learning Resources
        </h1>

        <p className="mt-1 text-sm text-text-muted">
          Access educational materials, videos, guides and school
          documents for your learner.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Filter size={17} className="text-gold" />

          <h2 className="text-sm font-bold text-navy">
            Filter Resources
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-navy">
              Category
            </label>

            <select
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(e.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-text outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            >
              {RESOURCE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-navy">
              Grade
            </label>

            <select
              value={selectedGrade}
              onChange={(e) =>
                setSelectedGrade(e.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-text outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            >
              {GRADES.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Resource lists */}
      {loading ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm">
          <LoadingState label="Loading learning resources..." />
        </div>
      ) : (
        <>
          {/* Learning Materials */}
          <section>
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-gold" />

                <h2 className="text-lg font-bold text-navy">
                  Learning Materials
                </h2>
              </div>

              <p className="mt-1 text-sm text-text-muted">
                Educational resources relevant to your selected grade
                and category.
              </p>
            </div>

            {filteredResources.length === 0 ? (
              <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-navy">
                  <BookOpen size={22} className="text-gold" />
                </div>

                <h2 className="mt-4 text-base font-bold text-navy">
                  No resources found
                </h2>

                <p className="mx-auto mt-1 max-w-md text-sm text-text-muted">
                  There are currently no published learning resources
                  matching your selected filters.
                </p>
              </div>
            ) : (
              <div className="grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredResources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Forms & Policies */}
          <section className="mt-12">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <School size={18} className="text-gold" />

                <h2 className="text-lg font-bold text-navy">
                  Forms & Policies
                </h2>
              </div>

              <p className="mt-1 text-sm text-text-muted">
                Official school forms, policies and documents available
                to parents.
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
                  School forms, policies and official documents will
                  appear here when available.
                </p>
              </div>
            ) : (
              <div className="grid items-start gap-6 md:grid-cols-2">
                {formPolicyResources.map((resource) => (
                  <FormPolicyCard
                    key={resource.id}
                    resource={resource}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </ShellPage>
  );
}
