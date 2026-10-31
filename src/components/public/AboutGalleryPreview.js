"use client";

import Link from "next/link";
import usePublicList from "@/hooks/usePublicList";

export default function AboutGalleryPreview() {
  const { items, loading, error } = usePublicList("/api/gallery", "gallery");

  const images = items
    .filter(
      (item) =>
        item.id != null &&
        typeof item.image_url === "string" &&
        item.image_url.trim() !== ""
    )
    .filter(
      (item, index, array) =>
        array.findIndex((candidate) => candidate.id === item.id) === index
    )
    .slice(0, 5);

  return (
    <div>
      {loading && (
        <p className="py-8 text-center text-sm text-blue-100">
          Loading school photos...
        </p>
      )}

      {error && !loading && (
        <p className="py-8 text-center text-sm text-blue-100">
          Unable to load school photos right now. Please visit our full gallery.
        </p>
      )}

      {!loading && !error && images.length === 0 && (
        <p className="py-8 text-center text-sm text-blue-100">
          School photos will appear here once they are available.
        </p>
      )}

      {!loading && !error && images.length > 0 && (
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-3">
          {images.map((image) => (
            <figure
              key={image.id}
              className="relative aspect-square overflow-hidden rounded-2xl shadow-md"
            >
              <img
                src={image.image_url}
                alt={image.alt_text || image.title || "Hidayatul Islam College"}
                loading="lazy"
                className="h-full w-full object-cover object-center"
              />
            </figure>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link
          href="/gallery"
          className="inline-flex items-center justify-center rounded-lg border border-gold px-6 py-3 text-sm font-semibold text-gold transition hover:bg-gold hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
        >
          View Full Gallery
          <span className="ml-2" aria-hidden="true">
            →
          </span>
        </Link>
      </div>
    </div>
  );
}