"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BookOpen,
  Calculator,
  HeartHandshake,
  Languages,
  MapPin,
  ScrollText,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";

const gradeData = {
  "Grade R": {
    phase: "Foundation Phase",
    age: "5–6",
    description:
      "Our Grade R programme lays the crucial foundation for formal schooling through play-based, exploratory learning. Children develop early literacy, numeracy, and social skills in a warm, nurturing environment that honours their natural curiosity.",
    heading: "Learning areas",
    subjects: [
      "Language & Literacy",
      "Mathematics",
      "Life Skills & Arts",
      "Islamic Studies",
      "Quran & Du'a",
      "Physical Development",
    ],
  },
  "Grade 1": {
    phase: "Foundation Phase",
    age: "6–7",
    description:
      "Grade 1 marks the start of formal reading, writing, and arithmetic. Our approach balances structured lessons with active, creative exploration, ensuring each child builds confidence in their abilities from the very first year.",
    heading: "Subjects",
    subjects: [
      "Home Language",
      "First Addl. Language",
      "Mathematics",
      "Life Skills",
      "Islamic Studies",
      "Quran & Arabic",
    ],
  },
  "Grade 2": {
    phase: "Foundation Phase",
    age: "7–8",
    description:
      "In Grade 2 learners consolidate their reading and number skills, moving from decoding text to reading for meaning, and from counting to calculating. Islamic studies deepens with a focus on Aqeedah and daily practice.",
    heading: "Subjects",
    subjects: [
      "Home Language",
      "First Addl. Language",
      "Mathematics",
      "Life Skills",
      "Islamic Studies",
      "Quran & Arabic",
    ],
  },
  "Grade 3": {
    phase: "Foundation Phase",
    age: "8–9",
    description:
      "Grade 3 is the culmination of the Foundation Phase. Learners are assessed via the Annual National Assessment framework, demonstrating proficiency in literacy and numeracy. Seerah (prophetic history) is introduced in Islamic Studies.",
    heading: "Subjects",
    subjects: [
      "Home Language",
      "First Addl. Language",
      "Mathematics",
      "Life Skills",
      "Islamic Studies",
      "Quran & Arabic",
    ],
  },
  "Grade 4": {
    phase: "Intermediate Phase",
    age: "9–10",
    description:
      "The transition to Intermediate Phase introduces a wider range of subjects. Learners move from learning to read to reading to learn, and encounter Social Sciences and Natural Sciences as distinct disciplines for the first time.",
    heading: "Subjects",
    subjects: [
      "Home Language",
      "First Addl. Language",
      "Mathematics",
      "Social Sciences",
      "Natural Sciences",
      "Life Skills",
      "Islamic Studies",
      "Quran & Arabic",
    ],
  },
  "Grade 5": {
    phase: "Intermediate Phase",
    age: "10–11",
    description:
      "Grade 5 deepens learners’ engagement with the full range of Intermediate Phase subjects. Independent thinking, structured writing, and mathematical reasoning are emphasised. Quran memorisation goals are set for each learner individually.",
    heading: "Subjects",
    subjects: [
      "Home Language",
      "First Addl. Language",
      "Mathematics",
      "Social Sciences",
      "Natural Sciences",
      "Life Skills",
      "Islamic Studies",
      "Quran & Arabic",
    ],
  },
  "Grade 6": {
    phase: "Intermediate Phase",
    age: "11–12",
    description:
      "Grade 6 marks the end of the Intermediate Phase and begins preparing learners for the Senior Phase. Academic expectations rise, and learners are encouraged to take ownership of their learning. Our Grade 6 class has produced regional maths olympiad finalists.",
    heading: "Subjects",
    subjects: [
      "Home Language",
      "First Addl. Language",
      "Mathematics",
      "Social Sciences",
      "Natural Sciences",
      "EMS",
      "Islamic Studies",
      "Quran & Arabic",
    ],
  },
  "Grade 7": {
    phase: "Senior Primary",
    age: "12–13",
    description:
      "Grade 7 is our Senior Phase and the culmination of a learner’s primary school journey at HIC. Learners are thoroughly prepared for high school, with strong academic foundations, self-discipline, and the character and values instilled through years of Islamic education.",
    heading: "Subjects",
    subjects: [
      "Home Language",
      "First Addl. Language",
      "Mathematics",
      "Social Sciences",
      "Natural Sciences",
      "EMS",
      "Technology",
      "Islamic Studies",
      "Quran & Arabic",
      "Creative Arts",
    ],
  },
};

