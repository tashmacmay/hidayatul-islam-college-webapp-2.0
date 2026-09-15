"use client";

import { useState } from "react";

const categories = [
  "All",
  "Sport",
  "Islamic Events",
  "Academic",
  "School Events",
  "Outings",
];

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  return (
    <>
      {/* Hero Section */}

      <section className="relative h-[330px] overflow-hidden">
        <img
          src="/images/HIC-image2.jpg"
          alt="Gallery and Media"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-navy/85" />

        <div className="relative z-10 flex h-full items-center">
          <div className="mx-auto w-full max-w-7xl px-10">
            <p className="text-xs font-semibold uppercase tracking-[3px] text-gold">
              Home › Gallery & Media
            </p>

            <h1 className="mt-5 text-4xl font-bold text-white md:text-5xl">
              Gallery & <span className="text-gold">Media</span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100">
              A window into life at Hidayatul Islam College — events,
              learning, sport, and community moments captured throughout
              the year.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}

      <section className="px-10 py-20">
        <div className="mx-auto max-w-7xl">

          {/* Section Heading */}

          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[3px] text-gold">
              Our Moments
            </p>

            <h2 className="mt-3 text-3xl font-bold text-navy md:text-4xl">
              School Life in Pictures
            </h2>

            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gold" />
          </div>

          {/* POPIA Notice */}

          <div className="mx-auto mt-8 max-w-5xl rounded-xl border border-[#eadcae] bg-[#fff9e8] px-6 py-4">
            <div className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/20 text-sm text-gold">
                ♧
              </div>

              <div>
                <p className="text-xs font-bold text-navy">
                  POPIA Notice
                </p>

                <p className="mt-1 text-xs leading-5 text-gray-600">
                  Photos published on this page should only be used with
                  the appropriate school and parental consent. Images
                  containing learners should be published in accordance
                  with the Protection of Personal Information Act (POPIA).
                </p>
              </div>
            </div>
          </div>

          {/* Category Filters */}

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full border px-5 py-2.5 text-xs font-semibold transition ${
                  selectedCategory === category
                    ? "border-navy bg-navy text-white"
                    : "border-gray-200 bg-white text-navy hover:border-gold hover:text-gold"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}

          <div className="mt-10">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

              {/* Gallery images will be populated by the client */}

              <div className="hidden" />
              
            </div>

            {/* Empty gallery state */}

            <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-navy text-xl text-gold">
                  ▣
                </div>

                <h3 className="mt-4 text-base font-bold text-navy">
                  Gallery
                </h3>

                <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-gray-500">
                  Gallery images will be displayed here.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Footer CTA */}

      <section className="bg-navy px-10 py-16 text-center text-white">
        <div className="mx-auto max-w-3xl">

          <h2 className="text-3xl font-bold">
            Stay connected with{" "}
            <span className="text-gold">HIC</span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-blue-100">
            Follow the school throughout the year for updates, events and
            community moments.
          </p>

        </div>
      </section>
    </>
  );
}