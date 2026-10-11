"use client";

import FilterButtons from "@/components/public/FilterButtons";
import { EmptyState } from "@/components/ui/primitives";
import LoadingState from "@/components/ui/LoadingState";
import usePublicList from "@/hooks/usePublicList";

export default function GalleryGrid() {
  const { visible, filters, active, setActive, loading, error, isEmpty, hasFilters } =
    usePublicList("/api/gallery", "gallery");

  return (
    <>
      {!loading && !error && hasFilters && (
        <div className="mb-10 flex flex-wrap justify-center gap-3">
          <FilterButtons
            items={filters}
            value={active}
            onChange={setActive}
            className="flex flex-wrap justify-center gap-3"
          />
        </div>
      )}

      {loading && <LoadingState label="Loading gallery..." />}

      {error && !loading && (
        <div className="flex justify-center py-10">
          <p className="text-sm text-text-muted">
            Unable to load gallery right now. Please try again later.
          </p>
        </div>
      )}

      {isEmpty && (
        <EmptyState
          title="No gallery photos yet"
          description="Photos from school events, learning activities, sport, outings and community moments will appear here once they are uploaded by the school."
          variant="gallery"
          titleElement="h3"
        />
      )}

      {!loading && !error && visible.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => (
            <figure key={item.id} className="overflow-hidden rounded-xl bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image_url} alt={item.alt_text || item.title || ""} className="h-64 w-full object-cover" />
              <figcaption className="p-4 text-sm text-text-muted">
                {item.caption || item.alt_text || item.title}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </>
  );
}
