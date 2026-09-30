"use client";

import { useState } from "react";
import {
  Newspaper,
  Images,
  Plus,
  ArrowRight,
} from "lucide-react";

import StaffSidebar from "@/components/staff/StaffSidebar";
import ResponsiveAppShell from "@/components/layout/ResponsiveAppShell";

export default function MediaManagementPage() {
  const [activeSection, setActiveSection] = useState("news");

  return (
    <ResponsiveAppShell
      sidebar={(sidebarProps) => <StaffSidebar {...sidebarProps} />}
    >
      <main className="min-h-screen bg-off-white">
        {/* Page Header */}
        <section className="border-b border-gray-200 bg-white px-6 py-6 md:px-10">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-semibold uppercase tracking-[2px] text-gold">
              Staff Portal
            </p>

            <div className="mt-2 flex items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl font-bold text-navy md:text-3xl">
                  Media Management
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                  Manage the news, announcements and gallery content displayed
                  on the public website.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="px-6 py-8 md:px-10">
          <div className="mx-auto max-w-7xl">

            {/* Section Buttons */}
            <div className="mb-8 grid gap-4 md:grid-cols-2">

              {/* News & Announcements */}
              <button
                type="button"
                onClick={() => setActiveSection("news")}
                className={`group rounded-2xl border p-6 text-left transition ${
                  activeSection === "news"
                    ? "border-navy bg-navy shadow-sm"
                    : "border-gray-200 bg-white hover:border-gold hover:shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                      activeSection === "news"
                        ? "bg-gold/20 text-gold-light"
                        : "bg-navy text-gold"
                    }`}
                  >
                    <Newspaper className="h-6 w-6" />
                  </div>

                  <ArrowRight
                    className={`h-5 w-5 transition-transform group-hover:translate-x-1 ${
                      activeSection === "news"
                        ? "text-gold-light"
                        : "text-gray-400"
                    }`}
                  />
                </div>

                <h2
                  className={`mt-5 text-base font-bold ${
                    activeSection === "news"
                      ? "text-white"
                      : "text-navy"
                  }`}
                >
                  News & Announcements
                </h2>

                <p
                  className={`mt-2 text-sm leading-6 ${
                    activeSection === "news"
                      ? "text-blue-100"
                      : "text-gray-500"
                  }`}
                >
                  Create and manage school news, events, achievements, notices
                  and Islamic announcements.
                </p>
              </button>

              {/* Gallery */}
              <button
                type="button"
                onClick={() => setActiveSection("gallery")}
                className={`group rounded-2xl border p-6 text-left transition ${
                  activeSection === "gallery"
                    ? "border-navy bg-navy shadow-sm"
                    : "border-gray-200 bg-white hover:border-gold hover:shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                      activeSection === "gallery"
                        ? "bg-gold/20 text-gold-light"
                        : "bg-navy text-gold"
                    }`}
                  >
                    <Images className="h-6 w-6" />
                  </div>

                  <ArrowRight
                    className={`h-5 w-5 transition-transform group-hover:translate-x-1 ${
                      activeSection === "gallery"
                        ? "text-gold-light"
                        : "text-gray-400"
                    }`}
                  />
                </div>

                <h2
                  className={`mt-5 text-base font-bold ${
                    activeSection === "gallery"
                      ? "text-white"
                      : "text-navy"
                  }`}
                >
                  Gallery
                </h2>

                <p
                  className={`mt-2 text-sm leading-6 ${
                    activeSection === "gallery"
                      ? "text-blue-100"
                      : "text-gray-500"
                  }`}
                >
                  Upload and manage school photographs from events, sport,
                  academics, outings and Islamic activities.
                </p>
              </button>
            </div>

            {/* Active Section */}
            {activeSection === "news" ? (
              <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-navy">
                      News & Announcements
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Manage content displayed on the public News &
                      Announcements page.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-navy/90"
                  >
                    <Plus className="h-4 w-4" />
                    Create Article
                  </button>
                </div>

                <div className="px-6 py-14 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-navy text-gold">
                    <Newspaper className="h-6 w-6" />
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-navy">
                    No news or announcements yet
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                    Articles created here will appear on the public News &
                    Announcements page once they are published.
                  </p>
                </div>
              </section>
            ) : (
              <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-navy">
                      Gallery
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Upload and manage photographs displayed on the public
                      Gallery page.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-navy/90"
                  >
                    <Plus className="h-4 w-4" />
                    Upload Photos
                  </button>
                </div>

                <div className="px-6 py-14 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-navy text-gold">
                    <Images className="h-6 w-6" />
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-navy">
                    No gallery images yet
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                    Photos uploaded here will appear on the public Gallery
                    page after the required consent and publishing checks.
                  </p>
                </div>
              </section>
            )}
          </div>
        </section>
      </main>
    </ResponsiveAppShell>
  );
}