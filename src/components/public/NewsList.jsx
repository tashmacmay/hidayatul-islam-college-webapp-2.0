"use client";

import Link from "next/link";
import FilterButtons from "@/components/public/FilterButtons";
import { EmptyState } from "@/components/ui/primitives";
import LoadingState from "@/components/ui/LoadingState";
import usePublicList from "@/hooks/usePublicList";

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
  const { items, visible, filters, active, setActive, loading, error, isEmpty, hasFilters } =
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
        <ul className="columns-1 gap-6 sm:columns-2">
          {visible.map((item) => (
            <li
              key={item.id}
              className="mb-6 break-inside-avoid rounded-xl bg-white p-6 shadow-sm"
            >
              {item.slug ? (
                <Link href={`/news/${item.slug}`} className="block">
                  <NewsCardContent item={item} showReadMore />
                </Link>
              ) : (
                <NewsCardContent item={item} />
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function NewsCardContent({ item, showReadMore = false }) {
  return (
    <>
      {item.featured_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.featured_image_url}
          alt={item.title}
          className="mb-4 h-48 w-full rounded-lg bg-off-white object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gold">
        {item.category}
      </p>
      <h3 className="mb-2 text-lg font-semibold text-navy">{item.title}</h3>
      <p className="mb-3 text-xs text-text-muted">{formatDate(item.published_at)}</p>
      <p className="line-clamp-2 min-h-[2.5rem] text-sm text-text-muted">
        {item.excerpt || (item.content ?? "").slice(0, 160)}
      </p>
      {showReadMore && (
        <p className="mt-3 text-xs font-semibold text-gold">Read more →</p>
      )}
    </>
  );
}