"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  AlertCircle,
  Newspaper,
} from "lucide-react";

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
        setArticle(null);

        const response = await fetch(
          `/api/news/${encodeURIComponent(slug)}`
        );

        const data = await response.json();

        console.log("ARTICLE PAGE RESPONSE:", data);

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load the news article."
          );
        }

        // The API returns:
        // { news: { ...article } }
        setArticle(data.news);
      } catch (error) {
        console.error("Failed to fetch news article:", error);

        setError(
          error.message || "Failed to load the news article."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8f9fc]">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#dbe1ec] border-t-[#0d2260]" />

          <p className="text-sm text-[#5a6a82]">
            Loading article...
          </p>
        </div>
      </main>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error || !article) {
    return (
      <main className="min-h-screen bg-[#f8f9fc]">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>

          <h1 className="text-3xl font-bold text-[#0d2260]">
            Article not found
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-[#5a6a82]">
            {error || "This news article could not be found."}
          </p>

          <Link
            href="/news"
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#0d2260] px-5 py-3 text-sm font-semibold text-white hover:bg-[#162f7a]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to News
          </Link>
        </div>
      </main>
    );
  }

  // ============================================================
  // ARTICLE CONTENT
  // ============================================================

  const contentParagraphs = article.content
    ? article.content
        .split(/\r?\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
    : [];

  // ============================================================
  // ARTICLE PAGE
  // ============================================================

  return (
    <main className="min-h-screen bg-[#f8f9fc]">

      {/* ========================================================
          ARTICLE HEADER
      ======================================================== */}

      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-10 md:px-8 md:py-14">

          {/* Back to News */}

          <Link
            href="/news"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#0d2260] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to News
          </Link>

          {/* Category */}

          {article.category && (
            <div className="mb-5">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#f5e9b8] px-4 py-1.5 text-sm font-semibold text-[#0d2260]">
                <Newspaper className="h-4 w-4" />
                {article.category}
              </span>
            </div>
          )}

          {/* Title */}

          <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight text-[#0d2260] md:text-5xl lg:text-6xl">
            {article.title}
          </h1>

          {/* Published date */}

          {article.published_at && (
            <div className="mt-6 flex items-center gap-2 text-sm text-[#5a6a82]">
              <Calendar className="h-4 w-4" />

              <span>
                Published{" "}
                {new Date(article.published_at).toLocaleDateString(
                  "en-ZA",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }
                )}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          FEATURED IMAGE
      ======================================================== */}

      {article.featured_image_url && (
        <section className="bg-white">
          <div className="mx-auto max-w-5xl px-6 md:px-8">
            <div className="overflow-hidden rounded-2xl">
              <img
                src={article.featured_image_url}
                alt={article.title}
                className="h-auto max-h-[600px] w-full object-cover"
              />
            </div>
          </div>
        </section>
      )}

      {/* ========================================================
          ARTICLE CONTENT
      ======================================================== */}

      <section className="bg-[#f8f9fc]">
        <div className="mx-auto max-w-3xl px-6 py-12 md:px-8 md:py-16">

          {/* Excerpt */}

          {article.excerpt && (
            <div className="mb-10 border-l-4 border-[#f5e9b8] pl-5">
              <p className="text-lg font-medium leading-8 text-[#5a6a82] md:text-xl">
                {article.excerpt}
              </p>
            </div>
          )}

          {/* Main Article */}

          <article className="rounded-2xl bg-white px-6 py-8 shadow-sm md:px-10 md:py-10">

            {contentParagraphs.length > 0 ? (
              <div className="space-y-6">
                {contentParagraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-base leading-8 text-gray-700 md:text-lg md:leading-9"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-base text-[#5a6a82]">
                No article content is available.
              </p>
            )}

          </article>

          {/* ====================================================
              BACK TO NEWS
          ==================================================== */}

          <div className="mt-10 border-t border-gray-200 pt-8">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 rounded-lg border border-[#0d2260] px-5 py-3 text-sm font-semibold text-[#0d2260] hover:bg-[#0d2260] hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to All News
            </Link>
          </div>

        </div>
      </section>
    </main>
  );
}