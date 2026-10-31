import Link from "next/link";
import { notFound } from "next/navigation";
import { Section, Container } from "@/components/ui/layout";
import { ArrowLeft, Calendar } from "lucide-react";

// Helper to fetch the specific article
async function getNewsItem(slug) {
  try {
    // Uses your internal API route. 
    // If you are fetching directly from DB, replace this block.
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/news/${slug}`, {
      next: { revalidate: 60 } // Cache for 60 seconds
    });
    
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Failed to fetch news item:", error);
    return null;
  }
}

// Dynamic SEO metadata based on the article
export async function generateMetadata({ params }) {
  const { slug } = await params; 
  const item = await getNewsItem(slug);
  
  if (!item) return { title: "Article Not Found | Hidayatul Islam College" };

  return {
    title: `${item.title} | Hidayatul Islam College`,
    description: item.excerpt || "Read the latest news from Hidayatul Islam College.",
  };
}

function formatDate(iso) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-ZA", {
    timeZone: "Africa/Johannesburg",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export default async function NewsArticle({ params }) {
  const { slug } = await params;
  const item = await getNewsItem(slug);

  if (!item) {
    notFound();
  }

  return (
    <Section tone="cream" space="sm">
      <Container size="narrow">
        {/* Back Button - Top */}
        <Link
          href="/news"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-navy transition hover:text-gold"
        >
          <ArrowLeft size={16} />
          Back to News
        </Link>

        {/* Article Header */}
        <div className="mb-10 text-center">
          <span className="inline-block rounded-full bg-gold/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-navy">
            {item.category || "News"}
          </span>
          
          <h1 className="mt-6 font-serif text-3xl font-bold leading-tight text-navy md:text-5xl">
            {item.title}
          </h1>
          
          <p className="mt-5 flex items-center justify-center gap-2 text-sm font-medium text-gray-500">
            <Calendar size={16} />
            Published {formatDate(item.published_at)}
          </p>
        </div>

        {/* Featured Image */}
        {item.featured_image_url && (
          <div className="mb-12 overflow-hidden rounded-2xl shadow-md bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.featured_image_url}
              alt={item.title}
              className="mx-auto w-full object-contain max-h-[600px]"
            />
          </div>
        )}

        {/* Article Content */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
          {/* 
            If your 'content' field contains HTML from a Rich Text Editor, use:
            <div className="prose prose-sm sm:prose-base prose-navy mx-auto max-w-none" dangerouslySetInnerHTML={{ __html: item.content }} />
          */}
          
          {/* If your 'content' field is plain text (with line breaks), use this: */}
          <div className="mx-auto max-w-none text-base leading-8 text-gray-700 whitespace-pre-wrap">
            {item.content || item.excerpt}
          </div>
        </div>

        {/* Footer / Back to All */}
        <div className="mt-12 text-center">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 rounded-lg border border-navy px-6 py-3 text-sm font-semibold text-navy transition hover:bg-navy hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to All News
          </Link>
        </div>
      </Container>
    </Section>
  );
}