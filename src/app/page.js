import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

import {
  BookOpen,
  Megaphone,
  GraduationCap,
  ShieldCheck,
  Star,
  Landmark,
} from "lucide-react";

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        <section className="relative h-[640px] overflow-hidden bg-navy text-white">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/hero.jpg')",
            }}
          />

          <div className="absolute inset-0 bg-navy/70" />

          <div className="relative z-10 flex h-full items-center px-10">
            <div className="max-w-xl">
              <div className="mb-6 flex items-center gap-5">
                <div className="flex h-28 w-28 items-center justify-center rounded-full border-[3px] border-gold bg-white">
                  <img
                    src="/images/HIC_Logo2.png"
                    alt="Hidayatul Islam College Logo"
                    className="h-24 w-24 object-contain"
                  />
                </div>

                <div>
                  <h1 className="text-4xl font-bold leading-tight">
                    Hidayatul Islam
                    <span className="block text-gold">College</span>
                  </h1>

                  <p className="mt-2 text-sm font-medium text-gold">
                    Knowledge is Light
                  </p>
                </div>
              </div>

              <div className="mb-8 inline-block rounded-full border border-gold/40 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[2px] text-gold">
                Est. 1982 - Kensington, Cape Town
              </div>

              <h2 className="text-5xl font-bold leading-tight">
                Nurturing Minds,
                <span className="block text-gold">Illuminating Futures</span>
              </h2>

              <p className="mt-6 max-w-lg text-base leading-8 text-blue-100">
                An independent community primary school rooted in Islamic values,
                dedicated to academic excellence and holistic development from
                Grade R to Grade 7.
              </p>

              <div className="mt-8 flex gap-4">
                <a
                  href="/about"
                  className="rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-navy hover:bg-gold-light"
                >
                  Explore Our School
                </a>

                <a
                  href="/academics"
                  className="rounded-lg border border-white/50 px-6 py-3 text-sm font-semibold text-white hover:bg-white hover:text-navy"
                >
                  Academics
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="grid bg-gold text-navy md:grid-cols-4">
          <Highlight
            icon={<GraduationCap />}
            title="Grade R-7"
            text="Grades Offered"
          />
          <Highlight
            icon={<ShieldCheck />}
            title="Registered & Accredited"
            text="Department of Education"
          />
          <Highlight
            icon={<Star />}
            title="40+ Years of Excellence"
            text="Established 1982"
          />
          <Highlight
            icon={<Landmark />}
            title="Islamic Values"
            text="Character & Community"
          />
        </section>

        <section className="px-10 py-20">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[3px] text-gold">
              Quick Access
            </p>

            <h2 className="mt-3 text-3xl font-bold text-navy">
              Everything you need, in one place
            </h2>

            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gold" />

            <div className="mx-auto mt-12 grid max-w-3xl gap-6 md:grid-cols-2">
              <QuickCard
                icon={<BookOpen />}
                title="Educational Resources"
                text="Videos, worksheets, and grade-specific learning materials."
                href="/resources"
                linkText="Explore Resources"
              />

              <QuickCard
                icon={<Megaphone />}
                title="News & Announcements"
                text="Stay up to date with school news, notices, and events."
                href="/news"
                linkText="View News"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

function Highlight({ icon, title, text }) {
  return (
    <div className="flex items-center justify-center gap-4 border-r border-navy/15 px-6 py-6">
      <div className="text-navy [&>svg]:h-8 [&>svg]:w-8">{icon}</div>
      <div>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-sm">{text}</p>
      </div>
    </div>
  );
}

function QuickCard({ icon, title, text, href, linkText }) {
  return (
    <a
      href={href}
      className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:border-gold hover:shadow-md"
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-navy text-gold [&>svg]:h-7 [&>svg]:w-7">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-bold text-navy">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-gray-600">{text}</p>

      <p className="mt-5 text-sm font-semibold text-gold">{linkText}</p>
    </a>
  );
}