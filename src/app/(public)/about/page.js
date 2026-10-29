import { PageHero, SectionHeader, StatStrip } from "@/components/ui/primitives";
import {
  BookOpen,
  HeartHandshake,
  MapPin,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import AboutGalleryPreview from "@/components/public/AboutGalleryPreview";

const schoolHistory = [
  {
    year: "1999",
    title: "The School Opens",
    description:
      "Hidayatul Islam College officially opened with 14 Grade 1 learners.",
    side: "left",
  },
  {
    year: "2005",
    title: "Grades R–7",
    description:
      "As the learners progressed and grades were added, the school became a fully fledged primary school offering Grades R to 7.",
    side: "right",
  },
];

const leadership = [
  { initials: "JA", name: "Mr J. Alexander", role: "Principal" },
  {
    initials: "AF",
    name: "Mrs A. Fridie",
    role: "Chief Operations Officer",
  },
];

const schoolValues = [
  "Self-respect",
  "Self-discipline",
  "Honesty",
  "Kindness",
  "Integrity",
  "Leadership",
  "Compassion",
  "Thankfulness and gratefulness",
  "Responsibility",
];

const schoolStats = [
  { title: "Opened 1999", text: "Kensington" },
  { title: "Grades R–7", text: "Primary School" },
  { title: "Co-educational", text: "CAPS Curriculum" },
  { title: "WCED-registered", text: "Independent Entity" },
];

const communityHighlights = [
  {
    icon: BookOpen,
    title: "Integrated Curriculum",
    description:
      "A coeducational school following the CAPS curriculum with an integrated Islamic syllabus.",
  },
  {
    icon: Users,
    title: "Parent Partnership",
    description:
      "The booklet emphasizes cooperation between parents and teachers and parent involvement in school activities.",
  },
  {
    icon: Star,
    title: "Holistic Development",
    description:
      "The school's aims include learners' academic, economic, social, religious, cultural and sporting development.",
  },
  {
    icon: MapPin,
    title: "Kensington Location",
    description: "Corner of 10th Street and 2nd Avenue, Kensington.",
  },
];

export default function About() {
  return (
    <>
      <PageHero
        pattern="dots"
        image="/images/HIC-image2.jpg"
        imageAlt="Hidayatul Islam College"
        breadcrumb="About Us"
        title={
          <>
            About <span className="text-gold">Our School</span>
          </>
        }
        description="A faith-based, coeducational primary school in Kensington, offering Grades R–7 and registered with the Western Cape Education Department."
      />

      <section className="section-shell--white px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <SectionHeader
              label="Who We Are"
              title={
                <>
                  Rooted in Faith,{" "}
                  <span className="block text-gold">Built for Excellence</span>
                </>
              }
              className="text-left"
              variant="left"
            />

            <p className="mt-6 body-copy">
              Hidayatul Islam College is an independent, faith-based community
              institution registered with the Western Cape Education Department
              as an Independent Entity. The school is located on the corner of
              10th Street and 2nd Avenue in Kensington.
            </p>
            <p className="mt-4 body-copy">
              The coeducational primary school offers Grades R to 7 and follows
              the CAPS curriculum with an integrated Islamic syllabus.
            </p>
            <p className="mt-4 body-copy">
              Foundational learning focuses on reading, writing and arithmetic,
              alongside Islamic studies and the development of learners&apos;
              character.
            </p>
          </div>

          <div className="card-navy p-7 text-center sm:p-9">
            <p className="text-2xl text-gold">علم نور</p>
            <h3 className="mt-4 text-lg font-semibold">
              “Knowledge is Light”
            </h3>
            <p className="mt-3 text-blue-200">
              Foundational Learning · Character · Faith
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell--white px-6 pb-12 md:px-10 md:pb-16">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            label="Our Foundation"
            title="Our Aims & Values"
            className="mb-7 text-center"
            variant="centered--tight"
          />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            <div className="rounded-2xl border border-navy/10 bg-navy p-6 text-white shadow-md sm:p-7">
              <BookOpen className="h-6 w-6 text-gold" />
              <h3 className="mt-4 text-base font-semibold">
                Holistic Development
              </h3>
              <p className="mt-3 text-sm leading-7 text-blue-100">
                The school aims to develop holistic people rooted in Godliness,
                with positive interpersonal relationships and a positive
                approach to life’s challenges.
              </p>
            </div>

            <div className="rounded-2xl border border-gold/30 bg-gold-pale p-6 shadow-md sm:p-7">
              <HeartHandshake className="h-6 w-6 text-gold" />
              <h3 className="mt-4 text-base font-semibold text-navy">
                Developing Learner Potential
              </h3>
              <p className="mt-3 text-sm leading-7 text-gray-600">
                The school aims to develop learners’ full potential
                academically, economically, socially, religiously, culturally
                and on the sports field.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-md sm:p-7 md:col-span-2 lg:col-span-1">
              <Star className="h-6 w-6 text-gold" />
              <h3 className="mt-4 text-base font-semibold text-navy">
                Values & Character
              </h3>
              <ul className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1.5 text-sm leading-6 text-gray-600 sm:grid-cols-2 lg:grid-cols-1">
                {schoolValues.map((value) => (
                  <li key={value}>{value}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <StatStrip items={schoolStats} variant="about" />

      {/* School history: vertical stem and floating dots only */}
      <section className="section-shell section-shell--off-white">
        <div className="mx-auto max-w-5xl">
          <SectionHeader
            label="Our Story"
            title="School History"
            description="The school opened in 1999 with 14 Grade 1 learners and expanded to offer Grades R to 7 by 2005."
            variant="centered--roomy"
          />

          <div className="relative mt-9 md:mt-12">
            <div
              aria-hidden="true"
              className="absolute bottom-0 left-4 top-0 w-px bg-gold/60 md:left-1/2"
            />

            <div className="space-y-6 md:space-y-8">
              {schoolHistory.map((item) => (
                <div
                  key={item.year}
                  className={`card-timeline relative ml-9 w-[calc(100%-2.25rem)] p-5 sm:p-6 ${
                    item.side === "right" ? "md:ml-auto" : "md:ml-0"
                  } md:w-[calc(50%-2rem)]`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute top-7 z-10 h-3 w-3 rounded-full border-2 border-off-white bg-gold ${
                      item.side === "right"
                        ? "left-[-18px] md:left-[-26px]"
                        : "left-[-18px] md:left-auto md:right-[-26px]"
                    }`}
                  />

                  <p className="font-semibold text-gold">{item.year}</p>
                  <h3 className="mt-2 text-lg font-semibold text-navy">
                    {item.title}
                  </h3>
                  <p className="mt-3 leading-7 text-gray-600">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell section-shell--navy">
        <div className="mx-auto max-w-6xl text-center">
          <p className="section-label text-gold">Life At HIC</p>
          <h2 className="mt-3 text-2xl font-bold leading-tight text-white md:text-3xl">
            Our School In Pictures
          </h2>
          <div className="section-header-divider mx-auto" />
          <div className="mt-7 md:mt-9">
            <AboutGalleryPreview />
          </div>
        </div>
      </section>

      <section className="section-shell section-shell--white !pb-8 md:!pb-10">
        <div className="mx-auto max-w-3xl">
          <SectionHeader
            label="Our People"
            title="School Leadership"
            description="School leadership includes Mr J. Alexander, Principal, and Mrs A. Fridie, Chief Operations Officer."
            variant="centered"
          />

          <div className="mx-auto mt-7 grid w-full grid-cols-2 items-start gap-3 sm:mt-9 sm:gap-5">
            {leadership.map((person) => (
              <div
                key={person.initials}
                className="card-person min-w-0 p-3 text-center sm:p-5"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-navy text-2xl font-bold text-gold sm:h-20 sm:w-20 sm:text-3xl">
                  {person.initials}
                </div>
                <h3 className="mt-3 break-words text-sm font-semibold leading-snug text-navy sm:mt-4 sm:text-base">
                  {person.name}
                </h3>
                <p className="mt-2 break-words text-xs font-medium leading-snug text-gold sm:text-sm">
                  {person.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell section-shell--white">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2 lg:items-start lg:gap-12">
          <div>
            <SectionHeader
              label="Community & Culture"
              title={
                <>
                  More than a school —{" "}
                  <span className="block text-gold">a community</span>
                </>
              }
              className="text-left"
              variant="left"
            />

            <p className="mt-6 leading-8 text-gray-600">
              Hidayatul Islam College is a faith-based community institution
              that encourages cooperation between parents and teachers and
              parent involvement in school activities.
            </p>
            <p className="mt-4 leading-8 text-gray-600">
              The school’s aims include developing positive relationships, a
              constructive role in communities, and each learner’s full
              potential.
            </p>
          </div>

          <div className="space-y-3">
            {communityHighlights.map(({ icon: Icon, title, description }) => (
              <div key={title} className="card-community">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 shrink-0 text-gold" />
                  <h3 className="font-bold text-navy">{title}</h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell section-shell--gold-pale">
        <div className="mx-auto max-w-5xl text-center">
          <SectionHeader
            label="Registration"
            title="Independent School Registered with WCED"
            className="text-center"
          />
          <p className="mx-auto mt-5 max-w-3xl leading-8 text-gray-600">
            Hidayatul Islam College is registered with the Western Cape
            Education Department as an Independent Entity.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <div className="badge-outline">
              <ShieldCheck className="mr-2 inline-block h-4 w-4 text-gold" />
              Western Cape Education Department
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
