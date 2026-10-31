import { PageHero, SectionHeader } from "@/components/ui/primitives";
import { BookOpen, HeartHandshake, Star, Users } from "lucide-react";
import Link from "next/link";
import AboutGalleryPreview from "@/components/public/AboutGalleryPreview";
import { Section, Container } from "@/components/ui/layout";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "About Us | Hidayatul Islam College",
  description: "Learn about our history, leadership, values, and our community focus in Kensington, Cape Town.",
};

const schoolHistory = [
  { year: "1999", title: "The School Opens", description: "Hidayatul Islam College officially opened with 14 Grade 1 learners.", side: "left" },
  { year: "2005", title: "Grades R–7", description: "As the learners progressed and grades were added, the school became a fully fledged primary school offering Grades R to 7.", side: "right" },
];

const leadership = [
  { initials: "JA", name: "Mr J. Alexander", role: "Principal" },
  { initials: "AF", name: "Mrs A. Fridie", role: "Chief Operations Officer" },
];

const schoolValues = ["Self-respect", "Self-discipline", "Honesty", "Kindness", "Integrity", "Leadership", "Compassion", "Thankfulness and gratefulness", "Responsibility"];

const communityHighlights = [
  { 
    icon: BookOpen, 
    title: "Open Educational Resources", 
    description: "As a community-focused school, we make our learning materials freely available to the wider public online. No login required." 
  },
  { 
    icon: Users, 
    title: "Parent Partnership", 
    description: "Working closely with families to support each child’s academic, social, and spiritual growth." 
  },
  { 
    icon: HeartHandshake, 
    title: "Community Roots", 
    description: "Fostering positive relationships and a constructive role within the broader Kensington community." 
  },
];

