"use client";

import { useState, useEffect } from "react";
import { Calendar, X, FileText } from "lucide-react";
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

  // THE FIX: Build the full URL for raw S3 keys
  const getMediaUrl = (article) => {
    const url = article.preview_url || article.featured_image_url;
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("/")) return url;
    return `/api/storage/${url}`;
  };

  const isPdf = (url) => url?.toLowerCase().includes(".pdf");

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
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
            <div 
              key={item.id} 
              onClick={() => setSelectedArticle(item)} 
              className="cursor-pointer transition hover:-translate-y-1"
            >
              <Card
                className="h-full"
                media={
                  getMediaUrl(item) ? (
                    <img
                      src={getMediaUrl(item)}
                      alt={item.title}
                      className="h-full w-full object-cover object-top"
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
            </div>
          ))}
        </div>
      )}

      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
            
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
            
            <div className="overflow-y-auto flex-1">
              {getMediaUrl(selectedArticle) && (
                isPdf(getMediaUrl(selectedArticle)) ? (
                  <div className="w-full bg-navy p-12 text-center border-b border-gray-200">
                    <FileText size={64} className="mx-auto text-gold mb-4" />
                    <span className="block text-xl font-bold text-white mb-2">View Document</span>
                    <a 
                      href={getMediaUrl(selectedArticle)} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="inline-block text-sm font-medium text-blue-200 underline hover:text-white"
                    >
                      Opens PDF in new tab
                    </a>
                  </div>
                ) : (
                  <div className="w-full bg-gray-50 border-b border-gray-200">
                    <img 
                      src={getMediaUrl(selectedArticle)} 
                      alt="Preview" 
                      className="w-full h-auto block" 
                    />
                  </div>
                )
              )}

              <div className="p-6">
                <p className="text-xs text-gray-500 mb-4 flex items-center gap-2">
                  <Calendar size={14} /> Published {formatDate(selectedArticle.published_at)}
                </p>
                
                <div className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
                  {selectedArticle.content || selectedArticle.excerpt}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}