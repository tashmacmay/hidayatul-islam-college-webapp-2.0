
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Layers3,
  School,
  PlayCircle,
  FileSpreadsheet,
  FileText,
  Puzzle,
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

const categories = [
  { name: "All Resources", icon: Layers3 },
  { name: "By Grade", icon: School },
  { name: "Videos", icon: PlayCircle },
  { name: "Worksheets", icon: FileSpreadsheet },
  { name: "Documents", icon: FileText },
  { name: "Activities", icon: Puzzle },
];

const categoryMap = {
  Videos: "Video",
  Worksheets: "Worksheet",
  Documents: "Document",
  Activities: "Activity",
};

const resources = [
  {
    title: "Understanding Fractions",
    type: "Video",
    size: "12:45",
    grade: "Grade 4",
    subject: "Mathematics",
    emoji: "📊",
    gradient: "from-blue-900 to-blue-600",
    subjectColor: "text-blue-600",
  },
  {
    title: "Addition & Subtraction Worksheet",
    type: "Worksheet",
    size: "2 MB",
    grade: "Grade 4",
    subject: "Mathematics",
    emoji: "📄",
    gradient: "from-green-900 to-green-600",
    subjectColor: "text-blue-600",
  },
  {
    title: "English Reading Practice",
    type: "Document",
    size: "1.4 MB",
    grade: "Grade 4",
    subject: "English",
    emoji: "📖",
    gradient: "from-slate-800 to-slate-500",
    subjectColor: "text-green-600",
  },
  {
    title: "Plants and Growth",
    type: "Video",
    size: "08:30",
    grade: "Grade 4",
    subject: "Life Skills",
    emoji: "🌱",
    gradient: "from-purple-900 to-purple-500",
    subjectColor: "text-purple-600",
  },
  {
    title: "Du'a & Surah Booklet",
    type: "Document",
    size: "3.2 MB",
    grade: "Grade 4",
    subject: "Islamic Studies",
    emoji: "🕌",
    gradient: "from-teal-900 to-teal-500",
    subjectColor: "text-teal-700",
  },
  {
    title: "Map Work & Directions",
    type: "Worksheet",
    size: "1.8 MB",
    grade: "Grade 4",
    subject: "Social Sciences",
    emoji: "🗺️",
    gradient: "from-amber-900 to-amber-500",
    subjectColor: "text-amber-700",
  },
  {
    title: "Multiplication Tables",
    type: "Video",
    size: "09:15",
    grade: "Grade 4",
    subject: "Mathematics",
    emoji: "🔢",
    gradient: "from-blue-900 to-blue-600",
    subjectColor: "text-blue-600",
  },
  {
    title: "Creative Writing Prompts",
    type: "Activity",
    size: "0.8 MB",
    grade: "Grade 4",
    subject: "English",
    emoji: "✍️",
    gradient: "from-green-900 to-green-600",
    subjectColor: "text-green-600",
  },
];

export default function ResourcesPage() {
  const [selectedGrade, setSelectedGrade] = useState("Grade 4");
  const [selectedCategory, setSelectedCategory] =
    useState("All Resources");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesGrade =
        resource.grade === selectedGrade;

      const matchesCategory =
        selectedCategory === "All Resources" ||
        selectedCategory === "By Grade" ||
        resource.type === categoryMap[selectedCategory];

      const matchesSearch =
        resource.title
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        resource.subject
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      return (
        matchesGrade &&
        matchesCategory &&
        matchesSearch
      );
    });
  }, [selectedGrade, selectedCategory, searchTerm]);

  return (
    <div className="p-7">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#0d2260]">
            Learning Resources
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Worksheets, videos, and educational
            materials for your child.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-[#f7f8fc] px-4 py-2">
          <Search
            size={16}
            className="text-slate-400"
          />

          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            className="w-52 bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-44 shrink-0">
          <div className="rounded-xl border border-slate-200 bg-white p-2">
            <div className="px-3 pb-2 pt-2 text-[10px] font-bold uppercase tracking-[1.2px] text-slate-500">
              Browse By
            </div>

            <div className="space-y-1">
              {categories.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.name}
                    onClick={() =>
                      setSelectedCategory(item.name)
                    }
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                      selectedCategory === item.name
                        ? "bg-[#edf2ff] font-semibold text-[#0d2260]"
                        : "text-slate-500 hover:bg-slate-50 hover:text-[#0d2260]"
                    }`}
                  >
                    <Icon size={16} />
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Grade Filter */}
          <div className="mb-5 flex flex-wrap gap-2">
            <span className="self-center text-xs font-semibold text-slate-500">
              By Grade:
            </span>

            {grades.map((grade) => (
              <button
                key={grade}
                onClick={() =>
                  setSelectedGrade(grade)
                }
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                  selectedGrade === grade
                    ? "border-[#0d2260] bg-[#0d2260] text-[#c9a227]"
                    : "border-slate-200 bg-white text-[#0d2260] hover:bg-slate-50"
                }`}
              >
                {grade}
              </button>
            ))}
          </div>

          <h2 className="mb-4 font-serif text-lg font-bold text-[#0d2260]">
            Resources for {selectedGrade}
          </h2>

          {/* Resource Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {filteredResources.map((resource) => (
              <button
                key={resource.title}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white text-left transition-all hover:-translate-y-1 hover:border-[#c9a227]/40 hover:shadow-md"
              >
                <div
                  className={`flex h-[90px] items-center justify-center bg-gradient-to-br ${resource.gradient} text-4xl`}
                >
                  {resource.emoji}
                </div>

                <div className="p-3">
                  <h3 className="text-sm font-semibold leading-snug text-[#0d2260]">
                    {resource.title}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    {resource.type} • {resource.size}
                  </p>

                  <p
                    className={`mt-2 text-[11px] font-bold ${resource.subjectColor}`}
                  >
                    {resource.subject}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {filteredResources.length === 0 && (
            <div className="mt-10 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="font-medium text-slate-500">
                No resources found.
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <button className="text-sm font-semibold text-blue-600 hover:underline">
              View all {selectedGrade} resources ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


