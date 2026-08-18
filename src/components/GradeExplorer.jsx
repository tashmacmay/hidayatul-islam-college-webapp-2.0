"use client";

import { useState } from "react";
import {
  BookOpen,
  Languages,
  Calculator,
  HeartHandshake,
  ScrollText,
} from "lucide-react";

const grades = {
  "Grade R": {
    phase: "Foundation Phase",
    age: "5–6",
    description:
      "Grade R introduces learners to structured learning through play, creativity, early literacy and numeracy development.",
  },

  "Grade 1": {
    phase: "Foundation Phase",
    age: "6–7",
    description:
      "Grade 1 marks the start of formal reading, writing and arithmetic while building confidence and independence.",
  },

  "Grade 2": {
    phase: "Foundation Phase",
    age: "7–8",
    description:
      "Grade 2 strengthens literacy, numeracy and critical thinking through engaging classroom activities.",
  },

  "Grade 3": {
    phase: "Foundation Phase",
    age: "8–9",
    description:
      "Grade 3 prepares learners for the Intermediate Phase while developing problem-solving and communication skills.",
  },

  "Grade 4": {
    phase: "Intermediate Phase",
    age: "9–10",
    description:
      "Grade 4 introduces more independent learning, expanded subject content and analytical thinking.",
  },

  "Grade 5": {
    phase: "Intermediate Phase",
    age: "10–11",
    description:
      "Grade 5 develops deeper understanding across subjects while encouraging responsibility and leadership.",
  },

  "Grade 6": {
    phase: "Intermediate Phase",
    age: "11–12",
    description:
      "Grade 6 focuses on critical thinking, research skills and preparation for senior primary learning.",
  },

  "Grade 7": {
    phase: "Senior Primary",
    age: "12–13",
    description:
      "Grade 7 prepares learners academically, socially and spiritually for the transition into high school.",
  },
};

const subjects = [
  {
    icon: <BookOpen className="h-5 w-5 text-gold" />,
    name: "Home Language",
  },
  {
    icon: <Languages className="h-5 w-5 text-gold" />,
    name: "First Additional Language",
  },
  {
    icon: <Calculator className="h-5 w-5 text-gold" />,
    name: "Mathematics",
  },
  {
    icon: <HeartHandshake className="h-5 w-5 text-gold" />,
    name: "Life Skills",
  },
  {
    icon: <BookOpen className="h-5 w-5 text-gold" />,
    name: "Islamic Studies",
  },
  {
    icon: <ScrollText className="h-5 w-5 text-gold" />,
    name: "Quran & Arabic",
  },
];

export default function GradeExplorer() {
  const [selectedGrade, setSelectedGrade] = useState("Grade 1");

  return (
    <section className="bg-gray-50 px-10 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[3px] text-gold">
            Explore By Grade
          </p>

          <h2 className="mt-3 text-5xl font-bold text-navy">
            From Grade R to Grade 7
          </h2>

          <div className="mx-auto mt-5 h-1 w-20 rounded-full bg-gold" />

          <p className="mx-auto mt-6 max-w-3xl leading-8 text-gray-600">
            Select a grade to see the focus areas, learning approach and
            subjects offered at each level.
          </p>
        </div>

        {/* Grade Filters */}

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {Object.keys(grades).map((grade) => (
            <button
              key={grade}
              onClick={() => setSelectedGrade(grade)}
              className={`rounded-full px-5 py-3 text-sm font-semibold transition-all duration-300
                ${
                  selectedGrade === grade
                    ? "bg-navy text-white shadow-lg"
                    : "bg-white text-navy shadow hover:bg-gold hover:text-navy"
                }`}
            >
              {grade}
            </button>
          ))}
        </div>

        {/* Grade Content */}

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl bg-navy p-10 text-white shadow-xl">
            <span className="rounded-full bg-gold px-4 py-2 text-xs font-bold text-navy">
              {grades[selectedGrade].phase}
            </span>

            <h3 className="mt-6 text-4xl font-bold">
              {selectedGrade}
            </h3>

            <p className="mt-2 text-gold font-medium">
              Ages {grades[selectedGrade].age}
            </p>

            <p className="mt-8 leading-8 text-blue-100">
              {grades[selectedGrade].description}
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm">
                Academic Excellence
              </span>

              <span className="rounded-full bg-white/10 px-4 py-2 text-sm">
                Character Building
              </span>

              <span className="rounded-full bg-white/10 px-4 py-2 text-sm">
                Islamic Values
              </span>

              <span className="rounded-full bg-white/10 px-4 py-2 text-sm">
                Holistic Growth
              </span>
            </div>
          </div>

          {/* Subjects */}

          <div className="rounded-3xl bg-white p-10 shadow-xl">
            <h3 className="text-2xl font-bold text-navy">
              Subjects
            </h3>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {subjects.map((subject) => (
                <div
                  key={subject.name}
                  className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 transition hover:bg-gold/10"
                >
                  {subject.icon}

                  <span className="font-medium text-navy">
                    {subject.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}