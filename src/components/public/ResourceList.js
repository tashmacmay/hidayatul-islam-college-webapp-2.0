"use client";

import { useState } from "react";
import { Play, FileText } from "lucide-react";
import FilterButtons from "@/components/public/FilterButtons";
import { EmptyState } from "@/components/ui/primitives";
import LoadingState from "@/components/ui/LoadingState";
import usePublicList from "@/hooks/usePublicList";
import { Card } from "@/components/ui/card";
import { FileBadge } from "@/components/ui/FileBadge";

function getYouTubeVideoId(url) {
  if (!url || typeof url !== "string") return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    let id = null;
    if (host === "youtu.be") {
      id = parsed.pathname.split("/").filter(Boolean)[0];
    } else if (["youtube.com", "m.youtube.com", "music.youtube.com"].includes(host)) {
      if (parsed.searchParams.has("v")) {
        id = parsed.searchParams.get("v");
      } else {
        const parts = parsed.pathname.split("/").filter(Boolean);
        if (["embed", "shorts", "live"].includes(parts[0])) {
          id = parts[1];
        }
      }
    }
    return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export default function ResourceList({ selectedGrade = "All Grades" }) {
  const { visible, filters, active, setActive, loading, error, isEmpty, hasFilters } =
    usePublicList("/api/resources", "resources");

  const gradeVisible = visible.filter(
    (resource) =>
      selectedGrade === "All Grades" ||
      resource.grade === selectedGrade ||
      resource.grade === "All Grades"
  );

  return (
    <>
      {!loading && !error && hasFilters && (
        <div className="mb-10 flex flex-wrap items-center gap-3">
          <span className="mr-2 text-xs font-semibold text-navy">Filter:</span>
          <FilterButtons
            items={filters}
            value={active}
            onChange={setActive}
            className="flex flex-wrap items-center gap-3"
          />
        </div>
      )}

      {loading && <LoadingState label="Loading resources..." />}
      {error && !loading && (
        <div className="flex justify-center py-10">
          <p className="text-sm text-text-muted">Unable to load resources right now. Please try again later.</p>
        </div>
      )}

      {isEmpty && (
        <EmptyState
          title="No resources uploaded yet"
          description="Learning materials, worksheets, guides and school documents will appear here once they are uploaded by the school."
        />
      )}

      {!loading && !error && !isEmpty && gradeVisible.length === 0 && (
        <EmptyState
          title="No resources available for this grade"
          description="No resources are currently available for the selected grade."
        />
      )}

      {!loading && !error && gradeVisible.length > 0 && (
        // Added items-start here to stop the stretching
        <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2">
          {gradeVisible.map((resource) => {
            const videoId = getYouTubeVideoId(resource.youtube_url);
            const href = videoId ? resource.youtube_url : resource.file_url || resource.youtube_url;

            let mediaContent;
            if (videoId) {
              mediaContent = (
                <>
                  <img
                    src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                    alt={resource.title}
                    className="h-full w-full object-cover object-top transition duration-300 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 shadow-lg">
                      <Play size={25} className="ml-1 text-red-600" fill="currentColor" />
                    </span>
                  </div>
                </>
              );
            } else if (resource.thumbnail_url) {
              mediaContent = (
                <img
                  src={resource.thumbnail_url}
                  alt={resource.title}
                  className="h-full w-full object-cover object-top transition duration-300 group-hover:scale-[1.02]"
                />
              );
            } else {
              mediaContent = <FileBadge title={resource.title} />;
            }

            return (
              <Card key={resource.id} href={href} media={mediaContent}>
                <p className="text-xs font-semibold uppercase tracking-wide text-gold">
                  {resource.category}
                </p>
                <h3 className="mt-2 line-clamp-2 text-lg font-semibold text-navy">
                  {resource.title}
                </h3>
                {/* Removed flex-1 from this paragraph so it doesn't stretch the card */}
                <p className="mt-2 line-clamp-3 text-sm text-text-muted">
                  {resource.caption || resource.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-navy">
                  {videoId ? (
                    <><Play size={16} /> Watch Video</>
                  ) : (
                    <><FileText size={16} /> Open Resource</>
                  )}
                </span>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}