export default function About() {
  return (
    <>
      <PageHero
        image="/images/HIC-image2.jpg"
        imageAlt="Hidayatul Islam College"
        breadcrumb="About Us"
        title={<>About <span className="text-gold">Our School</span></>}
        description="A faith-based, independent, coeducational primary school in Kensington, offering Grades R–7 and registered with the Western Cape Education Department."
      />

      <Section tone="white" space="sm">
        <Container className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12 mb-16 md:mb-24">
          <div>
            <SectionHeader label="Who We Are" title={<>Rooted in Faith,{" "}<span className="block text-gold">Built for Excellence</span></>} className="text-left" variant="left" />
            <p className="mt-6 body-copy">Hidayatul Islam College is an independent, faith-based community institution registered with the Western Cape Education Department as an Independent Entity. The school is located on the corner of 10th Street and 2nd Avenue in Kensington.</p>
            <p className="mt-4 body-copy">The coeducational primary school offers Grades R to 7 and follows the CAPS curriculum with an integrated Islamic syllabus.</p>
            <p className="mt-4 body-copy">Foundational learning focuses on reading, writing and arithmetic, alongside Islamic studies and the development of learners&apos; character.</p>
          </div>
          <Card variant="navy" className="text-center p-7 sm:p-9">
            <p className="text-2xl text-gold">علم نور</p>
            <h3 className="mt-4 text-lg font-semibold">“Knowledge is Light”</h3>
            <p className="mt-3 text-blue-200">Foundational Learning · Character · Faith</p>
          </Card>
        </Container>

        <Container size="wide">
          <SectionHeader label="Our Foundation" title="Our Aims & Values" className="mb-7 text-center" variant="centered--tight" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            <Card variant="navy">
              <BookOpen className="h-6 w-6 text-gold" />
              <h3 className="mt-4 text-base font-semibold">Holistic Development</h3>
              <p className="mt-3 text-sm leading-7 text-blue-100">The school aims to develop holistic people rooted in Godliness, with positive interpersonal relationships and a positive approach to life’s challenges.</p>
            </Card>
            <Card variant="pale">
              <HeartHandshake className="h-6 w-6 text-gold" />
              <h3 className="mt-4 text-base font-semibold text-navy">Developing Learner Potential</h3>
              <p className="mt-3 text-sm leading-7 text-gray-600">The school aims to develop learners’ full potential academically, economically, socially, religiously, culturally and on the sports field.</p>
            </Card>
            <Card variant="light" className="md:col-span-2 lg:col-span-1">
              <Star className="h-6 w-6 text-gold" />
              <h3 className="mt-4 text-base font-semibold text-navy">Values & Character</h3>
              <ul className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1.5 text-sm leading-6 text-gray-600 sm:grid-cols-2 lg:grid-cols-1">
                {schoolValues.map((value) => <li key={value}>{value}</li>)}
              </ul>
            </Card>
          </div>
        </Container>
      </Section>

      <Section tone="cream">
        <Container>
          <SectionHeader label="Our Story" title="School History" description="The school opened in 1999 with 14 Grade 1 learners and expanded to offer Grades R to 7 by 2005." variant="centered--roomy" />
          <div className="relative mt-9 md:mt-12">
            <div aria-hidden="true" className="absolute bottom-0 left-4 top-0 w-px bg-gold/60 md:left-1/2" />
            <div className="space-y-6 md:space-y-8">
              {schoolHistory.map((item) => (
                <div key={item.year} className={`card-timeline relative ml-9 w-[calc(100%-2.25rem)] p-5 sm:p-6 ${item.side === "right" ? "md:ml-auto" : "md:ml-0"} md:w-[calc(50%-2rem)]`}>
                  <span aria-hidden="true" className={`absolute top-7 z-10 h-3 w-3 rounded-full border-2 border-cream bg-gold ${item.side === "right" ? "left-[-18px] md:left-[-26px]" : "left-[-18px] md:left-auto md:right-[-26px]"}`} />
                  <p className="font-semibold text-gold">{item.year}</p>
                  <h3 className="mt-2 text-lg font-semibold text-navy">{item.title}</h3>
                  <p className="mt-3 leading-7 text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="navy">
        <Container className="text-center">
          <p className="section-label text-gold">Life At HIC</p>
          <h2 className="mt-3 text-2xl font-bold leading-tight text-white md:text-3xl">Our School In Pictures</h2>
          <div className="section-header-divider mx-auto" />
          <div className="mt-7 md:mt-9"><AboutGalleryPreview /></div>
        </Container>
      </Section>

      <Section tone="white" space="sm">
        <Container>
          <SectionHeader label="Our People" title="School Leadership" description="School leadership includes Mr J. Alexander, Principal, and Mrs A. Fridie, Chief Operations Officer." variant="centered" />
          <div className="mx-auto mt-7 grid grid-cols-1 sm:grid-cols-2 items-stretch gap-3 sm:mt-9 sm:gap-5">
            {leadership.map((person) => (
              <Card key={person.initials} variant="light" centered className="p-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-navy text-2xl font-bold text-gold sm:h-20 sm:w-20 sm:text-3xl">{person.initials}</div>
                <h3 className="mt-3 break-words text-sm font-semibold leading-snug text-navy sm:mt-4 sm:text-base">{person.name}</h3>
                <p className="mt-2 break-words text-xs font-medium leading-snug text-gold sm:text-sm">{person.role}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="cream" space="sm">
        <Container className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-12">
          <div>
            <SectionHeader label="Community & Culture" title={<>More than a school —{" "}<span className="block text-gold">a community</span></>} className="text-left" variant="left" />
            <p className="mt-6 leading-8 text-gray-600">
              Hidayatul Islam College is a faith-based community institution that encourages cooperation between parents and teachers, and active parent involvement in school activities.
            </p>
            <p className="mt-4 leading-8 text-gray-600">
              We believe in supporting the wider community. That is why our educational resources are made openly available to everyone, ensuring that learning extends beyond our classrooms.
            </p>
            <Link
              href="/resources"
              className="mt-8 inline-flex items-center justify-center rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy-dark"
            >
              Explore Public Resources
            </Link>
          </div>
          <div className="space-y-3">
            {communityHighlights.map(({ icon: Icon, title, description }) => (
              <Card key={title} variant="light" className="p-5 sm:p-5">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 shrink-0 text-gold" />
                  <h3 className="font-bold text-navy">{title}</h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-gray-600">{description}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}