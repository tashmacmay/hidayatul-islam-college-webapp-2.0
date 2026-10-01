"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  FileText,
  Play,
  BookMarked,
  School,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

const resourceCategories = [
  "All resources",
  "Literacy & Language",
  "Mathematics",
  "Islamic Studies",
  "Life Skills",
  "Parent Guides",
  "School Documents",
];

const grades = [
  "All grades",
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

function ResourceCard({ resource }) {
  const embedUrl = getYouTubeEmbedUrl(resource.youtube_url);

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
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
        <div className="flex aspect-video items-center justify-center bg-navy">
          <BookOpen className="h-10 w-10 text-gold" />
        </div>
      )}

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

        <p className="mt-2 text-sm font-medium text-text-muted">
          {resource.caption}
        </p>

        {resource.description && (
          <p className="mt-3 text-sm leading-6 text-gray-500">
            {resource.description}
          </p>
        )}

        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-gold">
          {embedUrl ? (
            <Play className="h-3.5 w-3.5" />
          ) : (
            <FileText className="h-3.5 w-3.5" />
          )}

          {resource.resource_type}
        </div>

        {resource.file_url && (
          <a
            href={resource.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-xs font-semibold text-navy transition hover:opacity-90"
          >
            <FileText className="h-4 w-4" />
            Open Resource
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </article>
  );
}

function FormPolicyCard({ resource }) {
  return (
    <article className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
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
          <FileText className="h-12 w-12 text-slate-300" />
        </div>
      )}

      {/* Resource information */}
      <div className="mt-5 flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/10">
          <FileText className="h-5 w-5 text-gold" />
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

          <p className="mt-2 text-sm font-medium text-text-muted">
            {resource.caption}
          </p>

          {resource.description && (
            <p className="mt-3 text-sm leading-6 text-gray-500">
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
          className="mt-5 inline-flex w-fit items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-xs font-semibold text-navy transition hover:opacity-90"
        >
          <FileText className="h-4 w-4" />
          Open Document
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}

      {/* YouTube resource */}
      {resource.youtube_url && !resource.file_url && (
        <a
          href={resource.youtube_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex w-fit items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-xs font-semibold text-navy transition hover:opacity-90"
        >
          <Play className="h-4 w-4" />
          Open Resource
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </article>
  );
}

export default function Resources() {
  const [selectedCategory, setSelectedCategory] =
    useState("All resources");

  const [selectedGrade, setSelectedGrade] =
    useState("All grades");

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchResources() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/resources");

        if (!response.ok) {
          throw new Error("Failed to fetch resources.");
        }

        const data = await response.json();

        setResources(data.resources || []);
      } catch (err) {
        console.error(
          "Error fetching public resources:",
          err
        );

        setError("Unable to load learning resources.");
      } finally {
        setLoading(false);
      }
    }

    fetchResources();
  }, []);

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const isFormOrPolicy =
        resource.resource_type === "Form" ||
        resource.resource_type === "Policy";

      if (isFormOrPolicy) {
        return false;
      }

      const matchesCategory =
        selectedCategory === "All resources" ||
        resource.category === selectedCategory;

      const matchesGrade =
        selectedGrade === "All grades" ||
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

      if (!isFormOrPolicy) {
        return false;
      }

      const matchesGrade =
        selectedGrade === "All grades" ||
        resource.grade === selectedGrade ||
        resource.grade === "General";

      return matchesGrade;
    });
  }, [resources, selectedGrade]);

  return (
    <>
      {/* Hero Section */}
      <section className="relative flex min-h-[320px] items-end overflow-hidden bg-navy md:min-h-[340px]">
        <img
          src="/images/HIC-image2.jpg"
          alt="Learning Resources"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/80 to-navy/45" />

        <div className="absolute inset-0 opacity-20 [background-image:repeating-linear-gradient(135deg,transparent,transparent_12px,rgba(255,255,255,0.08)_12px,rgba(255,255,255,0.08)_13px)]" />

        <div className="relative z-10 w-full px-6 pb-10 md:px-16 md:pb-[52px]">
          <p className="mb-3.5 flex items-center gap-2 text-[9px] text-blue-200 md:text-[10px]">
            <Link
              href="/"
              className="text-gold-light transition-colors hover:text-gold"
            >
              Home
            </Link>

            <span className="text-navy-dark">›</span>

            <span className="text-blue-200/75">
              Resources
            </span>
          </p>

          <div className="mb-5 h-[3px] w-[60px] rounded-full bg-gold" />

          <h1 className="mb-3 font-serif text-2xl font-bold leading-tight text-white md:text-[28px]">
            Learning <span className="text-gold">Resources</span>
          </h1>

          <p className="max-w-[560px] text-sm leading-7 text-blue-100">
            Free educational materials for HIC learners, parents,
            and the wider Kensington community — worksheets, videos,
            guidance, and more.
          </p>
        </div>
      </section>

      {/* Resources Content */}
      <section className="bg-off-white px-6 py-20 md:px-10 md:py-24">
        <div className="mx-auto max-w-6xl">

          {/* Grade Resource Packs */}
          <div className="mt-8 rounded-2xl bg-navy p-8 text-white shadow-lg">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[3px] text-gold">
                  Start Here
                </p>

                <h2 className="mt-3 text-lg font-semibold">
                  Grade-Specific{" "}
                  <span className="text-gold">
                    Resources
                  </span>
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">
                  Browse learning materials by grade and find
                  resources relevant to your learner.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {grades.map((grade) => (
                    <button
                      key={grade}
                      onClick={() => setSelectedGrade(grade)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                        selectedGrade === grade
                          ? "bg-gold text-navy"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              </div>

              {/* Available Resources */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[2px] text-gold">
                  Available Resources
                </p>

                <div className="mt-5 space-y-4">
                  <div className="flex items-center gap-3 text-sm text-blue-100">
                    <FileText className="h-4 w-4 text-gold" />
                    Worksheets and activities
                  </div>

                  <div className="flex items-center gap-3 text-sm text-blue-100">
                    <Play className="h-4 w-4 text-gold" />
                    Video lessons
                  </div>

                  <div className="flex items-center gap-3 text-sm text-blue-100">
                    <BookOpen className="h-4 w-4 text-gold" />
                    Learning materials
                  </div>

                  <div className="flex items-center gap-3 text-sm text-blue-100">
                    <BookMarked className="h-4 w-4 text-gold" />
                    Reading lists
                  </div>

                  <div className="flex items-center gap-3 text-sm text-blue-100">
                    <School className="h-4 w-4 text-gold" />
                    School documents
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resource Filters */}
          <div className="mt-8 flex flex-wrap gap-2">
            {resourceCategories.map((category) => (
              <button
                key={category}
                onClick={() =>
                  setSelectedCategory(category)
                }
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  selectedCategory === category
                    ? "border-navy bg-navy text-gold-light"
                    : "border-gray-200 bg-white text-navy hover:border-gold hover:bg-gold/10"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Resource Grid */}
          <div className="mt-8">
            {loading ? (
              <div className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-navy" />

                <p className="mt-4 text-sm text-gray-500">
                  Loading learning resources...
                </p>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-white px-6 py-14 text-center shadow-sm">
                <h2 className="text-lg font-bold text-navy">
                  Unable to load resources
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
                  {error}
                </p>
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm md:px-10">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-navy text-gold">
                  <BookOpen className="h-6 w-6" />
                </div>

                <h2 className="mt-5 text-xl font-bold text-navy">
                  No resources found
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
                  There are currently no published resources
                  matching the selected grade and topic.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredResources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Forms & Policies */}
          <div className="mt-16">
            <div>
              <h2 className="mt-2 text-lg font-semibold text-navy">
                Forms &{" "}
                <span className="text-gold">
                  Policies
                </span>
              </h2>

              <div className="mt-3 h-1 w-12 rounded-full bg-gold" />

              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
                Official school forms, policies and documents
                are available below.
              </p>
            </div>

            {formPolicyResources.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-white px-5 py-8 text-center">
                <p className="text-sm font-semibold text-navy">
                  No forms or policies have been uploaded yet.
                </p>

                <p className="mt-2 text-xs leading-5 text-gray-500">
                  School forms, policies and official documents
                  will appear here when available.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {formPolicyResources.map((resource) => (
                  <FormPolicyCard
                    key={resource.id}
                    resource={resource}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Parent Portal CTA */}
      <section className="bg-navy px-6 py-16 text-center text-white md:px-10">
        <div className="mx-auto max-w-3xl">
          <p className="text-[10px] font-semibold uppercase tracking-[3px] text-gold">
            Parent Portal
          </p>

          <h2 className="mt-3 font-serif text-xl font-bold leading-tight">
            More resources in the{" "}
            <span className="text-gold">
              Parent Portal
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-blue-100">
            Authorised families may access additional resources
            and information through the secure parent portal.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/login"
              className="rounded-lg bg-gold px-6 py-3 text-xs font-semibold text-navy transition hover:opacity-90"
            >
              Portal Login
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}