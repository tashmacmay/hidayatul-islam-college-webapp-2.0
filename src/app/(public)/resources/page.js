"use client";

import { useState } from "react";
import {
  BookOpen,
  FileText,
  Play,
  ShieldCheck,
  BookMarked,
  School,
} from "lucide-react";
import Link from "next/link";

const resourceCategories = [
  "All resources",
  "Literacy & Language",
  "Mathematics",
  "Islamic Studies",
  "Life Skills",
  "Parent Guides",
  "School Documents",
];

const grades = [
  "Grade R",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
];

export default function Resources() {
  const [selectedCategory, setSelectedCategory] =
    useState("All resources");

  const [selectedGrade, setSelectedGrade] = useState("Grade R");

  return (
    <>
      {/* Hero Section */}

      <section className="relative flex min-h-[320px] items-end overflow-hidden bg-navy md:min-h-[340px]">
        <img
          src="/images/HIC-image2.jpg"
          alt="Learning Resources"
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
            <span className="text-blue-200/75">Resources</span>
          </p>

          <div className="mb-5 h-[3px] w-[60px] rounded-full bg-gold" />

          <h1 className="mb-3 font-serif text-2xl font-bold leading-tight text-white md:text-[28px]">
            Learning <span className="text-gold">Resources</span>
          </h1>

          <p className="max-w-[560px] text-sm leading-7 text-blue-100">
            Free educational materials for HIC learners, parents, and the
            wider Kensington community — worksheets, videos, guidance, and more.
          </p>
        </div>
      </section>

      {/* Resources Content */}

      <section className="bg-off-white px-6 py-20 md:px-10 md:py-24">
        <div className="mx-auto max-w-6xl">

          {/* POPIA Notice */}

          <div className="rounded-xl border border-[#E9D9A8] bg-[#FFF8E5] p-5">
            <div className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F7EAC2]">
                <ShieldCheck className="h-4 w-4 text-gold" />
              </div>

              <div>
                <h3 className="text-xs font-bold text-navy">
                  POPIA & Privacy Notice
                </h3>

                <p className="mt-1 text-xs leading-5 text-gray-600">
                  Some resources may be available publicly, while others may
                  require authorised access. Personal information must be handled
                  in accordance with the Protection of Personal Information Act
                  (POPIA).
                </p>
              </div>
            </div>
          </div>

          {/* Grade Resource Packs */}

          <div className="mt-8 rounded-2xl bg-navy p-8 text-white shadow-lg">
            <div className="grid gap-8 lg:grid-cols-2">

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[3px] text-gold">
                  Start Here
                </p>

                <h2 className="mt-3 text-lg font-semibold">
                  Grade-Specific{" "}
                  <span className="text-gold">Resources</span>
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">
                  Grade-specific materials will appear here once they are
                  uploaded by the school.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {grades.map((grade) => (
                    <button
                      key={grade}
                      onClick={() => setSelectedGrade(grade)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                        selectedGrade === grade
                          ? "bg-gold text-navy"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              </div>

              {/* Included in Each Pack */}

              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[2px] text-gold">
                  Included in each pack
                </p>

                <div className="mt-5 space-y-4">
                  <div className="flex items-center gap-3 text-sm text-blue-100">
                    <FileText className="h-4 w-4 text-gold" />
                    Term overview & schedule
                  </div>

                  <div className="flex items-center gap-3 text-sm text-blue-100">
                    <Play className="h-4 w-4 text-gold" />
                    Worksheets
                  </div>

                  <div className="flex items-center gap-3 text-sm text-blue-100">
                    <BookOpen className="h-4 w-4 text-gold" />
                    Video lessons
                  </div>

                  <div className="flex items-center gap-3 text-sm text-blue-100">
                    <BookMarked className="h-4 w-4 text-gold" />
                    Reading lists
                  </div>

                  <div className="flex items-center gap-3 text-sm text-blue-100">
                    <School className="h-4 w-4 text-gold" />
                    Calendar & key dates
                  </div>

                  <div className="flex items-center gap-3 text-sm text-blue-100">
                    <BookMarked className="h-4 w-4 text-gold" />
                    Islamic studies materials
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Resource Filters */}

          <div className="mt-8 flex flex-wrap gap-2">
            {resourceCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  selectedCategory === category
                    ? "border-navy bg-navy text-gold-light"
                    : "border-gray-200 bg-white text-navy hover:border-gold hover:bg-gold/10"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Resource Grid */}

          <div className="mt-8 rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm md:px-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-navy text-2xl text-gold">
              <BookOpen className="h-6 w-6" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-navy">
              No resources uploaded yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
              Learning materials, worksheets, guides and school documents will
              appear here once they are uploaded by the school.
            </p>
          </div>

          {/* Forms & Policies */}

          <div className="mt-16">
            <div>
              <h2 className="mt-2 text-lg font-semibold text-navy">
                Forms & <span className="text-gold">Policies</span>
              </h2>

              <div className="mt-3 h-1 w-12 rounded-full bg-gold" />
            </div>

            <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-white px-5 py-8 text-center">
              <p className="text-sm font-semibold text-navy">
                No forms or policies have been uploaded yet.
              </p>
              <p className="mt-2 text-xs leading-5 text-gray-500">
                School forms, policies and official documents will appear here
                when available.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Parent Portal CTA */}

      <section className="bg-navy px-6 py-16 text-center text-white md:px-10">
        <div className="mx-auto max-w-3xl">

          <p className="text-[10px] font-semibold uppercase tracking-[3px] text-gold">
            Parent Portal
          </p>

          <h2 className="mt-3 font-serif text-xl font-bold leading-tight">
            More resources in the{" "}
            <span className="text-gold">Parent Portal</span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-blue-100">
            Authorised families may access additional resources and information
            through the secure parent portal.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/login"
              className="rounded-lg bg-gold px-6 py-3 text-xs font-semibold text-navy transition hover:opacity-90"
            >
              Portal Login
            </Link>
          </div>

        </div>
      </section>
    </>
  );
}