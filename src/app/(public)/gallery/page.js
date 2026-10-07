"use client";

import { useState } from "react";
import { Images } from "lucide-react";
import { EmptyState, PageHero, PopiaNote, SectionHeader } from "@/components/components";

const categories = ["All", "Sport", "Islamic Events", "Academic", "School Events", "Outings"];

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  return (
    <>
      <PageHero
        image="/images/HIC-image2.jpg"
        imageAlt="Gallery and Media"
        breadcrumb="Gallery & Media"
        title={<>Gallery & <span className="text-gold">Media</span></>}
        description="A window into life at Hidayatul Islam College — events, learning, sport, and community moments captured throughout the year."
      />

      <section className="section-shell section-shell--white">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            label="Our Moments"
            title="School Life in Pictures"
            className="text-center"
            dividerClassName="mx-auto mt-4 h-1 w-16 rounded-full bg-gold"
          />

          <PopiaNote className="mx-auto mt-8 max-w-5xl">
            Photos will only be published once the appropriate consent has been obtained. Images containing learners must be handled in accordance with the Protection of Personal Information Act (POPIA).
          </PopiaNote>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`filter-chip ${selectedCategory === category ? "filter-chip--active" : "filter-chip--inactive"}`}
              >
                {category}
              </button>
            ))}
          </div>

          <EmptyState
            icon={<Images className="h-6 w-6" />}
            title="No gallery photos yet"
            description="Photos from school events, learning activities, sport, outings and community moments will appear here once they are uploaded by the school."
            className="empty-state-gallery mt-10"
            iconClassName="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-navy text-xl text-gold"
            titleElement="h3"
            titleClassName="mt-4 text-sm font-semibold text-navy"
            descriptionClassName="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500"
          />
        </div>
      </section>

    </>
  );
}
