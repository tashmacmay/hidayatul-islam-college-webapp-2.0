import { PageHero, SectionHeader, SubjectList, IconCard } from "@/components/ui/primitives";
import {
  BookOpen,
  HeartHandshake,
  Languages,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import GradeExplorer from "@/components/public/GradeExplorer";

const foundationalLearning = [
  "Reading",
  "Writing",
  "Arithmetic",
];

const islamicTopics = [
  { icon: BookOpen, title: "Fiqh" },
  { icon: ShieldCheck, title: "Islamic History" },
  { icon: HeartHandshake, title: "Adaab & Akhlaaq" },
  { icon: Users, title: "Masnoon/Daily duahs" },
  { icon: Star, title: "Selective Surah Reading" },
];

const educationalAims = [
  { number: "01", title: "Foundational Learning", description: "The booklet emphasizes reading, writing and arithmetic." },
  { number: "02", title: "CAPS and Islamic Syllabus", description: "The school follows the secular CAPS curriculum with an integrated Islamic syllabus." },
  { number: "03", title: "Holistic Development", description: "The school's aims include learners' academic, economic, social, religious, cultural and sporting development." },
  { number: "04", title: "Character and Relationships", description: "The booklet describes developing learners rooted in Godliness, with positive relationships and a positive approach to life's challenges." },
];

const languageCards = [
  { icon: "📖", title: "Literacy", subtitle: "Foundation Phase · Grades R–3", description: "Listed as a Foundation Phase subject." },
  { icon: "🇬🇧", title: "English Home Language", subtitle: "Intermediate and Grade 7", description: "Listed for Grades 4–6 and Grade 7." },
  { icon: "🇿🇦", title: "Afrikaans First Additional Language", subtitle: "Intermediate and Grade 7", description: "Listed for Grades 4–6 and Grade 7." },
];

const learnerSupport = [
  { icon: BookOpen, title: "Early Identification", description: "Teachers identify learning difficulties and barriers to progress early." },
  { icon: HeartHandshake, title: "Individual and Small-Group Support", description: "Support may include individual attention and small-group or one-to-one intervention." },
  { icon: Languages, title: "Literacy and Numeracy", description: "Intervention can reinforce foundational literacy and numeracy skills." },
  { icon: Users, title: "Monitoring and Parent Partnership", description: "Progress is monitored, and parents are kept informed and involved." },
  { icon: Star, title: "Further Referral", description: "Referral for further assessment or specialised support may be considered when necessary." },
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
        description="A coeducational primary school offering Grades R–7, following the secular CAPS curriculum with an integrated Islamic syllabus."
      />

      <section className="section-shell section-shell--white">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <SectionHeader
              label="Our Curriculum"
              title={<>A Whole-Child{" "}<span className="block">Education</span></>}
              className="text-left"
              variant="left"
            />

            <p className="mt-8 body-copy">
              Hidayatul Islam College is coeducational and offers Grades R to 7. The school follows the secular CAPS curriculum with an integrated Islamic syllabus.
            </p>
            <p className="mt-6 body-copy">
              The booklet emphasizes the foundations of learning: reading, writing and arithmetic.
            </p>
          </div>

          <div className="card-navy p-8 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[3px] text-gold">Foundational Learning</p>
            <h3 className="mt-4 text-lg font-semibold">The 3 Rs</h3>

            <SubjectList items={foundationalLearning} />

            <div className="mt-10 border-t border-white/20 pt-8">
              <p className="text-xs font-semibold uppercase tracking-[3px] text-gold">Curriculum</p>
              <h3 className="mt-4 text-lg font-semibold">CAPS with an Integrated Islamic Syllabus</h3>
            </div>
          </div>
        </div>
      </section>

      <GradeExplorer />

      <section className="section-shell section-shell--navy">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            label="Faith & Knowledge"
            title="Islamic Syllabus Topics"
            description="The booklet lists the following topics within its Islamic Studies syllabus."
            variant="onNavy"
          />

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {islamicTopics.map(({ icon: Icon, title }) => (
              <IconCard
                key={title}
                icon={<Icon className="h-5 w-5 text-gold" />}
                title={title}
                variant="dark"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell section-shell--white">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <SectionHeader
              label="How We Teach"
              title="Educational Aims"
              description="The booklet describes foundational learning, holistic development and character as part of the school's educational aims."
              variant="centered"
            />
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {educationalAims.map((item) => (
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
              label="Subjects by Phase"
              title="Literacy and Languages"
              description="The booklet lists literacy in Foundation Phase, and English Home Language and Afrikaans First Additional Language in Grades 4–7."
              variant="centered"
            />
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {languageCards.map((item) => (
              <IconCard
                key={item.title}
                icon={item.icon}
                title={item.title}
                variant="language"
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
              label="Learner Support"
              title="Learning Intervention"
              className="text-left"
              variant="left"
            />
            <p className="mt-8 body-copy">The school aims to identify learning difficulties and barriers to progress early, then provide appropriate support.</p>
            <p className="mt-6 body-copy">Support may include individual attention, small-group or one-to-one intervention, and reinforcement of foundational literacy and numeracy.</p>
            <p className="mt-6 body-copy">Teachers monitor progress and work with parents. Further assessment or specialised support may be referred to when necessary.</p>
          </div>

          <div className="space-y-3">
            {learnerSupport.map(({ icon: Icon, title, description }) => (
              <IconCard
                key={title}
                icon={<Icon className="h-5 w-5 text-navy" />}
                title={title}
                variant="assessment"
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
            title="Sport & Co-Curricular Activities"
            description="The booklet describes school sports and co-curricular activities, including educational outings."
            variant="centered"
          />

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              "Athletics",
              "Soccer",
              "Tag Rugby",
              "Swimming",
              "Co-Curricular Activities",
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