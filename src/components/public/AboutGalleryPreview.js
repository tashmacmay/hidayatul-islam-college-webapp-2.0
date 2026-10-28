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

  const singleImage = images.length === 1;
  const featureLayout = images.length >= 4;

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
        <div
          className={
            singleImage
              ? "mx-auto max-w-2xl"
              : featureLayout
                ? "grid gap-3 md:grid-cols-3 md:grid-rows-2"
                : "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          }
        >
          {images.map((image, index) => (
            <figure
              key={image.id}
              className={
                singleImage
                  ? "overflow-hidden rounded-2xl shadow-xl"
                  : featureLayout && index === 0
                    ? "overflow-hidden rounded-2xl shadow-xl md:row-span-2"
                    : "overflow-hidden rounded-2xl shadow-xl"
              }
            >
              <img
                src={image.image_url}
                alt={image.alt_text || image.title || "Hidayatul Islam College"}
                loading="lazy"
                className={
                  singleImage
                    ? "max-h-80 w-full object-contain md:max-h-96"
                    : featureLayout && index === 0
                      ? "h-72 w-full object-cover md:h-[520px]"
                      : "h-40 w-full object-cover md:h-[250px]"
                }
              />
            </figure>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link
          href="/gallery"
          className="inline-flex items-center justify-center rounded-full border border-gold px-6 py-3 text-sm font-semibold text-gold transition hover:bg-gold hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
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
