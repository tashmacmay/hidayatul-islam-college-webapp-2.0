import { IconCard, PageHero, SectionHeader, StatStrip } from "@/components/components";
import {
  BookOpen,
  HeartHandshake,
  MapPin,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";

const schoolHistory = [
  {
    year: "1982",
    title: "The School is Founded",
    description: "Hidayatul Islam College opens its doors in Kensington, Cape Town, established by community members with a vision to provide Islamic education alongside a quality academic curriculum.",
    side: "left",
  },
  {
    year: "1990s",
    title: "Growth & Community Roots",
    description: "The school grows steadily through the 1990s, deepening its ties with the Kensington Muslim community and expanding its learner population.",
    side: "right",
  },
  {
    year: "2000s",
    title: "Curriculum Alignment",
    description: "Formal alignment with the South African Department of Education curriculum while maintaining a strong Islamic educational foundation.",
    side: "left",
  },
  {
    year: "2010s",
    title: "Facilities & Staff Development",
    description: "Investment in infrastructure, sports facilities, learning resources and educator development programmes.",
    side: "right",
  },
  {
    year: "Today",
    title: "Digital & Community Expansion",
    description: "Embracing technology, strengthening parent communication and continuing to grow as a vibrant educational community.",
    side: "left",
  },
];

const schoolImages = [
  { src: "/images/HIC-kids.jpg", alt: "Students", className: "h-72 w-full rounded-2xl object-cover shadow-xl md:row-span-2 md:h-[520px]" },
  { src: "/images/HIC-image2.jpg", alt: "School", className: "h-36 w-full rounded-2xl object-cover shadow-xl md:h-[250px]" },
  { src: "/images/HIC-kids.jpg", alt: "Students", className: "h-36 w-full rounded-2xl object-cover shadow-xl md:h-[250px]" },
  { src: "/images/HIC-image2.jpg", alt: "School", className: "h-36 w-full rounded-2xl object-cover shadow-xl md:h-[250px]" },
  { src: "/images/HIC-kids.jpg", alt: "Students", className: "h-36 w-full rounded-2xl object-cover shadow-xl md:h-[250px]" },
];

const leadership = [
  {
    initials: "AF",
    name: "Mrs. Ayesha Fridie",
    role: "Principal",
    description: "Leading Hidayatul Islam College with vision, compassion and a deep commitment to every learner’s potential.",
  },
  {
    initials: "DH",
    name: "Deputy Principal",
    role: "Academic Leadership",
    description: "Overseeing curriculum development, staff coordination and academic standards across all grades.",
  },
  {
    initials: "AS",
    name: "Admin & Support Staff",
    role: "Office & Operations",
    description: "Ensuring the school runs smoothly for learners, parents and staff every day.",
  },
];

const schoolValues = [
  "Taqwa — God-consciousness",
  "Ilm — Love of learning",
  "Adab — Respect & good character",
  "Khidmah — Service to community",
  "Ihsan — Excellence in all things",
  "Ukhuwwah — Brotherhood & sisterhood",
];

const schoolStats = [
  { title: "40+", text: "Years of Service" },
  { title: "R–7", text: "Grades Offered" },
  { title: "100%", text: "Dept. of Ed. Compliant" },
  { title: "Cape Town", text: "Kensington Community" },
];

const communityHighlights = [
  { icon: BookOpen, title: "Integrated Curriculum", description: "National curriculum enriched with Islamic studies, Arabic and Quran." },
  { icon: Users, title: "Parent Partnership", description: "Open communication, school events and strong family involvement." },
  { icon: Star, title: "Holistic Excellence", description: "Academic, spiritual, sporting and cultural development." },
  { icon: MapPin, title: "Rooted In Kensington", description: "Proudly serving our local community for more than 40 years." },
];

const accreditations = [
  "Western Cape Education Department",
  "Dept. of Basic Education Registered",
  "POPIA Compliant",
  "Independent Schools Association",
];

export default function About() {
  return (
    <>
      <PageHero
        variant="about"
        pattern="dots"
        image="/images/HIC-image2.jpg"
        imageAlt="Hidayatul Islam College"
        breadcrumb="About Us"
        title={<>About <span className="text-gold">Our School</span></>}
        description="A community of learners, educators, and families united by faith, knowledge, and a shared commitment to excellence since 1982."
      />

      <section className="section-shell--white px-6 py-24 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <SectionHeader
              label="Who We Are"
              title={<>Rooted in Faith,{" "}<span className="block text-gold">Built for Excellence</span></>}
              className="text-left"
              variant="left"
            />

            <p className="mt-8 body-copy">
              Hidayatul Islam College is an independent Islamic primary school serving the Kensington community in Cape Town.
            </p>
            <p className="mt-6 body-copy">
              Established in 1982, we have spent over four decades nurturing learners who are academically confident, morally grounded, and ready for the world.
            </p>
            <p className="mt-6 body-copy">
              We offer a balanced education that integrates the South African national curriculum with Islamic studies and values, ensuring that every learner develops a strong sense of identity, purpose, and responsibility.
            </p>
          </div>

          <div className="card-navy p-10 text-center">
            <p className="text-2xl text-gold">علم نور</p>
            <h3 className="mt-6 text-lg font-semibold">“Knowledge is Light”</h3>
            <p className="mt-4 text-blue-200">School Motto · Est. 1982</p>
          </div>
        </div>
      </section>

      <section className="section-shell--white px-6 pb-16 md:px-10 md:pb-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            label="Our Foundation"
            title="Mission, Vision & Values"
            className="mb-8 text-center"
            variant="centered--tight"
          />

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-navy/10 bg-navy p-8 text-white shadow-md">
              <BookOpen className="h-6 w-6 text-gold" />
              <h3 className="mt-5 text-base font-semibold">Our Mission</h3>
              <p className="mt-4 text-sm leading-7 text-blue-100">
                To provide a nurturing, values-driven educational environment that empowers every learner to achieve academic excellence and grow into a person of strong character, guided by the principles of Islam.
              </p>
            </div>

            <div className="rounded-2xl border border-gold/30 bg-gold-pale p-8 shadow-md">
              <HeartHandshake className="h-6 w-6 text-gold" />
              <h3 className="mt-5 text-base font-semibold text-navy">Our Vision</h3>
              <p className="mt-4 text-sm leading-7 text-gray-600">
                To be a leading centre of holistic learning in the Western Cape where faith and knowledge illuminate every learner&apos;s path.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 shadow-md">
              <Star className="h-6 w-6 text-gold" />
              <h3 className="mt-5 text-base font-semibold text-navy">Our Values</h3>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-gray-600">
                {schoolValues.map((value) => <li key={value}>{value}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <StatStrip items={schoolStats} />

      <section className="section-shell section-shell--off-white">
        <div className="mx-auto max-w-5xl">
          <SectionHeader
            label="Our Story"
            title="A Legacy of Learning"
            description="From humble beginnings in Kensington to a fully accredited primary school, our journey reflects the dedication of an entire community."
            variant="centered"
          />

          <div className="relative mt-16">
            <div className="absolute bottom-0 left-4 top-0 w-px bg-gold/60 md:left-1/2" />
            <div className="space-y-8">
              {schoolHistory.map((item) => (
                <div key={item.year} className={`card-timeline ${item.side === "right" ? "ml-auto" : ""}`}>
                  <span className={`absolute -left-[25px] top-8 h-3 w-3 rounded-full bg-gold ring-4 ring-off-white ${item.side === "right" ? "md:-left-[25px]" : "md:-right-[25px] md:left-auto"}`} />
                  <p className="font-semibold text-gold">{item.year}</p>
                  <h3 className="mt-2 text-lg font-semibold text-navy">{item.title}</h3>
                  <p className="mt-4 leading-7 text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell section-shell--navy">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <SectionHeader
              label="Life At HIC"
              title="Our School In Pictures"
              variant="onNavy"
            />
          </div>

          <div className="mt-12 grid gap-3 md:grid-cols-3 md:grid-rows-2">
            {schoolImages.map((image, index) => (
              <img key={`${image.src}-${index}`} src={image.src} alt={image.alt} className={image.className} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell section-shell--white">
        <div className="mx-auto max-w-5xl">
          <SectionHeader
            label="Our People"
            title="School Leadership"
            description="Our dedicated leadership team works tirelessly to ensure every learner thrives academically, spiritually, and socially."
            variant="centered"
          />

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {leadership.map((person) => (
              <div key={person.initials} className="card-person">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-navy text-3xl font-bold text-gold">{person.initials}</div>
                <h3 className="mt-5 text-base font-semibold text-navy">{person.name}</h3>
                <p className="mt-2 font-medium text-gold">{person.role}</p>
                <p className="mt-3 text-sm leading-6 text-gray-600">{person.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

{/* Principal Message */}

<section className="section-shell section-shell--navy">

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

<section className="section-shell section-shell--white">

  <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-2 lg:items-start">

    <div>

        <SectionHeader
          label="Community & Culture"
          title={<>More than a school —{" "}<span className="block text-gold">a community</span></>}
          className="text-left"
          variant="left"
        />

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

      {communityHighlights.map(({ icon: Icon, title, description }) => (
        <div key={title} className="card-community">
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-gold" />
            <h3 className="font-bold text-navy">{title}</h3>
          </div>
          <p className="mt-2 text-sm text-gray-600">{description}</p>
        </div>
      ))}

    </div>

  </div>

</section>

{/* Accreditation */}

<section className="section-shell section-shell--gold-pale">

  <div className="mx-auto max-w-5xl text-center">

    <SectionHeader
      label="Accreditation & Affiliation"
      title="Recognised & Accredited"
      className="text-center"
    />

    <p className="mx-auto mt-6 max-w-3xl leading-8 text-gray-600">
      Hidayatul Islam College meets all requirements of the Western Cape
      Education Department and remains committed to excellence.
    </p>

    <div className="mt-10 flex flex-wrap justify-center gap-3">

      {accreditations.map((name) => (
        <div key={name} className="badge-outline">
          <ShieldCheck className="mr-2 inline-block h-4 w-4 text-gold" />
          {name}
        </div>
      ))}

    </div>

  </div>

</section>
 </>
  );
}