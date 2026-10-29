"use client";

import { useRef, useState } from "react";
import {
  BookOpen,
  Languages,
  Calculator,
  HeartHandshake,
  ScrollText,
  X,
} from "lucide-react";

const gradePhases = {
  "Grade R": "foundation",
  "Grade 1": "foundation",
  "Grade 2": "foundation",
  "Grade 3": "foundation",
  "Grade 4": "intermediate",
  "Grade 5": "intermediate",
  "Grade 6": "intermediate",
  "Grade 7": "grade7",
};

const gradeDescriptions = {
  "Grade R":
    "Grade R introduces learners to structured learning through play, creativity, early literacy and numeracy development.",
  "Grade 1":
    "Grade 1 marks the start of formal reading, writing and arithmetic while building confidence and independence.",
  "Grade 2":
    "Grade 2 strengthens literacy, numeracy and critical thinking through engaging classroom activities.",
  "Grade 3":
    "Grade 3 prepares learners for the Intermediate Phase while developing problem-solving and communication skills.",
  "Grade 4":
    "Grade 4 introduces more independent learning, expanded subject content and analytical thinking.",
  "Grade 5":
    "Grade 5 develops deeper understanding across subjects while encouraging responsibility and leadership.",
  "Grade 6":
    "Grade 6 focuses on critical thinking, research skills and preparation for senior primary learning.",
  "Grade 7":
    "Grade 7 prepares learners academically, socially and spiritually for the transition into high school.",
};

const phaseSubjects = {
  foundation: [
    "Literacy",
    "Numeracy",
    "Mathematics",
    "Life Skills",
    "Islamic Studies",
    "Art",
  ],
  intermediate: [
    "English Home Language",
    "Afrikaans First Additional Language",
    "Mathematics",
    "Natural Science and Technology",
    "Social Science",
    "Life Skills",
    "Islamic Studies",
  ],
  grade7: [
    "English Home Language",
    "Afrikaans First Additional Language",
    "Mathematics",
    "Natural Science",
    "Technology",
    "Economic and Management Science",
    "Social Science",
    "Creative Arts",
    "Life Orientation",
    "Islamic Studies",
    "Art",
  ],
};

const phaseNames = {
  foundation: "Foundation Phase",
  intermediate: "Intermediate Phase",
  grade7: "Grade 7",
};

const subjectOverviews = {
  Literacy:
    "Literacy develops the reading and writing skills learners use to understand, interpret and communicate ideas.",
  Numeracy:
    "Numeracy builds confidence working with numbers, quantities, patterns and everyday mathematical ideas.",
  Mathematics:
    "Mathematics develops understanding of numbers, operations, patterns, measurement, space and data.",
  "Life Skills":
    "Life Skills supports learners’ personal and social development, wellbeing and participation in everyday life.",
  "Islamic Studies":
    "The Islamic syllabus includes Fiqh, Islamic History, Adaab and Akhlaaq, daily duahs and selected Surahs.",
  Art:
    "Art gives learners opportunities to explore and communicate ideas through visual forms, materials and creative choices.",
  "English Home Language":
    "English Home Language develops listening, speaking, reading, writing and language skills through the home-language curriculum.",
  "Afrikaans First Additional Language":
    "Afrikaans First Additional Language develops communication, reading, writing and language skills in an additional language.",
  "Natural Science and Technology":
    "Natural Science and Technology explores the natural world and how people use knowledge, materials and design to solve problems.",
  "Social Science":
    "Social Science introduces learners to people, places and the past through geography and history.",
  "Natural Science":
    "Natural Science explores the natural world, including living things, materials, energy and the environment.",
  Technology:
    "Technology develops understanding of design, materials, structures and systems, and how solutions can meet needs.",
  "Economic and Management Science":
    "Economic and Management Science introduces economic and financial ideas and how people manage resources.",
  "Creative Arts":
    "Creative Arts encourages expression and exploration through visual art, movement, music and drama.",
  "Life Orientation":
    "Life Orientation supports personal and social wellbeing, physical development and responsible participation in society.",
};

function subjectIcon(subject) {
  const className = "h-5 w-5 shrink-0 text-gold";

  if (/English|Afrikaans|Literacy/.test(subject)) {
    return <Languages aria-hidden="true" className={className} />;
  }

  if (/Mathematics|Numeracy/.test(subject)) {
    return <Calculator aria-hidden="true" className={className} />;
  }

  if (/Life Skills|Well-being/.test(subject)) {
    return <HeartHandshake aria-hidden="true" className={className} />;
  }

  if (/Islamic Studies|Art/.test(subject)) {
    return <BookOpen aria-hidden="true" className={className} />;
  }

  return <ScrollText aria-hidden="true" className={className} />;
}

