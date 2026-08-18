// app/staff-dashboard/resources/page.js

"use client";

import { useState } from "react";
import {
  Search,
  BookOpen,
  FileText,
  Video,
  Puzzle,
  School,
  Layers,
  Upload,
  Download,
  Eye,
  Trash2,
} from "lucide-react";

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

const resources = [
  {
    id: 1,
    title: "Understanding Fractions",
    subject: "Mathematics",
    grade: "Grade 4",
    type: "Video",
    size: "12:45",
    icon: "📊",
  },
  {
    id: 2,
    title: "Addition & Subtraction Worksheet",
    subject: "Mathematics",
    grade: "Grade 4",
    type: "PDF",
    size: "2 MB",
    icon: "📄",
  },
  {
    id: 3,
    title: "English Reading Practice",
    subject: "English",
    grade: "Grade 4",
    type: "PDF",
    size: "1.4 MB",
    icon: "📖",
  },
  {
    id: 4,
    title: "Plants and Growth",
    subject: "Life Skills",
    grade: "Grade 4",
    type: "Video",
    size: "08:30",
    icon: "🌱",
  },
  {
    id: 5,
    title: "Du'a & Surah Booklet",
    subject: "Islamic Studies",
    grade: "Grade 4",
    type: "PDF",
    size: "3.2 MB",
    icon: "🕌",
  },
  {
    id: 6,
    title: "Map Work & Directions",
    subject: "Social Sciences",
    grade: "Grade 4",
    type: "PDF",
    size: "1.8 MB",
    icon: "🗺️",
  },
];

export default function ResourcesPage() {
  const [selectedGrade, setSelectedGrade] = useState("Grade 4");
  const [search, setSearch] = useState("");

  const filteredResources = resources.filter(
    (resource) =>
      resource.grade === selectedGrade &&
      resource.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Learning Resources
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage worksheets, videos, PDFs and educational material.
          </p>
        </div>

        <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-800">
          <Upload size={18} />
          Upload Resource
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Resources"
          value="128"
          icon={<BookOpen />}
        />
        <StatCard
          title="Worksheets"
          value="74"
          icon={<FileText />}
        />
        <StatCard
          title="Videos"
          value="23"
          icon={<Video />}
        />
        <StatCard
          title="Activities"
          value="31"
          icon={<Puzzle />}
        />
      </div>

      {/* Main Layout */}
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Sidebar */}
        <div className="rounded-2xl border bg-white p-4">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">
            Browse By
          </h3>

          <nav className="space-y-2">
            <SidebarItem icon={<Layers size={18} />} active>
              All Resources
            </SidebarItem>

            <SidebarItem icon={<School size={18} />}>
              By Grade
            </SidebarItem>

            <SidebarItem icon={<Video size={18} />}>
              Videos
            </SidebarItem>

            <SidebarItem icon={<FileText size={18} />}>
              Worksheets
            </SidebarItem>

            <SidebarItem icon={<BookOpen size={18} />}>
              Documents
            </SidebarItem>

            <SidebarItem icon={<Puzzle size={18} />}>
              Activities
            </SidebarItem>
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Search */}
          <div className="rounded-2xl border bg-white p-4">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search resources..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>
          </div>

          {/* Grade Filters */}
          <div className="rounded-2xl border bg-white p-4">
            <div className="flex flex-wrap gap-2">
              {grades.map((grade) => (
                <button
                  key={grade}
                  onClick={() => setSelectedGrade(grade)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    selectedGrade === grade
                      ? "bg-slate-900 text-white"
                      : "border bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {grade}
                </button>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">
              Resources for {selectedGrade}
            </h2>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredResources.map((resource) => (
                <div
                  key={resource.id}
                  className="rounded-2xl border bg-white overflow-hidden hover:shadow-md transition"
                >
                  <div className="flex h-28 items-center justify-center bg-slate-100 text-4xl">
                    {resource.icon}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900">
                      {resource.title}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {resource.type} • {resource.size}
                    </p>

                    <p className="mt-2 text-xs font-semibold text-slate-700">
                      {resource.subject}
                    </p>

                    <div className="mt-4 flex gap-2">
                      <button className="rounded-lg border p-2 hover:bg-slate-100">
                        <Eye size={16} />
                      </button>

                      <button className="rounded-lg border p-2 hover:bg-slate-100">
                        <Download size={16} />
                      </button>

                      <button className="rounded-lg border p-2 text-red-600 hover:bg-red-50">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredResources.length === 0 && (
              <div className="rounded-2xl border bg-white p-10 text-center text-slate-500">
                No resources found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
        {icon}
      </div>

      <p className="text-sm text-slate-500">{title}</p>
      <h3 className="mt-1 text-3xl font-bold">{value}</h3>
    </div>
  );
}

function SidebarItem({ children, icon, active }) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
        active
          ? "bg-slate-900 text-white"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}