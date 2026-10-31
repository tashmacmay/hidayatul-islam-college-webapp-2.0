"use client";

import FilterButtons from "@/components/public/FilterButtons";
import { EmptyState } from "@/components/ui/primitives";
import LoadingState from "@/components/ui/LoadingState";
import usePublicList from "@/hooks/usePublicList";
import { Card } from "@/components/ui/card";

function formatDate(iso) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-ZA", {
    timeZone: "Africa/Johannesburg",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export default function NewsList() {
  const { visible, filters, active, setActive, loading, error, isEmpty, hasFilters } =
    usePublicList("/api/news", "news");

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

      {loading && <LoadingState label="Loading news..." />}

      {error && !loading && (
        <div className="flex justify-center py-10">
          <p className="text-sm text-text-muted">
            Unable to load news right now. Please try again later.
          </p>
        </div>
      )}

      {isEmpty && (
        <div className="mx-auto max-w-4xl">
          <EmptyState
            icon={<span className="text-2xl">+</span>}
            title="No news or announcements yet"
            description="School news, events, achievements and important notices will appear here."
          />
        </div>
      )}

      {!loading && !error && visible.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => (
            <Card
              key={item.id}
              href={item.slug ? `/news/${item.slug}` : undefined}
              media={
                item.featured_image_url && (
                  <img
                    src={item.featured_image_url}
                    alt={item.title}
                    className="h-full w-full object-cover object-top transition duration-300 group-hover:scale-[1.02]"
                  />
                )
              }
            >
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gold">
                {item.category}
              </p>
              <h3 className="mb-2 text-lg font-semibold text-navy">{item.title}</h3>
              <p className="mb-3 text-xs text-text-muted">{formatDate(item.published_at)}</p>
              <p className="line-clamp-2 text-sm text-text-muted flex-1">
                {item.excerpt || (item.content ?? "").slice(0, 160)}
              </p>
              {item.slug && (
                <p className="mt-4 text-xs font-semibold text-gold">Read more →</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}