const subjectIcons = {
  "Language & Literacy": <BookOpen className="h-5 w-5 text-gold" />,
  "Home Language": <BookOpen className="h-5 w-5 text-gold" />,
  "First Addl. Language": <Languages className="h-5 w-5 text-gold" />,
  Mathematics: <Calculator className="h-5 w-5 text-gold" />,
  "Life Skills & Arts": <HeartHandshake className="h-5 w-5 text-gold" />,
  "Life Skills": <HeartHandshake className="h-5 w-5 text-gold" />,
  "Islamic Studies": <BookOpen className="h-5 w-5 text-gold" />,
  "Quran & Du'a": <ScrollText className="h-5 w-5 text-gold" />,
  "Quran & Arabic": <ScrollText className="h-5 w-5 text-gold" />,
  "Physical Development": <HeartHandshake className="h-5 w-5 text-gold" />,
  "Social Sciences": <BookOpen className="h-5 w-5 text-gold" />,
  "Natural Sciences": <BookOpen className="h-5 w-5 text-gold" />,
  EMS: <Calculator className="h-5 w-5 text-gold" />,
  Technology: <Calculator className="h-5 w-5 text-gold" />,
  "Creative Arts": <HeartHandshake className="h-5 w-5 text-gold" />,
};

function GradeExplorer() {
  const [selectedGrade, setSelectedGrade] = useState("Grade 1");
  const selectedData = gradeData[selectedGrade];

  return (
    <section className="bg-gray-50 px-10 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[3px] text-gold">
            Explore By Grade
          </p>

          <h2 className="mt-3 text-xl font-bold leading-tight text-navy md:text-2xl">
            From Grade R to Grade 7
          </h2>

          <div className="mx-auto mt-5 h-1 w-20 rounded-full bg-gold" />

          <p className="mx-auto mt-6 max-w-3xl leading-8 text-gray-600">
            Select a grade to see the focus areas, learning approach and
            subjects offered at each level.
          </p>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {Object.keys(gradeData).map((grade) => (
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

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl bg-navy p-10 text-white shadow-xl">
            <span className="rounded-full bg-gold px-4 py-2 text-xs font-bold text-navy">
              {selectedData.phase}
            </span>

            <h3 className="mt-6 text-lg font-semibold">
              {selectedGrade}
            </h3>

            <p className="mt-2 text-gold font-medium">
              Ages {selectedData.age}
            </p>

            <p className="mt-8 leading-8 text-blue-100">
              {selectedData.description}
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

          <div className="rounded-3xl bg-white p-10 shadow-xl">
            <h3 className="text-lg font-semibold text-navy">
              {selectedData.heading}
            </h3>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {selectedData.subjects.map((subject) => (
                <div
                  key={subject}
                  className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 transition hover:bg-gold/10"
                >
                  {subjectIcons[subject]}
                  <span className="font-medium text-navy">{subject}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Academics() {
  return (
    <>
      {/* Hero Section */}

      <section className="relative flex min-h-[320px] items-end overflow-hidden bg-navy md:min-h-[340px]">

        <img
          src="/images/HIC-image2.jpg"
          alt="Academics"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/80 to-navy/45" />
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:18px_18px]" />

        <div className="relative z-10 w-full px-6 pb-10 md:px-16 md:pb-[52px]">

          <p className="mb-3.5 flex items-center gap-2 text-[9px] text-blue-200 md:text-[10px]">
            <Link href="/" className="text-gold-light transition-colors hover:text-gold">
              Home
            </Link>
            <span className="text-navy-dark">›</span>
            <span className="text-blue-200/75">Academics</span>
          </p>

          <div className="mb-5 h-[3px] w-[60px] rounded-full bg-gold" />

          <h1 className="mb-3 font-serif text-2xl font-bold leading-tight text-white md:text-[28px]">
            Our <span className="text-gold">Academics</span>
          </h1>

          <p className="max-w-[560px] text-sm leading-7 text-blue-100">
            A balanced, enriching curriculum that combines the South African
            national programme with Islamic studies, preparing every learner
            for life in all its dimensions.
          </p>

        </div>

      </section>

      {/* Curriculum Overview */}

      <section className="bg-white px-6 py-20 md:px-10 md:py-24">

        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-start">

          <div>

            <p className="text-xs font-semibold uppercase tracking-[3px] text-gold">
              Our Curriculum
            </p>

            <h2 className="mt-3 text-xl font-bold leading-tight text-navy md:text-2xl">
              A Whole-Child
              <span className="block">
                Education
              </span>
            </h2>

            <div className="mt-5 h-1 w-20 rounded-full bg-gold" />

            <p className="mt-8 leading-8 text-gray-600">
              At Hidayatul Islam College, we follow the South African national
              curriculum as prescribed by the Department of Basic Education,
              offering the full Grades R through 7 programme.
            </p>

            <p className="mt-6 leading-8 text-gray-600">
              This is enriched by a comprehensive Islamic studies curriculum,
              ensuring our learners develop academically and spiritually in
              equal measure.
            </p>

            <p className="mt-6 leading-8 text-gray-600">
              We believe that excellence in secular knowledge and excellence in
              Islamic knowledge are not in competition — they are two wings of
              the same bird.
            </p>

          </div>

          <div className="rounded-2xl bg-navy p-8 text-white shadow-lg md:p-10">

            <p className="text-xs font-semibold uppercase tracking-[3px] text-gold">
              National Curriculum (CAPS)
            </p>

            <h3 className="mt-4 text-lg font-semibold">
              DoE-Registered Subjects
            </h3>

            <ul className="mt-6 space-y-3 text-sm text-blue-100">
              <li><span className="mr-2 text-gold">•</span>Home Language (English / Afrikaans)</li>
              <li><span className="mr-2 text-gold">•</span>First Additional Language</li>
              <li><span className="mr-2 text-gold">•</span>Mathematics</li>
              <li><span className="mr-2 text-gold">•</span>Life Skills / Social Sciences</li>
              <li><span className="mr-2 text-gold">•</span>Natural Sciences & Technology</li>
              <li><span className="mr-2 text-gold">•</span>Economic & Management Sciences</li>
            </ul>

            <div className="mt-10 border-t border-white/20 pt-8">

              <p className="text-xs font-semibold uppercase tracking-[3px] text-gold">
                Islamic Enrichment
              </p>

              <h3 className="mt-4 text-lg font-semibold">
                Faith & Character Subjects
              </h3>

              <ul className="mt-6 space-y-3 text-sm text-blue-100">
                <li><span className="mr-2 text-gold">•</span>Islamic Studies (Fiqh, Aqeedah, Seerah)</li>
                <li><span className="mr-2 text-gold">•</span>Quran Recitation & Memorisation</li>
                <li><span className="mr-2 text-gold">•</span>Arabic Language</li>
                <li><span className="mr-2 text-gold">•</span>Islamic History & Ethics</li>
                <li><span className="mr-2 text-gold">•</span>Du'a and Salah</li>
              </ul>

            </div>

          </div>

        </div>

      </section>
      {/* Grade Explorer */}

<GradeExplorer />

{/* Islamic Studies Programme */}

<section className="bg-navy px-6 py-20 text-white md:px-10 md:py-24">

  <div className="mx-auto max-w-6xl">

    <div className="text-center">

      <p className="text-xs font-semibold uppercase tracking-[3px] text-gold">
        Faith & Knowledge
      </p>

      <h2 className="mt-3 text-xl font-bold leading-tight md:text-2xl">
        Islamic Studies Programme
      </h2>

      <div className="mx-auto mt-5 h-1 w-20 rounded-full bg-gold" />

      <p className="mx-auto mt-6 max-w-3xl leading-7 text-blue-100">
        Our Islamic curriculum runs alongside the national programme from
        Grade R to Grade 7, nurturing learners who are grounded in their
        faith and equipped for the world.
      </p>

    </div>

    <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <BookOpen className="h-5 w-5 text-gold" />
        <h3 className="text-base font-semibold text-gold">
          Quran Recitation & Hifz
        </h3>
        <p className="mt-3 text-sm leading-6 text-blue-100">
          Daily Quran lessons focus on Tajweed, understanding and
          memorisation.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <ShieldCheck className="h-5 w-5 text-gold" />
        <h3 className="text-base font-semibold text-gold">
          Aqeedah & Fiqh
        </h3>
        <p className="mt-3 text-sm leading-6 text-blue-100">
          Foundational Islamic theology and jurisprudence for everyday life.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <Star className="h-5 w-5 text-gold" />
        <h3 className="text-base font-semibold text-gold">
          Seerah & Islamic History
        </h3>
        <p className="mt-3 text-sm leading-6 text-blue-100">
          Inspiring lessons from the life of the Prophet ﷺ and Islamic
          civilisation.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <Languages className="h-5 w-5 text-gold" />
        <h3 className="text-base font-semibold text-gold">
          Arabic Language
        </h3>
        <p className="mt-3 text-sm leading-6 text-blue-100">
          Reading, writing and conversational Arabic taught progressively.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <HeartHandshake className="h-5 w-5 text-gold" />
        <h3 className="text-base font-semibold text-gold">
          Akhlaq & Character
        </h3>
        <p className="mt-3 text-sm leading-6 text-blue-100">
          Islamic ethics and good character integrated into daily school life.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <MapPin className="h-5 w-5 text-gold" />
        <h3 className="text-base font-semibold text-gold">
          Salah & Daily Practice
        </h3>
        <p className="mt-3 text-sm leading-6 text-blue-100">
          Practical worship, du'a and daily Islamic habits reinforced
          throughout the school day.
        </p>
      </div>

    </div>

  </div>

</section>
{/* Teaching Philosophy */}

<section className="bg-white px-6 py-20 md:px-10 md:py-24">

  <div className="mx-auto max-w-6xl">

    <div className="text-center">

      <p className="text-xs font-semibold uppercase tracking-[3px] text-gold">
        How We Teach
      </p>

      <h2 className="mt-3 text-xl font-bold leading-tight text-navy md:text-2xl">
        Our Teaching Philosophy
      </h2>

      <div className="mx-auto mt-5 h-1 w-20 rounded-full bg-gold" />

      <p className="mx-auto mt-6 max-w-3xl leading-7 text-gray-600">
        We draw on evidence-based pedagogical approaches and Islamic
        educational traditions to create classrooms where every learner
        is seen, heard, and challenged.
      </p>

    </div>

    <div className="mt-12 grid gap-5 md:grid-cols-2">

      <div className="rounded-2xl border border-gold/20 bg-off-white p-7 shadow-sm">

        <span className="text-2xl font-bold text-gold/30">01</span>

        <h3 className="mt-3 text-base font-semibold text-navy">
          Differentiated Instruction
        </h3>

        <p className="mt-3 text-sm leading-7 text-gray-600">
          Our educators plan lessons that meet learners where they are,
          adapting teaching strategies to ensure every child can thrive.
        </p>

      </div>

      <div className="rounded-2xl border border-gold/20 bg-off-white p-7 shadow-sm">

        <span className="text-2xl font-bold text-gold/30">02</span>

        <h3 className="mt-3 text-base font-semibold text-navy">
          Values-Integrated Learning
        </h3>

        <p className="mt-3 text-sm leading-7 text-gray-600">
          Islamic values are woven throughout the curriculum, shaping
          character alongside academic growth.
        </p>

      </div>

      <div className="rounded-2xl border border-gold/20 bg-off-white p-7 shadow-sm">

        <span className="text-2xl font-bold text-gold/30">03</span>

        <h3 className="mt-3 text-base font-semibold text-navy">
          Active & Collaborative Learning
        </h3>

        <p className="mt-3 text-sm leading-7 text-gray-600">
          Learners participate through discussion, teamwork, projects,
          presentations and hands-on activities.
        </p>

      </div>

      <div className="rounded-2xl border border-gold/20 bg-off-white p-7 shadow-sm">

        <span className="text-2xl font-bold text-gold/30">04</span>

        <h3 className="mt-3 text-base font-semibold text-navy">
          Parent & Community Partnership
        </h3>

        <p className="mt-3 text-sm leading-7 text-gray-600">
          We work closely with parents to support every learner's
          educational journey both at school and at home.
        </p>

      </div>

    </div>

  </div>

</section>

{/* Languages at HIC */}

<section className="bg-off-white px-6 py-20 md:px-10 md:py-24">

  <div className="mx-auto max-w-6xl">

    <div className="text-center">

      <p className="text-xs font-semibold uppercase tracking-[3px] text-gold">
        Language of Learning
      </p>

      <h2 className="mt-3 text-xl font-bold leading-tight text-navy md:text-2xl">
        Languages at HIC
      </h2>

      <div className="mx-auto mt-5 h-1 w-20 rounded-full bg-gold" />

      <p className="mx-auto mt-6 max-w-3xl leading-7 text-gray-600">
        We honour the multilingual identities of our learners while
        providing strong foundations in English, Afrikaans and Arabic.
      </p>

    </div>

    <div className="mt-12 grid gap-5 md:grid-cols-3">

      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">

        <div className="text-2xl">🇿🇦</div>

        <h3 className="mt-4 text-base font-semibold text-navy">
          English
        </h3>

        <p className="mt-2 text-gold font-semibold">
          Home Language / FAL
        </p>

        <p className="mt-4 text-sm leading-7 text-gray-600">
          English serves as the primary language of learning and teaching,
          developing strong reading, writing and communication skills.
        </p>

      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">

        <div className="text-2xl">🇿🇦</div>

        <h3 className="mt-4 text-base font-semibold text-navy">
          Afrikaans
        </h3>

        <p className="mt-2 text-gold font-semibold">
          First Additional Language
        </p>

        <p className="mt-4 text-sm leading-7 text-gray-600">
          Afrikaans is offered as a First Additional Language,
          recognising its importance in our local context.
        </p>

      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">

        <div className="text-2xl">🕌</div>

        <h3 className="mt-4 text-base font-semibold text-navy">
          Arabic
        </h3>

        <p className="mt-2 text-gold font-semibold">
          Islamic & Quran Studies
        </p>

        <p className="mt-4 text-sm leading-7 text-gray-600">
          Arabic is taught from Grade R as both a language of worship
          and a gateway to understanding the Quran.
        </p>

      </div>

    </div>

  </div>

</section>
{/* Assessment & Reporting */}

<section className="bg-gold-pale px-6 py-20 md:px-10 md:py-24">

  <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-start">

    <div>

      <p className="text-xs font-semibold uppercase tracking-[3px] text-gold">
        How We Track Progress
      </p>

      <h2 className="mt-3 text-xl font-bold leading-tight text-navy md:text-2xl">
        Assessment & Reporting
      </h2>

      <div className="mt-5 h-1 w-20 rounded-full bg-gold" />

      <p className="mt-8 leading-7 text-gray-600">
        Assessment at Hidayatul Islam College is continuous, formative,
        and designed to support learning — not just measure it.
      </p>

      <p className="mt-6 leading-7 text-gray-600">
        We follow CAPS assessment requirements while also tracking
        learners' growth in Islamic character, leadership and personal
        development.
      </p>

      <p className="mt-6 leading-7 text-gray-600">
        Parents receive regular progress reports and have opportunities
        to engage directly with teachers throughout the year.
      </p>

    </div>

    <div className="space-y-3">

      <div className="rounded-xl border border-gold/20 bg-white p-5 shadow-sm">
        <BookOpen className="h-5 w-5 text-navy" />
        <h3 className="font-bold text-navy">
          Continuous Assessment (CASS)
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Projects, class activities, oral tasks and written work
          contribute to term marks.
        </p>
      </div>

      <div className="rounded-xl border border-gold/20 bg-white p-5 shadow-sm">
        <ShieldCheck className="h-5 w-5 text-navy" />
        <h3 className="font-bold text-navy">
          Formal Examinations
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Mid-year and end-of-year examinations prepare learners for
          future academic success.
        </p>
      </div>

      <div className="rounded-xl border border-gold/20 bg-white p-5 shadow-sm">
        <Users className="h-5 w-5 text-navy" />
        <h3 className="font-bold text-navy">
          Term Reports
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Four comprehensive reports are issued annually with
          opportunities for parent consultations.
        </p>
      </div>

      <div className="rounded-xl border border-gold/20 bg-white p-5 shadow-sm">
        <HeartHandshake className="h-5 w-5 text-navy" />
        <h3 className="font-bold text-navy">
          Islamic Studies Assessment
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Quran recitation, Islamic Studies tests and character
          development form part of our holistic assessment approach.
        </p>
      </div>

    </div>

  </div>

</section>

{/* Extramural Activities */}

<section className="bg-white px-6 py-20 md:px-10 md:py-24">

  <div className="mx-auto max-w-6xl">

    <div className="text-center">

      <p className="text-xs font-semibold uppercase tracking-[3px] text-gold">
        Beyond the Classroom
      </p>

      <h2 className="mt-3 text-xl font-bold leading-tight text-navy md:text-2xl">
        Extramural & Enrichment Activities
      </h2>

      <div className="mx-auto mt-5 h-1 w-20 rounded-full bg-gold" />

      <p className="mx-auto mt-6 max-w-3xl leading-7 text-gray-600">
        Learning doesn't stop at the classroom door. We provide
        opportunities that develop the whole child.
      </p>

    </div>

    <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">

      {[
        "Sport",
        "Creative Arts",
        "Maths Olympiad",
        "Reading Programme",
        "Community Service",
        "Digital Literacy",
        "Quran Recitation",
        "Educational Outings",
      ].map((item) => (
        <div
          key={item}
          className="rounded-xl border border-gray-200 bg-off-white p-5 text-center shadow-sm transition hover:border-gold/40 hover:shadow-md"
        >
          <BookOpen className="mx-auto h-5 w-5 text-navy" />
          <h3 className="font-bold text-navy">{item}</h3>
        </div>
      ))}

    </div>

  </div>

</section>

{/* CTA */}

<section className="bg-navy px-6 py-20 text-center text-white md:px-10 md:py-24">

  <div className="mx-auto max-w-3xl">

    <h2 className="text-xl font-bold leading-tight md:text-2xl">
      Ready to join the
      <span className="block text-gold">
        HIC family?
      </span>
    </h2>

    <p className="mx-auto mt-6 max-w-2xl leading-7 text-blue-100">
      We welcome applications from families who share our commitment to
      faith, knowledge and character.
    </p>

    <div className="mt-8 flex flex-wrap justify-center gap-3">

      <button className="rounded-lg bg-gold px-7 py-3 font-semibold text-navy transition hover:opacity-90">
        Apply for 2026
      </button>

      <button className="rounded-lg border border-white px-7 py-3 font-semibold text-white transition hover:bg-white hover:text-navy">
        Contact Us
      </button>

    </div>

  </div>

</section>
    </>
  );
}