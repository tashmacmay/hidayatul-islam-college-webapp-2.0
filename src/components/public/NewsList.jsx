"use client";

import { useEffect, useMemo, useState } from "react";
import FilterButtons from "@/components/public/FilterButtons";
import { EmptyState } from "@/components/ui/primitives";

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
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [active, setActive] = useState("All");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/news");
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        const data = await res.json();
        if (!cancelled) setItems(data.news ?? []);
      } catch (err) {
        console.error("NEWS LIST FETCH ERROR:", err);
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Derive filter list from data. "All" always first, then categories A→Z.
  const filters = useMemo(() => {
    const categories = new Set();
    for (const item of items) {
      if (item.category) categories.add(item.category);
    }
    return ["All", ...[...categories].sort()];
  }, [items]);

  const visible = useMemo(
    () =>
      active === "All"
        ? items
        : items.filter((n) => n.category === active),
    [items, active]
  );

  return (
    <>
      {!loading && !error && filters.length > 1 && (
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

      {loading && (
        <div className="flex justify-center py-10">
          <p className="text-sm text-text-muted">Loading news…</p>
        </div>
      )}

      {error && !loading && (
        <div className="flex justify-center py-10">
          <p className="text-sm text-text-muted">
            Unable to load news right now. Please try again later.
          </p>
        </div>
      )}

      {!loading && !error && visible.length === 0 && (
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
              <h3 className="mb-2 text-lg font-semibold text-navy">
                {item.title}
              </h3>
              <p className="mb-3 text-xs text-text-muted">
                {formatDate(item.published_at)}
              </p>
              <p className="line-clamp-2 min-h-[2.5rem] text-sm text-text-muted">
                {item.excerpt || (item.content ?? "").slice(0, 160)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}