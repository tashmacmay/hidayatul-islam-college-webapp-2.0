"use client";

import { useState } from "react";

const filters = [
  "All",
  "News",
  "Events",
  "Achievements",
  "Notices",
  "Islamic",
];

const upcomingEvents = [
  {
    day: "22",
    month: "May",
    title: "Parent-Teacher Consultations Gr R & 1",
    time: "13:30–15:00",
  },
  {
    day: "30",
    month: "May",
    title: "Sports Day — All Grades",
    time: "08:00–14:00",
  },
  {
    day: "5",
    month: "Jun",
    title: "Admin Day — Uniform & Fees",
    time: "09:00–12:00",
  },
  {
    day: "26",
    month: "Jun",
    title: "End of Term 2 — Early Release",
    time: "School closes at 11:00",
  },
];

const notices = [
  "School fees are due by the 7th of each month.",
  "Learners must be in full uniform every day.",
  "All absences must be reported to the school office before 08:00.",
  "The tuck shop is open Monday–Friday during first break only.",
];

const termDates = [
  {
    term: "Term 1",
    dates: "15 Jan – 27 Mar",
  },
  {
    term: "Term 2",
    dates: "14 Apr – 26 Jun",
  },
  {
    term: "Term 3",
    dates: "21 Jul – 25 Sep",
  },
  {
    term: "Term 4",
    dates: "6 Oct – 4 Dec",
  },
];

export default function News() {
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <>
      {/* Hero Section */}

      <section className="relative h-[300px] overflow-hidden">
        <img
          src="/images/HIC-image2.jpg"
          alt="News and announcements"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-navy/90" />

        <div className="relative z-10 flex h-full items-center">
          <div className="mx-auto w-full max-w-7xl px-10">
            <p className="text-xs font-semibold uppercase tracking-[3px] text-gold">
              Home › News & Announcements
            </p>

            <h1 className="mt-4 text-4xl font-bold text-white md:text-5xl">
              News & <span className="text-gold">Announcements</span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-blue-100">
              Stay up to date with everything happening at Hidayatul Islam
              College — events, achievements, notices, and community news.
            </p>
          </div>
        </div>
      </section>

      {/* News Section */}

      <section className="bg-gray-50 px-6 py-16 md:px-10">
        <div className="mx-auto max-w-7xl">

          {/* Filters */}

          <div className="mb-10 flex flex-wrap items-center gap-3">
            <span className="mr-2 text-xs font-medium text-gray-500">
              Filter:
            </span>

            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  activeFilter === filter
                    ? "border-navy bg-navy text-white"
                    : "border-gray-200 bg-white text-navy hover:border-gold hover:bg-gold"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Main Layout */}

          <div className="grid gap-8 lg:grid-cols-[1fr_280px]">

            {/* News Area */}

            <div>
              <div className="rounded-2xl border border-gray-200 bg-white px-8 py-16 text-center shadow-sm">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-navy text-xl text-gold">
                  +
                </div>

                <h2 className="mt-5 text-xl font-bold text-navy">
                  No announcements yet
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
                  News, events, achievements and announcements will appear
                  here as they are published by Hidayatul Islam College.
                </p>
              </div>

              {/* Pagination Template */}

              <div className="mt-8 flex justify-center gap-2">
                <button
                  disabled
                  className="rounded-lg bg-navy px-3 py-2 text-xs font-semibold text-white opacity-100"
                >
                  1
                </button>

                <button
                  disabled
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-400"
                >
                  2
                </button>

                <button
                  disabled
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-400"
                >
                  3
                </button>

                <button
                  disabled
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-400"
                >
                  ›
                </button>
              </div>
            </div>

            {/* Sidebar */}

            <aside className="space-y-6">

              {/* Upcoming Events */}

<div className="rounded-2xl bg-white p-6 shadow-sm">
  <h2 className="text-lg font-bold text-navy">
    Upcoming events
  </h2>

  <div className="mt-5 rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center">
    <p className="text-xs text-gray-400">
      Upcoming events will appear here.
    </p>
  </div>
</div>

{/* Important Notices */}

<div className="rounded-2xl bg-white p-6 shadow-sm">
  <h2 className="text-lg font-bold text-navy">
    Important notices
  </h2>

  <div className="mt-5 rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center">
    <p className="text-xs text-gray-400">
      Important notices will appear here.
    </p>
  </div>
</div>

              {/* Term Dates */}

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-navy">
                  Term dates 2026
                </h2>

                <div className="mt-3 h-0.5 w-12 bg-gold" />

                <div className="mt-5 space-y-3">
                  {termDates.map((term) => (
                    <div
                      key={term.term}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-navy">
                        {term.term}
                      </span>

                      <span className="text-gray-500">
                        {term.dates}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </aside>
          </div>
        </div>
      </section>

      {/* Newsletter */}

      <section className="bg-navy px-6 py-16 text-white md:px-10">
        <div className="mx-auto max-w-3xl text-center">

          <h2 className="text-3xl font-bold">
            Stay in the <span className="text-gold">loop</span>
          </h2>

          <p className="mt-3 text-sm leading-6 text-blue-100">
            Get school news and announcements sent directly to your inbox
            each term.
          </p>

          <div className="mx-auto mt-7 flex max-w-lg flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-blue-200 focus:border-gold"
            />

            <button className="rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-navy transition hover:opacity-90">
              Subscribe
            </button>
          </div>

        </div>
      </section>
    </>
  );
}