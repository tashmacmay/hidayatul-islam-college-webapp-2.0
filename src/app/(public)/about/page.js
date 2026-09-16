import Link from "next/link";
import {
  BookOpen,
  HeartHandshake,
  MapPin,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";

export default function About() {
  return (
    <>
      {/* Hero */}

      <section className="relative flex min-h-[340px] items-end overflow-hidden bg-navy md:min-h-[350px]">

        <img
          src="/images/HIC-image2.jpg"
          alt="Hidayatul Islam College"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/80 to-navy/45" />
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:18px_18px]" />

        <div className="relative z-10 w-full px-6 pb-12 md:px-16 md:pb-[60px]">

          <p className="mb-3.5 flex items-center gap-2 text-[9px] text-blue-200 md:text-[10px]">
            <Link href="/" className="text-gold-light transition-colors hover:text-gold">
              Home
            </Link>
            <span className="text-navy-dark">›</span>
            <span className="text-blue-200/75">About Us</span>
          </p>

          <div className="mb-5 h-[3px] w-[60px] rounded-full bg-gold" />

          <h1 className="mb-3 font-serif text-2xl font-bold leading-tight text-white md:text-[28px]">
            About <span className="text-gold">Our School</span>
          </h1>

          <p className="max-w-[560px] text-sm leading-7 text-blue-100">
            A community of learners, educators, and families united by faith,
            knowledge, and a shared commitment to excellence since 1982.
          </p>

        </div>

      </section>

      {/* Who We Are */}

      <section className="bg-white px-6 py-24 md:px-10 md:py-28">

        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-start">

          <div>

            <p className="text-[10px] font-semibold uppercase tracking-[3px] text-gold">
              Who We Are
            </p>

            <h2 className="mt-3 text-xl font-bold leading-tight text-navy md:text-2xl">
              Rooted in Faith,
              <span className="block text-gold">
                Built for Excellence
              </span>
            </h2>

            <div className="mt-5 h-1 w-20 rounded-full bg-gold" />

            <p className="mt-8 leading-8 text-gray-600">
              Hidayatul Islam College is an independent Islamic primary school
              serving the Kensington community in Cape Town.
            </p>

            <p className="mt-6 leading-8 text-gray-600">
              Established in 1982, we have spent over four decades nurturing
              learners who are academically confident, morally grounded, and
              ready for the world.
            </p>

            <p className="mt-6 leading-8 text-gray-600">
              We offer a balanced education that integrates the South African
              national curriculum with Islamic studies and values, ensuring
              that every learner develops a strong sense of identity, purpose,
              and responsibility.
            </p>

          </div>

          <div className="rounded-2xl bg-navy p-10 text-center text-white shadow-lg">

            <p className="text-2xl text-gold">
              علم نور
            </p>

            <h3 className="mt-6 text-lg font-semibold">
              “Knowledge is Light”
            </h3>

            <p className="mt-4 text-blue-200">
              School Motto · Est. 1982
            </p>

          </div>

        </div>

      </section>

      {/* Mission Vision Values */}

      <section className="bg-white px-6 pb-16 md:px-10 md:pb-20">

        <div className="mx-auto max-w-7xl">

          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[3px] text-gold">
              Our Foundation
            </p>

            <h2 className="mt-3 text-xl font-bold leading-tight text-navy md:text-2xl">
              Mission, Vision & Values
            </h2>

            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gold" />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">

            <div className="rounded-2xl border border-navy/10 bg-navy p-8 text-white shadow-md">

              <BookOpen className="h-6 w-6 text-gold" />

              <h3 className="mt-5 text-base font-semibold">
                Our Mission
              </h3>

              <p className="mt-4 text-sm leading-7 text-blue-100">
                To provide a nurturing, values-driven educational environment
                that empowers every learner to achieve academic excellence and
                grow into a person of strong character, guided by the
                principles of Islam.
              </p>

            </div>

            <div className="rounded-2xl border border-gold/30 bg-gold-pale p-8 shadow-md">

              <HeartHandshake className="h-6 w-6 text-gold" />

              <h3 className="mt-5 text-base font-semibold text-navy">
                Our Vision
              </h3>

              <p className="mt-4 text-sm leading-7 text-gray-600">
                To be a leading centre of holistic learning in the Western Cape
                where faith and knowledge illuminate every learner's path.
              </p>

            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 shadow-md">

              <Star className="h-6 w-6 text-gold" />

              <h3 className="mt-5 text-base font-semibold text-navy">
                Our Values
              </h3>

              <ul className="mt-4 space-y-2 text-sm leading-6 text-gray-600">
                <li>Taqwa — God-consciousness</li>
                <li>Ilm — Love of learning</li>
                <li>Adab — Respect & good character</li>
                <li>Khidmah — Service to community</li>
                <li>Ihsan — Excellence in all things</li>
                <li>Ukhuwwah — Brotherhood & sisterhood</li>
              </ul>

            </div>

          </div>

        </div>

      </section>

      {/* Statistics */}

      <section className="bg-gold py-10">

        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 text-center md:grid-cols-4 md:px-10">

          <div>
            <h3 className="text-lg font-bold text-navy">40+</h3>
            <p className="mt-1 text-sm text-navy">Years of Service</p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-navy">R–7</h3>
            <p className="mt-1 text-sm text-navy">Grades Offered</p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-navy">100%</h3>
            <p className="mt-1 text-sm text-navy">Dept. of Ed. Compliant</p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-navy">Cape Town</h3>
            <p className="mt-1 text-sm text-navy">Kensington Community</p>
          </div>

        </div>

      </section>
   
{/* Legacy of Learning */}

<section className="bg-off-white px-6 py-20 md:px-10 md:py-24">

  <div className="mx-auto max-w-5xl">

    <div className="text-center">

      <p className="text-sm font-semibold uppercase tracking-[3px] text-gold">
        Our Story
      </p>

      <h2 className="mt-3 text-xl font-bold leading-tight text-navy md:text-2xl">
        A Legacy of Learning
      </h2>

      <div className="mx-auto mt-5 h-1 w-20 rounded-full bg-gold" />

      <p className="mx-auto mt-6 max-w-3xl leading-8 text-gray-600">
        From humble beginnings in Kensington to a fully accredited primary
        school, our journey reflects the dedication of an entire community.
      </p>

    </div>

    <div className="relative mt-16">

      <div className="absolute bottom-0 left-4 top-0 w-px bg-gold/60 md:left-1/2" />

      <div className="space-y-8">

        <div className="relative w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-md md:w-[calc(50%-2rem)] md:p-7">
          <span className="absolute -left-[25px] top-8 h-3 w-3 rounded-full bg-gold ring-4 ring-off-white md:-right-[25px] md:left-auto" />

          <p className="font-semibold text-gold">1982</p>

          <h3 className="mt-2 text-lg font-semibold text-navy">
            The School is Founded
          </h3>

          <p className="mt-4 leading-7 text-gray-600">
            Hidayatul Islam College opens its doors in Kensington, Cape Town,
            established by community members with a vision to provide Islamic
            education alongside a quality academic curriculum.
          </p>

        </div>

        <div className="relative ml-auto w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-md md:w-[calc(50%-2rem)] md:p-7">
          <span className="absolute -left-[25px] top-8 h-3 w-3 rounded-full bg-gold ring-4 ring-off-white md:-left-[25px]" />

          <p className="font-semibold text-gold">1990s</p>

          <h3 className="mt-2 text-lg font-semibold text-navy">
            Growth & Community Roots
          </h3>

          <p className="mt-4 leading-7 text-gray-600">
            The school grows steadily through the 1990s, deepening its ties
            with the Kensington Muslim community and expanding its learner
            population.
          </p>

        </div>

        <div className="relative w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-md md:w-[calc(50%-2rem)] md:p-7">
          <span className="absolute -left-[25px] top-8 h-3 w-3 rounded-full bg-gold ring-4 ring-off-white md:-right-[25px] md:left-auto" />

          <p className="font-semibold text-gold">2000s</p>

          <h3 className="mt-2 text-lg font-semibold text-navy">
            Curriculum Alignment
          </h3>

          <p className="mt-4 leading-7 text-gray-600">
            Formal alignment with the South African Department of Education
            curriculum while maintaining a strong Islamic educational
            foundation.
          </p>

        </div>

        <div className="relative ml-auto w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-md md:w-[calc(50%-2rem)] md:p-7">
          <span className="absolute -left-[25px] top-8 h-3 w-3 rounded-full bg-gold ring-4 ring-off-white md:-left-[25px]" />

          <p className="font-semibold text-gold">2010s</p>

          <h3 className="mt-2 text-lg font-semibold text-navy">
            Facilities & Staff Development
          </h3>

          <p className="mt-4 leading-7 text-gray-600">
            Investment in infrastructure, sports facilities, learning
            resources and educator development programmes.
          </p>

        </div>

        <div className="relative w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-md md:w-[calc(50%-2rem)] md:p-7">
          <span className="absolute -left-[25px] top-8 h-3 w-3 rounded-full bg-gold ring-4 ring-off-white md:-right-[25px] md:left-auto" />

          <p className="font-semibold text-gold">Today</p>

          <h3 className="mt-2 text-lg font-semibold text-navy">
            Digital & Community Expansion
          </h3>

          <p className="mt-4 leading-7 text-gray-600">
            Embracing technology, strengthening parent communication and
            continuing to grow as a vibrant educational community.
          </p>

        </div>

      </div>

    </div>

  </div>

</section>

{/* Gallery */}

<section className="bg-navy px-6 py-20 md:px-10 md:py-24">

  <div className="mx-auto max-w-5xl">

    <div className="text-center">

      <p className="text-sm font-semibold uppercase tracking-[3px] text-gold">
        Life At HIC
      </p>

      <h2 className="mt-3 text-xl font-bold leading-tight text-white md:text-2xl">
        Our School In Pictures
      </h2>

      <div className="mx-auto mt-5 h-1 w-20 rounded-full bg-gold" />

    </div>

    <div className="mt-12 grid gap-3 md:grid-cols-3 md:grid-rows-2">

      <img
        src="/images/HIC-kids.jpg"
        alt="Students"
        className="h-72 w-full rounded-2xl object-cover shadow-xl md:row-span-2 md:h-[520px]"
      />

      <img
        src="/images/HIC-image2.jpg"
        alt="School"
        className="h-36 w-full rounded-2xl object-cover shadow-xl md:h-[250px]"
      />

      <img
        src="/images/HIC-kids.jpg"
        alt="Students"
        className="h-36 w-full rounded-2xl object-cover shadow-xl md:h-[250px]"
      />

      <img
        src="/images/HIC-image2.jpg"
        alt="School"
        className="h-36 w-full rounded-2xl object-cover shadow-xl md:h-[250px]"
      />

      <img
        src="/images/HIC-kids.jpg"
        alt="Students"
        className="h-36 w-full rounded-2xl object-cover shadow-xl md:h-[250px]"
      />

    </div>

  </div>

</section>
{/* Leadership */}

<section className="bg-white px-6 py-20 md:px-10 md:py-24">

  <div className="mx-auto max-w-5xl">

    <div className="text-center">

      <p className="text-sm font-semibold uppercase tracking-[3px] text-gold">
        Our People
      </p>

      <h2 className="mt-3 text-xl font-bold leading-tight text-navy md:text-2xl">
        School Leadership
      </h2>

      <div className="mx-auto mt-5 h-1 w-20 rounded-full bg-gold" />

      <p className="mx-auto mt-6 max-w-3xl leading-8 text-gray-600">
        Our dedicated leadership team works tirelessly to ensure every learner
        thrives academically, spiritually, and socially.
      </p>

    </div>

    <div className="mt-12 grid gap-6 md:grid-cols-3">

      <div className="rounded-2xl border border-gray-200 bg-white p-7 text-center shadow-md transition hover:-translate-y-1 hover:shadow-lg">

        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-navy text-3xl font-bold text-gold">
          AF
        </div>

        <h3 className="mt-5 text-base font-semibold text-navy">
          Mrs. Ayesha Fridie
        </h3>

        <p className="mt-2 font-medium text-gold">
          Principal
        </p>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          Leading Hidayatul Islam College with vision, compassion and a deep
          commitment to every learner’s potential.
        </p>

      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-7 text-center shadow-md transition hover:-translate-y-1 hover:shadow-lg">

        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-navy text-3xl font-bold text-gold">
          DH
        </div>

        <h3 className="mt-5 text-base font-semibold text-navy">
          Deputy Principal
        </h3>

        <p className="mt-2 font-medium text-gold">
          Academic Leadership
        </p>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          Overseeing curriculum development, staff coordination and academic
          standards across all grades.
        </p>

      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-7 text-center shadow-md transition hover:-translate-y-1 hover:shadow-lg">

        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-navy text-3xl font-bold text-gold">
          AS
        </div>

        <h3 className="mt-5 text-base font-semibold text-navy">
          Admin & Support Staff
        </h3>

        <p className="mt-2 font-medium text-gold">
          Office & Operations
        </p>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          Ensuring the school runs smoothly for learners, parents and staff
          every day.
        </p>

      </div>

    </div>

  </div>

</section>

{/* Principal Message */}

<section className="bg-navy px-6 py-20 text-white md:px-10 md:py-24">

  <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-2 lg:items-center">

    <div>

      <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-gold bg-white text-4xl font-bold text-navy">
        AF
      </div>

      <h3 className="mt-8 text-lg font-semibold text-gold">
        Mrs. Ayesha Fridie
      </h3>

      <p className="mt-2 text-blue-200">
        Principal, Hidayatul Islam College
      </p>

      <ul className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5 text-sm leading-7 text-blue-100">
        <li>• BEd (Primary Education)</li>
        <li>• Advanced Certificate in School Leadership</li>
        <li>• Over 20 years in education</li>
        <li>• Community-rooted educator</li>
      </ul>

    </div>

    <div>

      <p className="text-xs font-semibold uppercase tracking-[3px] text-gold">
        A Message From The Principal
      </p>

      <h2 className="mt-3 text-xl font-bold leading-tight md:text-2xl">
        A Word from
        <span className="block text-gold">
          Mrs. Fridie
        </span>
      </h2>

      <blockquote className="mt-8 rounded-r-xl border-l-4 border-gold bg-white/5 px-6 py-5 text-base italic leading-7 text-blue-100">
        “At Hidayatul Islam College, we believe every child carries a light
        within them. Our role is to help that light shine — through knowledge,
        values, and a community that truly cares.”
      </blockquote>

      <p className="mt-8 leading-8 text-blue-100">
        Bismillah. Welcome to Hidayatul Islam College, a school that has served
        the Kensington community with pride and dedication for over four decades.
      </p>

      <p className="mt-6 leading-8 text-blue-100">
        We are an independent Islamic primary school where academic achievement
        goes hand in hand with character, compassion and faith.
      </p>

      <p className="mt-6 leading-8 text-blue-100">
        Together, we are raising the next generation of thinkers, leaders and
        believers. May Allah bless our collective efforts.
      </p>

    </div>

  </div>

</section>

{/* Community & Culture */}

<section className="bg-white px-6 py-20 md:px-10 md:py-24">

  <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-2 lg:items-start">

    <div>

      <p className="text-xs font-semibold uppercase tracking-[3px] text-gold">
        Community & Culture
      </p>

      <h2 className="mt-3 text-xl font-bold leading-tight text-navy md:text-2xl">
        More than a school —
        <span className="block text-gold">
          a community
        </span>
      </h2>

      <div className="mt-5 h-1 w-20 rounded-full bg-gold" />

      <p className="mt-8 leading-8 text-gray-600">
        Hidayatul Islam College has always been more than a place of learning.
        We are a community — a family of educators, parents and learners
        committed to growing together.
      </p>

      <p className="mt-6 leading-8 text-gray-600">
        From our annual sports day to Islamic awareness programmes, parent
        evenings and outreach initiatives, we create spaces where relationships
        are formed and values are lived out.
      </p>

    </div>

    <div className="space-y-3">

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-gold" />
          <h3 className="font-bold text-navy">Integrated Curriculum</h3>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          National curriculum enriched with Islamic studies, Arabic and Quran.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-gold" />
          <h3 className="font-bold text-navy">Parent Partnership</h3>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Open communication, school events and strong family involvement.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <Star className="h-5 w-5 text-gold" />
          <h3 className="font-bold text-navy">Holistic Excellence</h3>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Academic, spiritual, sporting and cultural development.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-gold" />
          <h3 className="font-bold text-navy">Rooted In Kensington</h3>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Proudly serving our local community for more than 40 years.
        </p>
      </div>

    </div>

  </div>

</section>

{/* Accreditation */}

<section className="bg-gold-pale px-6 py-20 md:px-10 md:py-24">

  <div className="mx-auto max-w-5xl text-center">

    <p className="text-xs font-semibold uppercase tracking-[3px] text-gold">
      Accreditation & Affiliation
    </p>

    <h2 className="mt-3 text-xl font-bold leading-tight text-navy md:text-2xl">
      Recognised & Accredited
    </h2>

    <div className="mx-auto mt-5 h-1 w-20 rounded-full bg-gold" />

    <p className="mx-auto mt-6 max-w-3xl leading-8 text-gray-600">
      Hidayatul Islam College meets all requirements of the Western Cape
      Education Department and remains committed to excellence.
    </p>

    <div className="mt-10 flex flex-wrap justify-center gap-3">

      <div className="rounded-full border border-gold/30 bg-white px-5 py-3 text-sm text-navy shadow-sm">
        <ShieldCheck className="mr-2 inline-block h-4 w-4 text-gold" />
        Western Cape Education Department
      </div>

      <div className="rounded-full border border-gold/30 bg-white px-5 py-3 text-sm text-navy shadow-sm">
        <ShieldCheck className="mr-2 inline-block h-4 w-4 text-gold" />
        Dept. of Basic Education Registered
      </div>

      <div className="rounded-full border border-gold/30 bg-white px-5 py-3 text-sm text-navy shadow-sm">
        <ShieldCheck className="mr-2 inline-block h-4 w-4 text-gold" />
        POPIA Compliant
      </div>

      <div className="rounded-full border border-gold/30 bg-white px-5 py-3 text-sm text-navy shadow-sm">
        <ShieldCheck className="mr-2 inline-block h-4 w-4 text-gold" />
        Independent Schools Association
      </div>

    </div>

  </div>

</section>
 </>
  );
}