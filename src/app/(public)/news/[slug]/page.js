import Link from "next/link";
import { notFound } from "next/navigation";
import { Section, Container } from "@/components/ui/layout";
import { ArrowLeft, Calendar, FileText } from "lucide-react";

async function getNewsItem(slug) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/news/${slug}`, {
      cache: 'no-store'
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    const item = data.news || data;
    
    if (!item || !item.title) return null;
    
    return item;
  } catch (error) {
    console.error("Failed to fetch news item:", error);
    return null;
  }
}

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

  const mediaUrl = item.preview_url || item.featured_image_url;
  const isPdf = (item.featured_image_url || "").toLowerCase().includes('.pdf');

  return (
    <Section tone="white" space="md">
      <Container>
        <Link
          href="/news"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-navy transition hover:text-gold"
        >
          <ArrowLeft size={16} />
          Back to News
        </Link>

        {/* Article Header */}
        <div className="mb-8">
          <span className="inline-block rounded-full bg-gold/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-navy mb-4">
            {item.category || "News"}
          </span>
          <h1 className="font-serif text-3xl font-bold leading-tight text-navy md:text-5xl">
            {item.title}
          </h1>
          <p className="mt-5 flex items-center gap-2 text-sm font-medium text-gray-500 border-b border-gray-200 pb-6">
            <Calendar size={16} />
            Published {formatDate(item.published_at)}
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 mt-10">
          
          {/* LEFT COLUMN: Text + Bottom Button */}
          <div className="lg:col-span-7 flex flex-col justify-start">
            
            {item.excerpt && (
              <p className="text-xl md:text-2xl font-medium leading-relaxed text-navy mb-8">
                {item.excerpt}
              </p>
            )}

            {/* Main Content Area */}
            <div className="prose prose-lg prose-navy max-w-none text-gray-700 whitespace-pre-wrap leading-8">
              {item.content || (!item.excerpt ? "No further details available for this article." : "")}
            </div>

            {/* Back to All News Button anchored to the text */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <Link
                href="/news"
                className="inline-flex items-center gap-2 rounded-lg border border-navy px-6 py-3 text-sm font-semibold text-navy transition hover:bg-navy hover:text-white"
              >
                <ArrowLeft size={16} />
                Back to All News
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Media */}
          <div className="lg:col-span-5">
            <div className="sticky top-24">
              {mediaUrl && (
                <>
                  {isPdf ? (
                    <a 
                      href={`/api/storage/${item.featured_image_url}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-navy p-10 text-center shadow-sm transition hover:bg-navy-dark"
                    >
                      <FileText size={56} className="text-gold" />
                      <div>
                        <span className="block text-base font-bold text-white mt-2">View Document</span>
                        <span className="mt-1 block text-sm text-blue-200">Opens in new tab</span>
                      </div>
                    </a>
                  ) : (
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mediaUrl}
                        alt={item.title}
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

        </div>
      </Container>
    </Section>
  );
}