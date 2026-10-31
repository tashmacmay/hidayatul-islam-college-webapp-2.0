import { PageHero, SectionHeader, SubjectList } from "@/components/ui/primitives";
import { BookOpen, HeartHandshake, Languages, ShieldCheck, Star, Users } from "lucide-react";
import GradeExplorer from "@/components/public/GradeExplorer";
import { Section, Container } from "@/components/ui/layout";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Academics | Hidayatul Islam College",
  description: "Explore our CAPS curriculum, Islamic studies, learner support, and co-curricular activities.",
};

const foundationalLearning = ["Reading", "Writing", "Arithmetic"];
const islamicTopics = [
  { icon: BookOpen, title: "Fiqh" },
  { icon: BookOpen, title: "Islamic History" },
  { icon: HeartHandshake, title: "Adaab & Akhlaaq" },
  { icon: Star, title: "Masnoon / Daily Duahs" },
  { icon: BookOpen, title: "Selective Surah Reading" },
];
const educationalAims = [
  { icon: BookOpen, title: "Foundational Learning", description: "Building strong foundations in reading, writing and arithmetic." },
  { icon: ShieldCheck, title: "Integrated Curriculum", description: "Following the CAPS curriculum alongside an integrated Islamic syllabus." },
  { icon: Star, title: "Holistic Development", description: "Supporting academic, social, cultural, religious and sporting growth." },
  { icon: HeartHandshake, title: "Character & Values", description: "Encouraging responsibility, kindness, self-discipline and integrity." },
];
const languageCards = [
  { icon: BookOpen, title: "Literacy", subtitle: "Foundation Phase · Grades R–3", description: "Listed as a Foundation Phase subject." },
  { icon: Languages, title: "English Home Language", subtitle: "Intermediate Phase and Grade 7", description: "Listed for Grades 4–6 and Grade 7." },
  { icon: Languages, title: "Afrikaans First Additional Language", subtitle: "Intermediate Phase and Grade 7", description: "Listed for Grades 4–6 and Grade 7." },
];
const learnerSupport = [
  { icon: Users, title: "Early Identification", description: "Identifying learning needs early and communicating concerns with parents." },
  { icon: HeartHandshake, title: "Individual and Small-Group Support", description: "Providing additional guidance to learners who need support." },
  { icon: BookOpen, title: "Literacy and Numeracy", description: "Reinforcing foundational reading, writing and arithmetic skills." },
  { icon: ShieldCheck, title: "Monitoring and Parent Partnership", description: "Monitoring progress and working with parents to support learners." },
  { icon: Star, title: "Further Referral", description: "Considering additional professional support where appropriate." },
];
const coCurricularActivities = ["Athletics", "Soccer", "Tag Rugby", "Swimming", "Co-Curricular Activities", "Educational Outings"];

export default function Academics() {
  return (
    <>
      <PageHero
        image="/images/HIC-image2.jpg"
        imageAlt="Learners at Hidayatul Islam College"
        breadcrumb="Academics"
        title="Our Academics"
        description="A strong academic foundation through the CAPS curriculum, integrated Islamic learning and holistic learner development."
      />

      <Section tone="white" space="sm">
        <Container className="grid items-center gap-6 lg:grid-cols-2 lg:gap-10">
          <div>
            <SectionHeader label="Our Curriculum" title="Building Strong Foundations" className="text-left" variant="left" />
            <p className="mt-4 leading-8 text-gray-600">Hidayatul Islam College offers primary education from Grade R to Grade 7, following the CAPS curriculum alongside an integrated Islamic syllabus.</p>
            <p className="mt-3 leading-8 text-gray-600">Learning develops foundational literacy and numeracy, subject knowledge, personal responsibility and positive character.</p>
          </div>
          <Card variant="navy" className="p-6 sm:p-8">
            <h3 className="text-xl font-bold text-white">The 3 Rs</h3>
            <div className="mt-4"><SubjectList items={foundationalLearning} /></div>
          </Card>
        </Container>
      </Section>

      <GradeExplorer />

      <Section tone="navy" space="sm">
        <Container>
          <SectionHeader label="Faith & Learning" title="Islamic Syllabus Topics" description="Islamic learning supports spiritual development, good character and understanding of faith." variant="onNavy" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:mt-8 lg:grid-cols-3">
            {islamicTopics.map(({ icon: Icon, title }) => (
              <Card key={title} variant="ghost" className="text-center border-white/20 bg-white/5">
                <div className="flex justify-center"><Icon className="h-6 w-6 text-gold" /></div>
                <h3 className="mt-4 text-base font-semibold text-gold">{title}</h3>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="white" space="sm">
        <Container>
          <SectionHeader label="Our Approach" title="Educational Aims" description="Our approach supports learners academically while nurturing their character and confidence." variant="centered--tight" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:mt-8">
            {educationalAims.map(({ icon: Icon, title, description }) => (
              <Card key={title} variant="light">
                <Icon className="h-6 w-6 text-gold" />
                <h3 className="mt-4 text-base font-semibold text-navy">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-gray-600">{description}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="cream" space="sm">
        <Container>
          <SectionHeader label="Language Development" title="Literacy and Languages" description="Language learning supports communication, comprehension and participation across the curriculum." variant="centered--tight" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:mt-8 lg:grid-cols-3">
            {languageCards.map(({ icon: Icon, title, subtitle, description }) => (
              <Card key={title} variant="light" className="text-center">
                <div className="flex justify-center"><Icon className="h-7 w-7 text-gold" /></div>
                <h3 className="mt-4 text-base font-semibold text-navy">{title}</h3>
                <p className="mt-2 font-semibold text-gold">{subtitle}</p>
                <p className="mt-3 text-sm leading-7 text-gray-600">{description}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="white" space="sm">
        <Container>
          <SectionHeader label="Learner Well-being" title="Learner Support" description="Learners benefit from guidance, monitoring and collaboration between school and home." variant="centered--tight" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:mt-8 lg:grid-cols-3">
            {learnerSupport.map(({ icon: Icon, title, description }) => (
              <Card key={title} variant="light">
                <Icon className="h-6 w-6 text-gold" />
                <h3 className="mt-4 text-base font-semibold text-navy">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-gray-600">{description}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="cream" space="sm">
        <Container>
          <SectionHeader label="Beyond the Classroom" title="Sport & Co-Curricular Activities" description="Activities give learners opportunities to participate, develop skills and build connections." variant="centered--tight" />
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:mt-8 lg:grid-cols-4">
            {coCurricularActivities.map((item) => (
              <Card key={item} variant="light" className="text-center p-4">
                <BookOpen className="mx-auto h-6 w-6 text-navy" />
                <h3 className="mt-3 text-sm font-bold leading-5 text-navy sm:text-base">{item}</h3>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}