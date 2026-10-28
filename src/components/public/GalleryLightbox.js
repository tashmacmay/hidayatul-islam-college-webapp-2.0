"use client";

import { useEffect } from "react";

export default function GalleryLightbox({
  images,
  selectedImage,
  onClose,
  onSelect,
}) {
  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "ArrowRight" && images.length > 1) {
        const currentIndex = images.findIndex(
          (image) => image.id === selectedImage.id
        );

        onSelect(images[(currentIndex + 1) % images.length]);
      }

      if (event.key === "ArrowLeft" && images.length > 1) {
        const currentIndex = images.findIndex(
          (image) => image.id === selectedImage.id
        );

        onSelect(
          images[
            (currentIndex - 1 + images.length) % images.length
          ]
        );
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [images, selectedImage, onClose, onSelect]);

  if (!selectedImage) return null;

  const caption =
    selectedImage.caption || selectedImage.title || "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Gallery image"
        className="relative w-full max-w-5xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close image viewer"
          className="absolute -top-10 right-0 rounded px-3 py-2 text-white hover:bg-white/10"
        >
          Close ✕
        </button>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={selectedImage.image_url}
          alt={
            selectedImage.alt_text ||
            selectedImage.title ||
            ""
          }
          className="mx-auto max-h-[75vh] w-full object-contain"
        />

        {caption && (
          <p className="mx-auto mt-4 max-w-3xl whitespace-pre-wrap text-center text-sm text-white">
            {caption}
          </p>
        )}

        {images.length > 1 && (
          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => {
                const index = images.findIndex(
                  (image) => image.id === selectedImage.id
                );

                onSelect(
                  images[
                    (index - 1 + images.length) % images.length
                  ]
                );
              }}
              className="rounded-lg border border-white/30 px-4 py-2 text-white hover:bg-white/10"
            >
              ← Previous
            </button>

            <button
              type="button"
              onClick={() => {
                const index = images.findIndex(
                  (image) => image.id === selectedImage.id
                );

                onSelect(images[(index + 1) % images.length]);
              }}
              className="rounded-lg border border-white/30 px-4 py-2 text-white hover:bg-white/10"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