export default function GradeExplorer() {
  const [selectedGrade, setSelectedGrade] = useState("Grade 1");
  const [selectedSubject, setSelectedSubject] = useState(null);

  const dialogRef = useRef(null);
  const triggerRef = useRef(null);

  const selectedPhase = gradePhases[selectedGrade];
  const subjects = phaseSubjects[selectedPhase];

  function openSubject(subject, event) {
    triggerRef.current = event.currentTarget;
    setSelectedSubject(subject);

    if (dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    }
  }

  function handleDialogClose() {
    const trigger = triggerRef.current;

    triggerRef.current = null;
    setSelectedSubject(null);

    if (trigger?.isConnected) {
      trigger.focus();
    }
  }

  function closeSubjectDialog() {
    if (dialogRef.current?.open) {
      dialogRef.current.close();
    }
  }

  function handleDialogCancel(event) {
    event.preventDefault();
    closeSubjectDialog();
  }

  return (
    <section className="section-shell !pt-6 !pb-12 bg-gray-50 md:!pt-8 md:!pb-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">
            Explore By Grade
          </p>

          <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">
            From Grade R to Grade 7
          </h2>

          <div className="mx-auto mt-5 h-1 w-20 rounded-full bg-gold" />

          <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-gray-600 sm:text-base sm:leading-8">
            Select a grade to explore its phase and click any subject to learn
            more about what learners study.
          </p>
        </div>

        {/* Grade filters */}
        <div className="relative z-10 mt-8 flex flex-wrap justify-center gap-2 sm:mt-10 sm:gap-3">
          {Object.keys(gradePhases).map((grade) => (
            <button
              key={grade}
              type="button"
              onClick={() => setSelectedGrade(grade)}
              aria-pressed={selectedGrade === grade}
              className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 sm:px-5 sm:py-3 ${
                selectedGrade === grade
                  ? "bg-navy text-white shadow-lg"
                  : "bg-white text-navy shadow hover:bg-gold hover:text-navy"
              }`}
            >
              {grade}
            </button>
          ))}
        </div>

        {/* Selected grade and subjects */}
        <div className="mt-8 grid gap-6 sm:mt-10 lg:mt-12 lg:grid-cols-2 lg:gap-8">
          <div className="rounded-3xl bg-navy p-6 text-white shadow-xl sm:p-8 md:p-10">
            <span className="inline-block rounded-full bg-gold px-4 py-2 text-xs font-bold text-navy">
              {phaseNames[selectedPhase]}
            </span>

            <h3 className="mt-6 text-3xl font-bold sm:text-4xl">
              {selectedGrade}
            </h3>

            <p className="mt-6 text-sm leading-7 text-blue-100 sm:mt-8 sm:text-base sm:leading-8">
              {gradeDescriptions[selectedGrade]}
            </p>

            <div className="mt-8 flex flex-wrap gap-2 sm:mt-10 sm:gap-3">
              {["Reading", "Writing", "Arithmetic"].map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-white/10 px-4 py-2 text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-xl sm:p-8 md:p-10">
            <h3 className="text-2xl font-bold text-navy">Subjects</h3>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Select a subject to view its overview.
            </p>

            <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4">
              {subjects.map((subject) => (
                <button
                  key={subject}
                  type="button"
                  aria-haspopup="dialog"
                  aria-controls="subject-overview-dialog"
                  onClick={(event) => openSubject(subject, event)}
                  className="flex min-w-0 w-full items-center gap-3 rounded-xl bg-gray-50 p-3 text-left transition hover:bg-gold/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 sm:p-4"
                >
                  {subjectIcon(subject)}

                  <span className="min-w-0 text-sm font-medium leading-6 text-navy sm:text-base">
                    {subject}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Subject overview modal */}
      <dialog
        id="subject-overview-dialog"
        ref={dialogRef}
        aria-labelledby="subject-dialog-title"
        aria-describedby="subject-dialog-description"
        onClose={handleDialogClose}
        onCancel={handleDialogCancel}
        className="m-auto max-h-[85vh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-2xl border-2 border-gold bg-white p-0 text-navy shadow-2xl backdrop:bg-navy/70"
      >
        {selectedSubject && (
          <div>
            <div className="flex items-start justify-between gap-4 bg-navy p-5 text-white sm:gap-5 sm:p-8">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-gold">
                  {selectedGrade === "Grade 7"
                    ? selectedGrade
                    : `${selectedGrade} · ${phaseNames[selectedPhase]}`}
                </p>

                <h2
                  id="subject-dialog-title"
                  className="mt-3 break-words text-2xl font-bold sm:text-3xl"
                >
                  {selectedSubject}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeSubjectDialog}
                aria-label={`Close ${selectedSubject} overview`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-gold transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 sm:p-8">
              <p
                id="subject-dialog-description"
                className="text-sm leading-7 text-gray-700 sm:text-base"
              >
                {subjectOverviews[selectedSubject] ??
                  `${selectedSubject} forms part of the learning programme for ${selectedGrade}.`}
              </p>

              <button
                type="button"
                onClick={closeSubjectDialog}
                className="mt-7 rounded-xl bg-gold px-6 py-3 text-sm font-semibold text-navy transition hover:bg-gold/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
