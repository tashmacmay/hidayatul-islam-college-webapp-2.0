import { PageHero, SectionHeader } from "@/components/components";
import {
  BookOpen,
  HeartHandshake,
  Languages,
  MapPin,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import GradeExplorer from "@/components/GradeExplorer";
import { IconCard } from "@/components/components";

const islamicTopics = [
  { icon: BookOpen, title: "Quran Recitation & Hifz", description: "Daily Quran lessons focus on Tajweed, understanding and memorisation." },
  { icon: ShieldCheck, title: "Aqeedah & Fiqh", description: "Foundational Islamic theology and jurisprudence for everyday life." },
  { icon: Star, title: "Seerah & Islamic History", description: "Inspiring lessons from the life of the Prophet ﷺ and Islamic civilisation." },
  { icon: Languages, title: "Arabic Language", description: "Reading, writing and conversational Arabic taught progressively." },
  { icon: HeartHandshake, title: "Akhlaq & Character", description: "Islamic ethics and good character integrated into daily school life." },
  { icon: MapPin, title: "Salah & Daily Practice", description: "Practical worship, du'a and daily Islamic habits reinforced throughout the school day." },
];

const teachingApproaches = [
  { number: "01", title: "Differentiated Instruction", description: "Our educators plan lessons that meet learners where they are, adapting teaching strategies to ensure every child can thrive." },
  { number: "02", title: "Values-Integrated Learning", description: "Islamic values are woven throughout the curriculum, shaping character alongside academic growth." },
  { number: "03", title: "Active & Collaborative Learning", description: "Learners participate through discussion, teamwork, projects, presentations and hands-on activities." },
  { number: "04", title: "Parent & Community Partnership", description: "We work closely with parents to support every learner's educational journey both at school and at home." },
];

const languageCards = [
  { icon: "🇿🇦", title: "English", subtitle: "Home Language / FAL", description: "English serves as the primary language of learning and teaching, developing strong reading, writing and communication skills." },
  { icon: "🇿🇦", title: "Afrikaans", subtitle: "First Additional Language", description: "Afrikaans is offered as a First Additional Language, recognising its importance in our local context." },
  { icon: "🕌", title: "Arabic", subtitle: "Islamic & Quran Studies", description: "Arabic is taught from Grade R as both a language of worship and a gateway to understanding the Quran." },
];

const assessmentMethods = [
  { icon: BookOpen, title: "Continuous Assessment (CASS)", description: "Projects, class activities, oral tasks and written work contribute to term marks." },
  { icon: ShieldCheck, title: "Formal Examinations", description: "Mid-year and end-of-year examinations prepare learners for future academic success." },
  { icon: Users, title: "Term Reports", description: "Four comprehensive reports are issued annually with opportunities for parent consultations." },
  { icon: HeartHandshake, title: "Islamic Studies Assessment", description: "Quran recitation, Islamic Studies tests and character development form part of our holistic assessment approach." },
];

export default function Academics() {
  return (
    <>
      <PageHero
        pattern="dots"
        image="/images/HIC-image2.jpg"
        imageAlt="Academics"
        breadcrumb="Academics"
        title={<>Our <span className="text-gold">Academics</span></>}
        description="A balanced, enriching curriculum that combines the South African national programme with Islamic studies, preparing every learner for life in all its dimensions."
      />

      <section className="section-shell section-shell--white">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <SectionHeader
              label="Our Curriculum"
              title={<>A Whole-Child{" "}<span className="block">Education</span></>}
              className="text-left"
              dividerClassName="gold-divider"
            />

            <p className="mt-8 body-copy">
              At Hidayatul Islam College, we follow the South African national curriculum as prescribed by the Department of Basic Education, offering the full Grades R through 7 programme.
            </p>
            <p className="mt-6 body-copy">
              This is enriched by a comprehensive Islamic studies curriculum, ensuring our learners develop academically and spiritually in equal measure.
            </p>
            <p className="mt-6 body-copy">
              We believe that excellence in secular knowledge and excellence in Islamic knowledge are not in competition — they are two wings of the same bird.
            </p>
          </div>

          <div className="card-navy p-8 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[3px] text-gold">National Curriculum (CAPS)</p>
            <h3 className="mt-4 text-lg font-semibold">DoE-Registered Subjects</h3>

            <ul className="mt-6 space-y-3 text-sm text-blue-100">
              <li><span className="mr-2 text-gold">•</span>Home Language (English / Afrikaans)</li>
              <li><span className="mr-2 text-gold">•</span>First Additional Language</li>
              <li><span className="mr-2 text-gold">•</span>Mathematics</li>
              <li><span className="mr-2 text-gold">•</span>Life Skills / Social Sciences</li>
              <li><span className="mr-2 text-gold">•</span>Natural Sciences & Technology</li>
              <li><span className="mr-2 text-gold">•</span>Economic & Management Sciences</li>
            </ul>

            <div className="mt-10 border-t border-white/20 pt-8">
              <p className="text-xs font-semibold uppercase tracking-[3px] text-gold">Islamic Enrichment</p>
              <h3 className="mt-4 text-lg font-semibold">Faith & Character Subjects</h3>

              <ul className="mt-6 space-y-3 text-sm text-blue-100">
                <li><span className="mr-2 text-gold">•</span>Islamic Studies (Fiqh, Aqeedah, Seerah)</li>
                <li><span className="mr-2 text-gold">•</span>Quran Recitation & Memorisation</li>
                <li><span className="mr-2 text-gold">•</span>Arabic Language</li>
                <li><span className="mr-2 text-gold">•</span>Islamic History & Ethics</li>
                <li><span className="mr-2 text-gold">•</span>Du&apos;a and Salah</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <GradeExplorer />

      <section className="section-shell section-shell--navy">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            label="Faith & Knowledge"
            title="Islamic Studies Programme"
            description="Our Islamic curriculum runs alongside the national programme from Grade R to Grade 7, nurturing learners who are grounded in their faith and equipped for the world."
            titleClassName="mt-3 text-xl font-bold leading-tight md:text-2xl"
            descriptionClassName="mx-auto mt-6 max-w-3xl leading-7 text-blue-100"
            className="text-center"
          />

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {islamicTopics.map(({ icon: Icon, title, description }) => (
              <IconCard
                key={title}
                icon={<Icon className="h-5 w-5 text-gold" />}
                title={title}
                className="card-academic-dark"
                iconClassName=""
                contentClassName=""
                titleClassName="mt-3 text-base font-semibold text-gold"
              >
                <p className="mt-3 text-sm leading-6 text-blue-100">{description}</p>
              </IconCard>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell section-shell--white">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <SectionHeader
              label="How We Teach"
              title="Our Teaching Philosophy"
              description="We draw on evidence-based pedagogical approaches and Islamic educational traditions to create classrooms where every learner is seen, heard, and challenged."
              descriptionClassName="mx-auto mt-6 max-w-3xl leading-7 text-gray-600"
            />
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {teachingApproaches.map((item) => (
              <div key={item.number} className="card-soft">
                <span className="text-2xl font-bold text-gold/30">{item.number}</span>
                <h3 className="mt-3 text-base font-semibold text-navy">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell section-shell--off-white">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <SectionHeader
              label="Language of Learning"
              title="Languages at HIC"
              description="We honour the multilingual identities of our learners while providing strong foundations in English, Afrikaans and Arabic."
              descriptionClassName="mx-auto mt-6 max-w-3xl leading-7 text-gray-600"
            />
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {languageCards.map((item) => (
              <IconCard
                key={item.title}
                icon={item.icon}
                title={item.title}
                className="card-academic-light text-center"
                iconClassName="text-2xl"
                contentClassName=""
                titleClassName="mt-4 text-base font-semibold text-navy"
              >
                <p className="mt-2 text-gold font-semibold">{item.subtitle}</p>
                <p className="mt-4 text-sm leading-7 text-gray-600">{item.description}</p>
              </IconCard>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell section-shell--gold-pale">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <SectionHeader
              label="How We Track Progress"
              title="Assessment & Reporting"
              className="text-left"
              dividerClassName="gold-divider"
            />
            <p className="mt-8 body-copy">Assessment at Hidayatul Islam College is continuous, formative, and designed to support learning — not just measure it.</p>
            <p className="mt-6 body-copy">We follow CAPS assessment requirements while also tracking learners&apos; growth in Islamic character, leadership and personal development.</p>
            <p className="mt-6 body-copy">Parents receive regular progress reports and have opportunities to engage directly with teachers throughout the year.</p>
          </div>

          <div className="space-y-3">
            {assessmentMethods.map(({ icon: Icon, title, description }) => (
              <IconCard
                key={title}
                icon={<Icon className="h-5 w-5 text-navy" />}
                title={title}
                className="card-assessment"
                iconClassName=""
                contentClassName=""
                titleClassName="mt-3 font-bold text-navy"
              >
                <p className="mt-2 text-sm text-gray-600">{description}</p>
              </IconCard>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell section-shell--white">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            label="Beyond the Classroom"
            title="Extramural & Enrichment Activities"
            description="Learning doesn&apos;t stop at the classroom door. We provide opportunities that develop the whole child."
            descriptionClassName="mx-auto mt-6 max-w-3xl leading-7 text-gray-600"
            className="text-center"
          />

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
              <div key={item} className="rounded-xl border border-gray-200 bg-off-white p-5 text-center shadow-sm transition hover:border-gold/40 hover:shadow-md">
                <BookOpen className="mx-auto h-5 w-5 text-navy" />
                <h3 className="mt-3 font-bold text-navy">{item}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}