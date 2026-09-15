import GradeExplorer from "@/components/GradeExplorer";
export default function Academics() {
  return (
    <>
      {/* Hero Section */}

      <section className="relative h-[450px] overflow-hidden">

        <img
          src="/images/HIC-image2.jpg"
          alt="Academics"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-navy/80" />

        <div className="relative z-10 flex h-full items-center">

          <div className="mx-auto max-w-7xl px-10">

            <p className="text-sm font-semibold uppercase tracking-[4px] text-gold">
              Home › Academics
            </p>

            <h1 className="mt-6 text-6xl font-bold text-white md:text-6xl">
              Our
              <span className="text-gold"> Academics</span>
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-blue-100">
              A balanced, enriching curriculum that combines the South African
              national programme with Islamic studies, preparing every learner
              for life in all its dimensions.
            </p>

          </div>

        </div>

      </section>

      {/* Curriculum Overview */}

      <section className="px-10 py-20">

        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2">

          <div>

            <p className="text-sm font-semibold uppercase tracking-[3px] text-gold">
              Our Curriculum
            </p>

            <h2 className="mt-3 text-4xl font-bold text-navy md:5x1">
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

          <div className="rounded-3xl bg-navy p-10 text-white shadow-xl">

            <p className="text-sm font-semibold uppercase tracking-[3px] text-gold">
              National Curriculum (CAPS)
            </p>

            <h3 className="mt-4 text-2xl font-bold">
              DoE-Registered Subjects
            </h3>

            <ul className="mt-8 space-y-4 text-blue-100">
              <li>• Home Language (English / Afrikaans)</li>
              <li>• First Additional Language</li>
              <li>• Mathematics</li>
              <li>• Life Skills / Social Sciences</li>
              <li>• Natural Sciences & Technology</li>
              <li>• Economic & Management Sciences</li>
            </ul>

            <div className="mt-10 border-t border-white/20 pt-8">

              <p className="text-sm font-semibold uppercase tracking-[3px] text-gold">
                Islamic Enrichment
              </p>

              <h3 className="mt-4 text-2xl font-bold">
                Faith & Character Subjects
              </h3>

              <ul className="mt-8 space-y-4 text-blue-100">
                <li>• Islamic Studies (Fiqh, Aqeedah, Seerah)</li>
                <li>• Quran Recitation & Memorisation</li>
                <li>• Arabic Language</li>
                <li>• Islamic History & Ethics</li>
                <li>• Du'a and Salah</li>
              </ul>

            </div>

          </div>

        </div>

      </section>
      {/* Grade Explorer */}

<GradeExplorer />

{/* Islamic Studies Programme */}

<section className="bg-navy px-10 py-20 text-white">

  <div className="mx-auto max-w-7xl">

    <div className="text-center">

      <p className="text-sm font-semibold uppercase tracking-[3px] text-gold">
        Faith & Knowledge
      </p>

      <h2 className="mt-3 text-5xl font-bold md:text-5xl">
        Islamic Studies Programme
      </h2>

      <div className="mx-auto mt-5 h-1 w-20 rounded-full bg-gold" />

      <p className="mx-auto mt-6 max-w-3xl text-blue-100 leading-8">
        Our Islamic curriculum runs alongside the national programme from
        Grade R to Grade 7, nurturing learners who are grounded in their
        faith and equipped for the world.
      </p>

    </div>

    <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

      <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
        <h3 className="text-xl font-bold text-gold">
          Quran Recitation & Hifz
        </h3>
        <p className="mt-4 text-blue-100">
          Daily Quran lessons focus on Tajweed, understanding and
          memorisation.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
        <h3 className="text-xl font-bold text-gold">
          Aqeedah & Fiqh
        </h3>
        <p className="mt-4 text-blue-100">
          Foundational Islamic theology and jurisprudence for everyday life.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
        <h3 className="text-xl font-bold text-gold">
          Seerah & Islamic History
        </h3>
        <p className="mt-4 text-blue-100">
          Inspiring lessons from the life of the Prophet ﷺ and Islamic
          civilisation.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
        <h3 className="text-xl font-bold text-gold">
          Arabic Language
        </h3>
        <p className="mt-4 text-blue-100">
          Reading, writing and conversational Arabic taught progressively.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
        <h3 className="text-xl font-bold text-gold">
          Akhlaq & Character
        </h3>
        <p className="mt-4 text-blue-100">
          Islamic ethics and good character integrated into daily school life.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
        <h3 className="text-xl font-bold text-gold">
          Salah & Daily Practice
        </h3>
        <p className="mt-4 text-blue-100">
          Practical worship, du'a and daily Islamic habits reinforced
          throughout the school day.
        </p>
      </div>

    </div>

  </div>

</section>
{/* Teaching Philosophy */}

<section className="px-10 py-20">

  <div className="mx-auto max-w-7xl">

    <div className="text-center">

      <p className="text-sm font-semibold uppercase tracking-[3px] text-gold">
        How We Teach
      </p>

      <h2 className="mt-3 text-5xl font-bold text-navy md:text-5xl">
        Our Teaching Philosophy
      </h2>

      <div className="mx-auto mt-5 h-1 w-20 rounded-full bg-gold" />

      <p className="mx-auto mt-6 max-w-4xl leading-8 text-gray-600">
        We draw on evidence-based pedagogical approaches and Islamic
        educational traditions to create classrooms where every learner
        is seen, heard, and challenged.
      </p>

    </div>

    <div className="mt-16 grid gap-8 md:grid-cols-2">

      <div className="rounded-2xl bg-gray-50 p-8 shadow-sm">

        <span className="text-4xl font-bold text-gold">01</span>

        <h3 className="mt-4 text-2xl font-bold text-navy">
          Differentiated Instruction
        </h3>

        <p className="mt-4 leading-8 text-gray-600">
          Our educators plan lessons that meet learners where they are,
          adapting teaching strategies to ensure every child can thrive.
        </p>

      </div>

      <div className="rounded-2xl bg-gray-50 p-8 shadow-sm">

        <span className="text-4xl font-bold text-gold">02</span>

        <h3 className="mt-4 text-2xl font-bold text-navy">
          Values-Integrated Learning
        </h3>

        <p className="mt-4 leading-8 text-gray-600">
          Islamic values are woven throughout the curriculum, shaping
          character alongside academic growth.
        </p>

      </div>

      <div className="rounded-2xl bg-gray-50 p-8 shadow-sm">

        <span className="text-4xl font-bold text-gold">03</span>

        <h3 className="mt-4 text-2xl font-bold text-navy">
          Active & Collaborative Learning
        </h3>

        <p className="mt-4 leading-8 text-gray-600">
          Learners participate through discussion, teamwork, projects,
          presentations and hands-on activities.
        </p>

      </div>

      <div className="rounded-2xl bg-gray-50 p-8 shadow-sm">

        <span className="text-4xl font-bold text-gold">04</span>

        <h3 className="mt-4 text-2xl font-bold text-navy">
          Parent & Community Partnership
        </h3>

        <p className="mt-4 leading-8 text-gray-600">
          We work closely with parents to support every learner's
          educational journey both at school and at home.
        </p>

      </div>

    </div>

  </div>

</section>

{/* Languages at HIC */}

<section className="bg-gray-50 px-10 py-20">

  <div className="mx-auto max-w-7xl">

    <div className="text-center">

      <p className="text-sm font-semibold uppercase tracking-[3px] text-gold">
        Language of Learning
      </p>

      <h2 className="mt-3 text-5xl font-bold text-navy md:text-5xl">
        Languages at HIC
      </h2>

      <div className="mx-auto mt-5 h-1 w-20 rounded-full bg-gold" />

      <p className="mx-auto mt-6 max-w-3xl leading-8 text-gray-600">
        We honour the multilingual identities of our learners while
        providing strong foundations in English, Afrikaans and Arabic.
      </p>

    </div>

    <div className="mt-16 grid gap-8 md:grid-cols-3">

      <div className="rounded-3xl bg-white p-8 text-center shadow-lg">

        <div className="text-5xl">🇿🇦</div>

        <h3 className="mt-5 text-2xl font-bold text-navy">
          English
        </h3>

        <p className="mt-2 text-gold font-semibold">
          Home Language / FAL
        </p>

        <p className="mt-5 leading-7 text-gray-600">
          English serves as the primary language of learning and teaching,
          developing strong reading, writing and communication skills.
        </p>

      </div>

      <div className="rounded-3xl bg-white p-8 text-center shadow-lg">

        <div className="text-5xl">🇿🇦</div>

        <h3 className="mt-5 text-2xl font-bold text-navy">
          Afrikaans
        </h3>

        <p className="mt-2 text-gold font-semibold">
          First Additional Language
        </p>

        <p className="mt-5 leading-7 text-gray-600">
          Afrikaans is offered as a First Additional Language,
          recognising its importance in our local context.
        </p>

      </div>

      <div className="rounded-3xl bg-white p-8 text-center shadow-lg">

        <div className="text-5xl">🕌</div>

        <h3 className="mt-5 text-2xl font-bold text-navy">
          Arabic
        </h3>

        <p className="mt-2 text-gold font-semibold">
          Islamic & Quran Studies
        </p>

        <p className="mt-5 leading-7 text-gray-600">
          Arabic is taught from Grade R as both a language of worship
          and a gateway to understanding the Quran.
        </p>

      </div>

    </div>

  </div>

</section>
{/* Assessment & Reporting */}

<section className="bg-[#F8F3E8] px-10 py-24">

  <div className="mx-auto max-w-7xl grid gap-16 lg:grid-cols-2">

    <div>

      <p className="text-sm font-semibold uppercase tracking-[3px] text-gold">
        How We Measure Progress
      </p>

      <h2 className="mt-3 text-5xl font-bold text-navy *: md:text-5xl">
        Assessment & Reporting
      </h2>

      <div className="mt-5 h-1 w-20 rounded-full bg-gold" />

      <p className="mt-8 leading-8 text-gray-600">
        Assessment at Hidayatul Islam College is continuous, formative,
        and designed to support learning — not just measure it.
      </p>

      <p className="mt-6 leading-8 text-gray-600">
        We follow CAPS assessment requirements while also tracking
        learners' growth in Islamic character, leadership and personal
        development.
      </p>

      <p className="mt-6 leading-8 text-gray-600">
        Parents receive regular progress reports and have opportunities
        to engage directly with teachers throughout the year.
      </p>

    </div>

    <div className="space-y-5">

      <div className="rounded-2xl bg-white p-6 shadow-md">
        <h3 className="font-bold text-navy">
          Continuous Assessment (CASS)
        </h3>
        <p className="mt-2 text-gray-600">
          Projects, class activities, oral tasks and written work
          contribute to term marks.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-md">
        <h3 className="font-bold text-navy">
          Formal Examinations
        </h3>
        <p className="mt-2 text-gray-600">
          Mid-year and end-of-year examinations prepare learners for
          future academic success.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-md">
        <h3 className="font-bold text-navy">
          Term Reports
        </h3>
        <p className="mt-2 text-gray-600">
          Four comprehensive reports are issued annually with
          opportunities for parent consultations.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-md">
        <h3 className="font-bold text-navy">
          Islamic Studies Assessment
        </h3>
        <p className="mt-2 text-gray-600">
          Quran recitation, Islamic Studies tests and character
          development form part of our holistic assessment approach.
        </p>
      </div>

    </div>

  </div>

</section>

{/* Extramural Activities */}

<section className="px-10 py-20">

  <div className="mx-auto max-w-7xl">

    <div className="text-center">

      <p className="text-sm font-semibold uppercase tracking-[3px] text-gold">
        Beyond the Classroom
      </p>

      <h2 className="mt-3 text-5xl font-bold text-navy md:text-5xl">
        Extramural & Enrichment Activities
      </h2>

      <div className="mx-auto mt-5 h-1 w-20 rounded-full bg-gold" />

      <p className="mx-auto mt-6 max-w-3xl leading-8 text-gray-600">
        Learning doesn't stop at the classroom door. We provide
        opportunities that develop the whole child.
      </p>

    </div>

    <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

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
          className="rounded-2xl bg-gray-50 p-6 text-center shadow-sm hover:shadow-lg transition"
        >
          <h3 className="font-bold text-navy">{item}</h3>
        </div>
      ))}

    </div>

  </div>

</section>

{/* CTA */}

<section className="bg-navy px-10 py-20 text-center text-white">

  <div className="mx-auto max-w-4xl">

    <h2 className="text-4xl font-bold md:text-5xl">
      Ready to join the
      <span className="block text-gold">
        HIC family?
      </span>
    </h2>

    <p className="mx-auto mt-8 max-w-2xl text-blue-100 leading-8">
      We welcome applications from families who share our commitment to
      faith, knowledge and character.
    </p>

    <div className="mt-10 flex flex-wrap justify-center gap-4">

      <button className="rounded-xl bg-gold px-8 py-4 font-semibold text-navy transition hover:opacity-90">
        Apply for 2026
      </button>

      <button className="rounded-xl border border-white px-8 py-4 font-semibold text-white transition hover:bg-white hover:text-navy">
        Contact Us
      </button>

    </div>

  </div>

</section>
    </>
  );
}