"use client";

import { useState } from "react";
import { EmptyState, PageHero } from "@/components/components";

const filters = ["All", "News", "Events", "Achievements", "Notices", "Islamic"];

export default function News() {
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <>
      <PageHero
        image="/images/HIC-image2.jpg"
        imageAlt="News and announcements"
        breadcrumb="News & Announcements"
        title={<>News & <span className="text-gold">Announcements</span></>}
        description="Stay up to date with everything happening at Hidayatul Islam College — events, achievements, notices, and community news."
      />

      <section className="section-shell section-shell--off-white">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-wrap items-center gap-3">
            <span className="mr-2 text-xs font-semibold text-navy">Filter:</span>
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`filter-chip ${
                  activeFilter === filter ? "filter-chip--active" : "filter-chip--inactive"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="mx-auto max-w-4xl">
            <EmptyState
              icon={<span className="text-2xl">+</span>}
              title="No news or announcements yet"
              description="School news, events, achievements and important notices will appear here."
            />
          </div>
        </div>
      </section>

    </>
  );
}
