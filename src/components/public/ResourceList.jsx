"use client";

import FilterButtons from "@/components/public/FilterButtons";
import { EmptyState } from "@/components/ui/primitives";
import LoadingState from "@/components/ui/LoadingState";
import usePublicList from "@/hooks/usePublicList";

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
          <p className="text-sm text-text-muted">
            Unable to load resources right now. Please try again later.
          </p>
        </div>
      )}

      {isEmpty && (
        <EmptyState
          title="No resources uploaded yet"
          description="Learning materials, worksheets, guides and school documents will appear here once they are uploaded by the school."
        />
      )}

      {!loading && !error && gradeVisible.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {gradeVisible.map((resource) => {
            const href = resource.file_url || resource.youtube_url;
            const content = (
              <>
                {resource.thumbnail_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resource.thumbnail_url}
                    alt={resource.title}
                    className="h-48 w-full rounded-t-xl object-cover"
                  />
                )}
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gold">
                    {resource.category}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-navy">{resource.title}</h3>
                  <p className="mt-2 text-sm text-text-muted">
                    {resource.caption || resource.description}
                  </p>
                </div>
              </>
            );

            return (
              <div
                key={resource.id}
                className="overflow-hidden rounded-xl border border-transparent bg-white shadow-sm transition hover:border-gold"
              >
                {href ? (
                  <a href={href} target="_blank" rel="noreferrer" className="block">
                    {content}
                  </a>
                ) : content}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
