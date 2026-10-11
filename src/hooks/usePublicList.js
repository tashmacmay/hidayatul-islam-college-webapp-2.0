"use client";

import { useEffect, useMemo, useState } from "react";

export default function usePublicList(endpoint, dataKey) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [active, setActive] = useState("All");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(endpoint);
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        const data = await res.json();
        if (!cancelled) {
          setItems(Array.isArray(data[dataKey]) ? data[dataKey] : []);
        }
      } catch (err) {
        console.error("PUBLIC LIST FETCH ERROR:", err);
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [endpoint, dataKey]);

  const filters = useMemo(() => {
    const categories = new Set();
    for (const item of items) {
      if (item.category) categories.add(item.category);
    }
    return ["All", ...[...categories].sort()];
  }, [items]);

  const visible = useMemo(
    () => (active === "All" ? items : items.filter((item) => item.category === active)),
    [items, active]
  );

  const isEmpty = !loading && !error && items.length === 0;
  const hasFilters = filters.length > 1;

  return {
    items,
    visible,
    filters,
    active,
    setActive,
    loading,
    error,
    isEmpty,
    hasFilters,
  };
}
