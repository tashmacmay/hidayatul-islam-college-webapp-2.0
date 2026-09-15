"use client";

import { useState } from "react";
import {
  BookOpen,
  FileText,
  Download,
  Play,
  ShieldCheck,
  GraduationCap,
  Library,
  BookMarked,
  Calculator,
  Heart,
  Users,
  School,
} from "lucide-react";

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

      <section className="relative h-[300px] overflow-hidden">
        <img
          src="/images/HIC-image2.jpg"
          alt="Learning Resources"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-navy/90" />

        <div className="relative z-10 flex h-full items-center">
          <div className="mx-auto w-full max-w-7xl px-10">
            <p className="text-xs font-semibold uppercase tracking-[3px] text-gold">
              Home <span className="mx-2 text-white/40">›</span> Resources
            </p>

            <h1 className="mt-5 text-4xl font-bold text-white md:text-5xl">
              Learning <span className="text-gold">Resources</span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100">
              Educational materials and resources for HIC learners,
              parents and the wider community.
            </p>
          </div>
        </div>
      </section>

      {/* Resources Content */}

      <section className="bg-gray-50 px-10 py-16">
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
                  Some resources on this page may only be available to
                  registered parents and learners. Please refer to the
                  school's privacy policy for information about how personal
                  information is handled.
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

                <h2 className="mt-3 text-2xl font-bold">
                  Grade-Specific{" "}
                  <span className="text-gold">Resources</span>
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">
                  Browse resources by grade level and find materials
                  relevant to your child's learning programme.
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
                  Resource Categories
                </p>

                <div className="mt-5 space-y-4">
                  <div className="flex items-center gap-3 text-sm text-blue-100">
                    <FileText className="h-4 w-4 text-gold" />
                    Worksheets & learning materials
                  </div>

                  <div className="flex items-center gap-3 text-sm text-blue-100">
                    <Play className="h-4 w-4 text-gold" />
                    Video learning materials
                  </div>

                  <div className="flex items-center gap-3 text-sm text-blue-100">
                    <BookOpen className="h-4 w-4 text-gold" />
                    Reading resources
                  </div>

                  <div className="flex items-center gap-3 text-sm text-blue-100">
                    <BookMarked className="h-4 w-4 text-gold" />
                    Islamic studies materials
                  </div>

                  <div className="flex items-center gap-3 text-sm text-blue-100">
                    <School className="h-4 w-4 text-gold" />
                    School documents
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
                    ? "border-navy bg-navy text-white"
                    : "border-gray-200 bg-white text-navy hover:border-navy"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Resource Grid */}

          <div className="mt-8">
            {/* 
              Resource cards will be populated from the client's
              resource/content system.

              No placeholder resources are included here.
            */}

            <div className="min-h-[120px]" />
          </div>

          {/* Forms & Policies */}

          <div className="mt-16">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[3px] text-gold">
                Official School Documents
              </p>

              <h2 className="mt-2 text-2xl font-bold text-navy">
                Forms & <span className="text-gold">Policies</span>
              </h2>

              <div className="mt-3 h-1 w-12 rounded-full bg-gold" />
            </div>

            {/* 
              Official documents will be added by the client.
              No placeholder documents are displayed.
            */}

            <div className="mt-6 min-h-[80px]" />
          </div>
        </div>
      </section>

      {/* Parent Portal CTA */}

      <section className="bg-navy px-10 py-16 text-center text-white">
        <div className="mx-auto max-w-3xl">

          <p className="text-[10px] font-semibold uppercase tracking-[3px] text-gold">
            Parent Portal
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            More resources in the{" "}
            <span className="text-gold">Parent Portal</span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-blue-100">
            Access additional school resources and information through
            the secure parent portal.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button className="rounded-lg bg-gold px-6 py-3 text-xs font-semibold text-navy transition hover:opacity-90">
              Sign in to your account
            </button>

            <button className="rounded-lg border border-white/30 px-6 py-3 text-xs font-semibold text-white transition hover:bg-white hover:text-navy">
              Request access
            </button>
          </div>

        </div>
      </section>
    </>
  );
}