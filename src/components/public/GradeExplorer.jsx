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
  const className = "h-5 w-5 text-gold";
  if (/English|Afrikaans|Literacy/.test(subject)) return <Languages className={className} />;
  if (/Mathematics|Numeracy/.test(subject)) return <Calculator className={className} />;
  if (/Life Skills|Well-being/.test(subject)) return <HeartHandshake className={className} />;
  if (/Islamic Studies|Art/.test(subject)) return <BookOpen className={className} />;
  return <ScrollText className={className} />;
}

export default function GradeExplorer() {
  const [selectedGrade, setSelectedGrade] = useState("Grade 1");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);

  function openSubject(subject, event) {
    triggerRef.current = event.currentTarget;
    setSelectedSubject(subject);
    dialogRef.current?.showModal();
  }

  function closeSubjectDialog() {
    const dialog = dialogRef.current;
    if (!dialog?.open) return;
    dialog.close();
    handleDialogClose();
  }

  function handleDialogClose() {
    const trigger = triggerRef.current;
    triggerRef.current = null;
    setSelectedSubject(null);
    trigger?.focus();
  }

  function handleDialogCancel(event) {
    event.preventDefault();
    closeSubjectDialog();
  }

  function handleDialogKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeSubjectDialog();
    }
  }

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
            Select a grade to view the subjects listed for its phase.
          </p>
        </div>

        {/* Grade Filters */}

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {Object.keys(gradePhases).map((grade) => (
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
              {phaseNames[gradePhases[selectedGrade]]}
            </span>

            <h3 className="mt-6 text-4xl font-bold">
              {selectedGrade}
            </h3>

            <p className="mt-8 leading-8 text-blue-100">
              {gradeDescriptions[selectedGrade]}
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm">
                Reading
              </span>

              <span className="rounded-full bg-white/10 px-4 py-2 text-sm">
                Writing
              </span>

              <span className="rounded-full bg-white/10 px-4 py-2 text-sm">
                Arithmetic
              </span>
            </div>
          </div>

          {/* Subjects */}

          <div className="rounded-3xl bg-white p-10 shadow-xl">
            <h3 className="text-2xl font-bold text-navy">
              Subjects
            </h3>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {phaseSubjects[gradePhases[selectedGrade]].map((subject) => (
                <button
                  key={subject}
                  type="button"
                  aria-haspopup="dialog"
                  aria-controls="subject-overview-dialog"
                  onClick={(event) => openSubject(subject, event)}
                  className="flex w-full items-center gap-3 rounded-xl bg-gray-50 p-4 text-left transition hover:bg-gold/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                >
                  <span aria-hidden="true">{subjectIcon(subject)}</span>

                  <span className="font-medium text-navy">
                    {subject}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <dialog
        id="subject-overview-dialog"
        ref={dialogRef}
        aria-labelledby="subject-dialog-title"
        aria-describedby="subject-dialog-description"
        onClose={handleDialogClose}
        onCancel={handleDialogCancel}
        onKeyDown={handleDialogKeyDown}
        className="m-auto max-h-[85vh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-2xl border-2 border-gold bg-white p-0 text-navy shadow-2xl backdrop:bg-navy/70"
      >
        {selectedSubject && (
          <div>
            <div className="flex items-start justify-between gap-5 bg-navy p-6 text-white sm:p-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[3px] text-gold">
                  {selectedGrade === "Grade 7"
                    ? selectedGrade
                    : `${selectedGrade} · ${phaseNames[gradePhases[selectedGrade]]}`}
                </p>
                <h2
                  id="subject-dialog-title"
                  className="mt-3 text-2xl font-bold sm:text-3xl"
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
            <div className="p-6 sm:p-8">
              <p
                id="subject-dialog-description"
                className="text-sm leading-7 text-gray-700 sm:text-base"
              >
                {subjectOverviews[selectedSubject]}
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
