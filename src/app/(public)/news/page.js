"use client";

import Link from "next/link";
import { useState } from "react";

const filters = [
  "All",
  "News",
  "Events",
  "Achievements",
  "Notices",
  "Islamic",
];

export default function News() {
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <>
      {/* Hero Section */}

      <section className="relative flex min-h-[320px] items-end overflow-hidden bg-navy md:min-h-[340px]">
        <img
          src="/images/HIC-image2.jpg"
          alt="News and announcements"
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
            <span className="text-blue-200/75">News & Announcements</span>
          </p>

          <div className="mb-5 h-[3px] w-[60px] rounded-full bg-gold" />

          <h1 className="mb-3 font-serif text-2xl font-bold leading-tight text-white md:text-[28px]">
            News & <span className="text-gold">Announcements</span>
          </h1>

          <p className="max-w-[560px] text-sm leading-7 text-blue-100">
            Stay up to date with everything happening at Hidayatul Islam College
            — events, achievements, notices, and community news.
          </p>
        </div>
      </section>

      {/* News Section */}

      <section className="bg-off-white px-6 py-20 md:px-10 md:py-24">
        <div className="mx-auto max-w-6xl">

          {/* Filters */}

          <div className="mb-10 flex flex-wrap items-center gap-3">
            <span className="mr-2 text-xs font-semibold text-navy">
              Filter:
            </span>

            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  activeFilter === filter
                    ? "border-navy bg-navy text-gold-light"
                    : "border-gray-200 bg-white text-navy hover:border-gold hover:bg-gold/10"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Main Layout */}

          <div className="mx-auto max-w-4xl">

            {/* News Area */}

            <div>
              <div className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm md:px-10">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-navy text-xl text-gold">
                  <span className="text-2xl">+</span>
                </div>

                <h2 className="mt-5 text-lg font-semibold text-navy">
                  No news or announcements yet
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
                  School news, events, achievements and important notices will
                  appear here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}

      <section className="bg-navy px-6 py-16 text-white md:px-10">
        <div className="mx-auto max-w-3xl text-center">

          <h2 className="font-serif text-2xl font-bold leading-tight">
            Stay in the <span className="text-gold">loop</span>
          </h2>

          <p className="mt-3 text-sm leading-6 text-blue-100">
            Get school news and announcements sent directly to your inbox
            each term.
          </p>

        </div>
      </section>
    </>
  );
}