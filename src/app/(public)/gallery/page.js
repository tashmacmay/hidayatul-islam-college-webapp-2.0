"use client";

import Link from "next/link";
import { useState } from "react";
import { Images, ShieldCheck } from "lucide-react";

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

      <section className="relative flex min-h-[320px] items-end overflow-hidden bg-navy md:min-h-[340px]">
        <img
          src="/images/HIC-image2.jpg"
          alt="Gallery and Media"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/80 to-navy/45" />
        <div className="absolute inset-0 opacity-20 [background-image:repeating-linear-gradient(135deg,transparent,transparent_12px,rgba(255,255,255,0.08)_12px,rgba(255,255,255,0.08)_13px)]" />

        <div className="relative z-10 w-full px-6 pb-10 md:px-16 md:pb-[52px]">
          <p className="mb-3.5 flex items-center gap-2 text-[9px] text-blue-200 md:text-[10px]">
            <Link href="/" className="text-gold-light transition-colors hover:text-gold">
              Home
            </Link>
            <span className="text-navy-dark">›</span>
            <span className="text-blue-200/75">Gallery & Media</span>
          </p>

          <div className="mb-5 h-[3px] w-[60px] rounded-full bg-gold" />

          <h1 className="mb-3 font-serif text-2xl font-bold leading-tight text-white md:text-[28px]">
            Gallery & <span className="text-gold">Media</span>
          </h1>

          <p className="max-w-[560px] text-sm leading-7 text-blue-100">
            A window into life at Hidayatul Islam College — events, learning,
            sport, and community moments captured throughout the year.
          </p>
        </div>
      </section>

      {/* Gallery Section */}

      <section className="bg-white px-6 py-20 md:px-10 md:py-24">
        <div className="mx-auto max-w-6xl">

          {/* Section Heading */}

          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[3px] text-gold">
              Our Moments
            </p>

            <h2 className="mt-3 font-serif text-xl font-bold leading-tight text-navy md:text-2xl">
              School Life in Pictures
            </h2>

            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gold" />
          </div>

          {/* POPIA Notice */}

          <div className="mx-auto mt-8 max-w-5xl rounded-xl border border-[#eadcae] bg-[#fff9e8] px-6 py-4">
            <div className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/20 text-sm text-gold">
                <ShieldCheck className="h-4 w-4" />
              </div>

              <div>
                <p className="text-xs font-bold text-navy">
                  POPIA Notice
                </p>

                <p className="mt-1 text-xs leading-5 text-gray-600">
                  Photos will only be published once the appropriate consent
                  has been obtained. Images containing learners must be handled
                  in accordance with the Protection of Personal Information Act
                  (POPIA).
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
                    ? "border-navy bg-navy text-gold-light"
                    : "border-gray-200 bg-white text-navy hover:border-gold hover:bg-gold/10"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}

          <div className="mt-10">
            <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-14">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-navy text-xl text-gold">
                  <Images className="h-6 w-6" />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-navy">
                  No gallery photos yet
                </h3>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
                  Photos from school events, learning activities, sport, outings
                  and community moments will appear here once they are uploaded
                  by the school.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Footer CTA */}

      <section className="bg-navy px-6 py-16 text-center text-white md:px-10">
        <div className="mx-auto max-w-3xl">

          <h2 className="font-serif text-xl font-bold leading-tight">
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