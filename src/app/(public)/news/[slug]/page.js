"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, AlertCircle } from "lucide-react";

export default function NewsArticlePage() {
  const params = useParams();
  const slug = params?.slug;

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;

    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/news/${encodeURIComponent(slug)}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("News article not found.");
          }

          throw new Error("Failed to load the news article.");
        }

        const data = await response.json();
        setArticle(data);
      } catch (error) {
        console.error("Failed to fetch news article:", error);
        setError(error.message || "Failed to load the news article.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <p className="text-[#5a6a82]">Loading article...</p>
        </div>
      </main>
    );
  }

  if (error || !article) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />

          <h1 className="text-2xl font-bold text-[#0d2260]">
            Article not found
          </h1>

          <p className="mt-2 text-[#5a6a82]">
            {error || "This news article could not be found."}
          </p>

          <Link
            href="/news"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0d2260] px-5 py-3 text-sm font-semibold text-white hover:bg-[#162f7a]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to News
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <article className="mx-auto max-w-4xl px-6 py-12">
        {/* Back button */}
        <Link
          href="/news"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#0d2260] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to News
        </Link>

        {/* Category */}
        {article.category && (
          <div className="mb-4">
            <span className="inline-block rounded-full bg-[#f5e9b8] px-3 py-1 text-sm font-semibold text-[#0d2260]">
              {article.category}
            </span>
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl font-bold leading-tight text-[#0d2260] md:text-5xl">
          {article.title}
        </h1>

        {/* Published date */}
        {article.published_at && (
          <div className="mt-4 flex items-center gap-2 text-sm text-[#5a6a82]">
            <Calendar className="h-4 w-4" />

            <span>
              {new Date(article.published_at).toLocaleDateString("en-ZA", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        )}

        {/* Featured image */}
        {article.featured_image_url && (
          <div className="mt-8 overflow-hidden rounded-2xl">
            <img
              src={article.featured_image_url}
              alt={article.title}
              className="h-auto w-full object-cover"
            />
          </div>
        )}

        {/* Excerpt */}
        {article.excerpt && (
          <p className="mt-8 text-xl leading-relaxed text-[#5a6a82]">
            {article.excerpt}
          </p>
        )}

        {/* Article content */}
        <div className="mt-8 whitespace-pre-wrap text-base leading-8 text-gray-700">
          {article.content}
        </div>
      </article>
    </main>
  );
}