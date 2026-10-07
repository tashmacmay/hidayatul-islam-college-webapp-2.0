"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const filters = [
  "All",
  "News",
  "Events",
  "Achievements",
  "Islamic Life",
  "Community",
  "Announcements",
];

export default function News() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [newsArticles, setNewsArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/news", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load news.");
        }

        setNewsArticles(data.news || []);
      } catch (err) {
        console.error("Failed to load public news:", err);
        setError(err.message || "Failed to load news.");
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  const filteredNews =
    activeFilter === "All"
      ? newsArticles
      : newsArticles.filter(
          (article) =>
            article.category?.toLowerCase() === activeFilter.toLowerCase()
        );


  return (
    <>
      {/* Hero Section */}

      <section className="relative flex min-h-[320px] items-end overflow-hidden bg-navy md:min-h-[340px]">
        <img
          src="/images/HIC-image2.jpg"
          alt="News and announcements"
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
              News & Announcements
            </span>
          </p>

          <div className="mb-5 h-[3px] w-[60px] rounded-full bg-gold" />

          <h1 className="mb-3 font-serif text-2xl font-bold leading-tight text-white md:text-[28px]">
            News & <span className="text-gold">Announcements</span>
          </h1>

          <p className="max-w-[560px] text-sm leading-7 text-blue-100">
            Stay up to date with everything happening at Hidayatul Islam College — school news, announcements, events, achievements, and Islamic life.
          </p>
        </div>
      </section>

      {/* News Section */}

      <section className="bg-off-white px-6 py-20 md:px-10 md:py-24">
        <div className="mx-auto max-w-6xl">

          {/* Filters */}

          <div className="mb-10 flex flex-wrap items-center gap-3">
            <span className="mr-2 text-xs font-semibold text-navy">
              Filter:
            </span>

            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  activeFilter === filter
                    ? "border-navy bg-navy text-gold-light"
                    : "border-gray-200 bg-white text-navy hover:border-gold hover:bg-gold/10"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Loading */}

          {loading && (
            <div className="mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-navy" />

              <p className="mt-4 text-sm text-gray-500">
                Loading news and announcements...
              </p>
            </div>
          )}

          {/* Error */}

          {!loading && error && (
            <div className="mx-auto max-w-4xl rounded-2xl border border-red-200 bg-red-50 px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
                !
              </div>

              <h2 className="mt-5 text-lg font-semibold text-red-700">
                Unable to load news
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* No Results */}

          {!loading && !error && filteredNews.length === 0 && (
            <div className="mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm md:px-10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-navy text-xl text-gold">
                +
              </div>

              <h2 className="mt-5 text-lg font-semibold text-navy">
                {activeFilter === "All"
                  ? "No news or announcements yet"
                  : `No ${activeFilter.toLowerCase()} available`}
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
                {activeFilter === "All"
                  ? "School news, announcements, events, achievements and Islamic updates will appear here."
                  : "There are currently no published items in this category."}
              </p>
            </div>
          )}

          {/* News Grid */}

          {!loading && !error && filteredNews.length > 0 && (
            <div className="grid gap-7 md:grid-cols-2">
              {filteredNews.map((article) => (
                <article
                  key={article.id}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  {/* Featured Image */}

                  {article.featured_image_url ? (
                    <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                      <img
                        src={article.featured_image_url}
                        alt={article.title || "Hidayatul Islam College news"}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[16/9] items-center justify-center bg-navy">
                      <div className="text-center">
                        <div className="text-3xl text-gold">+</div>

                        <p className="mt-2 text-xs font-semibold uppercase tracking-[2px] text-blue-100">
                          Hidayatul Islam College
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Article Content */}

                  <div className="p-6">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-navy">
                        {article.category || "News"}
                      </span>

                      {article.published_at && (
                        <span className="text-[10px] text-gray-400">
                          {new Date(
                            article.published_at
                          ).toLocaleDateString("en-ZA", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>

                    <h2 className="mt-4 font-serif text-xl font-bold leading-tight text-navy">
                      {article.title}
                    </h2>

                    {article.excerpt && (
                      <p className="mt-3 text-sm leading-6 text-gray-600">
                        {article.excerpt}
                      </p>
                    )}

                    <Link
                      href={`/news/${article.slug}`}
                      className="mt-5 inline-flex items-center text-xs font-semibold text-navy transition hover:text-gold"
                    >
                      Read more
                      <span className="ml-2">→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}

      <section className="bg-navy px-6 py-16 text-white md:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-2xl font-bold leading-tight">
            Stay in the <span className="text-gold">loop</span>
          </h2>

          <p className="mt-3 text-sm leading-6 text-blue-100">
            Get school news and announcements sent directly to your inbox
            each term.
          </p>
        </div>
      </section>
    </>
  );
}