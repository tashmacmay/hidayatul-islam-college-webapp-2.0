"use client";

import { useState, useEffect } from "react";
import { Calendar, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import FilterButtons from "@/components/public/FilterButtons";
import LoadingState from "@/components/ui/LoadingState";
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

export default function NewsView() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Filters
  const [activeFilter, setActiveFilter] = useState("All");
  const [filters, setFilters] = useState(["All"]);

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        const res = await fetch("/api/news");
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "Failed to load news");

        const newsItems = Array.isArray(data) ? data : data.news || [];
        setArticles(newsItems);

        // Extract unique categories for filters
        const categories = new Set();
        newsItems.forEach((item) => {
          if (item.category) categories.add(item.category);
        });
        setFilters(["All", ...Array.from(categories).sort()]);

      } catch (err) {
        setError(err.message || "Unable to load news.");
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  const visibleArticles = activeFilter === "All" 
    ? articles 
    : articles.filter((a) => a.category === activeFilter);

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <span className="mr-2 text-xs font-semibold text-navy">Filter:</span>
        <FilterButtons
          items={filters}
          value={activeFilter}
          onChange={setActiveFilter}
          className="flex flex-wrap items-center gap-2"
        />
      </div>

      {loading && <LoadingState label="Loading news..." />}
      
      {error && (
        <div className="py-10 text-center text-sm text-red-600">{error}</div>
      )}

      {!loading && !error && visibleArticles.length === 0 && (
        <EmptyState 
          title="No news found" 
          description="There are currently no news articles or announcements to display." 
        />
      )}

      {!loading && !error && visibleArticles.length > 0 && (
        <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleArticles.map((item) => (
            <Card
              key={item.id}
              onClick={() => setSelectedArticle(item)}
              className="cursor-pointer transition hover:-translate-y-1 hover:border-gold hover:shadow-md"
              media={
                item.featured_image_url ? (
                  <img
                    src={item.featured_image_url}
                    alt={item.title}
                    className="h-full w-full object-cover object-top transition duration-300"
                  />
                ) : undefined
              }
            >
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gold">
                {item.category}
              </p>
              <h3 className="mb-2 text-lg font-semibold text-navy">{item.title}</h3>
              <p className="mb-3 text-xs text-text-muted">{formatDate(item.published_at)}</p>
              <p className="line-clamp-2 text-sm text-text-muted">
                {item.excerpt || (item.content ?? "").slice(0, 100)}...
              </p>
              <p className="mt-4 text-xs font-semibold text-gold">Click to read →</p>
            </Card>
          ))}
        </div>
      )}

      {/* MODAL */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 bg-navy text-white shrink-0">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gold">
                  {selectedArticle.category}
                </p>
                <h2 className="mt-1 text-xl font-bold">{selectedArticle.title}</h2>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedArticle(null)} 
                className="rounded-lg p-2 text-gray-300 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="overflow-y-auto p-6">
              <p className="text-xs text-gray-500 mb-4 flex items-center gap-2">
                <Calendar size={14} /> Published {formatDate(selectedArticle.published_at)}
              </p>
              
              {selectedArticle.preview_url && (
                <img 
                  src={selectedArticle.preview_url} 
                  alt="Preview" 
                  className="mb-6 max-h-96 w-full object-contain rounded-xl bg-gray-50" 
                />
              )}
              
              <div className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
                {selectedArticle.content || selectedArticle.excerpt}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}