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
  const threeImageLayout = images.length === 3;
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
              : threeImageLayout
                ? "grid grid-cols-2 gap-3 lg:grid-cols-2 lg:grid-rows-[auto_auto]"
                : featureLayout
                  ? "grid grid-cols-2 gap-3 lg:grid-cols-3 lg:grid-rows-2"
                  : "grid grid-cols-2 gap-3"
          }
        >
          {images.map((image, index) => {
            let figureClassName;
            let imageClassName;

            if (singleImage) {
              figureClassName = "overflow-hidden rounded-2xl shadow-xl";
              imageClassName =
                "max-h-80 w-full object-contain md:max-h-96";
            } else if (threeImageLayout) {
              if (index === 0) {
                // Latest image: landscape on mobile, full-height on desktop left.
                figureClassName =
                  "col-span-2 aspect-[16/9] overflow-hidden rounded-2xl shadow-xl lg:col-span-1 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:aspect-auto lg:self-stretch";
              } else if (index === 1) {
                // Second-newest: portrait on mobile, landscape at desktop top-right.
                figureClassName =
                  "aspect-[3/4] overflow-hidden rounded-2xl shadow-xl lg:col-start-2 lg:row-start-1 lg:aspect-[16/9]";
              } else {
                // Oldest of the three: portrait on mobile, landscape at desktop bottom-right.
                figureClassName =
                  "aspect-[3/4] overflow-hidden rounded-2xl shadow-xl lg:col-start-2 lg:row-start-2 lg:aspect-[16/9]";
              }

              imageClassName = "h-full w-full object-cover";
            } else if (featureLayout && index === 0) {
              figureClassName =
                "col-span-2 overflow-hidden rounded-2xl shadow-xl lg:col-span-1 lg:row-span-2";
              imageClassName =
                "h-64 w-full object-contain sm:h-80 lg:h-[520px] lg:object-cover";
            } else {
              figureClassName = "overflow-hidden rounded-2xl shadow-xl";
              imageClassName =
                "h-36 w-full object-cover sm:h-48 lg:h-[250px]";
            }

            return (
              <figure key={image.id} className={figureClassName}>
                <img
                  src={image.image_url}
                  alt={
                    image.alt_text ||
                    image.title ||
                    "Hidayatul Islam College"
                  }
                  loading="lazy"
                  className={imageClassName}
                />
              </figure>
            );
          })}
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
