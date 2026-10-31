"use client";

import usePublicList from "@/hooks/usePublicList";
import { Button } from "@/components/ui/button"; // Add import

export default function AboutGalleryPreview() {
  // ... KEEP data fetching ...

  return (
    <div>
      {/* ... KEEP loading, error, and image grid ... */}

      <div className="mt-8 text-center">
        <Button href="/gallery" variant="outline-gold">
          View Full Gallery
          <span className="ml-2" aria-hidden="true">→</span>
        </Button>
      </div>
    </div>
  );
}