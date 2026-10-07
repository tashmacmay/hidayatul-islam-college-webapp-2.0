import Link from "next/link";
import { SectionHeader } from "@/components/components";
import HomeHeroSlider from "@/components/home/HomeHeroSlider";

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
      <HomeHeroSlider />

        <section className="section-shell--gold grid text-navy md:grid-cols-4">
          {[
            { icon: <GraduationCap />, title: "Grade R-7", text: "Grades Offered" },
            { icon: <ShieldCheck />, title: "Registered & Accredited", text: "Department of Education" },
            { icon: <Star />, title: "40+ Years of Excellence", text: "Established 1982" },
            { icon: <Landmark />, title: "Islamic Values", text: "Character & Community" },
          ].map((item) => (
            <Highlight key={item.title} {...item} />
          ))}
        </section>

        <section className="section-shell section-shell--white">
          <div className="mx-auto max-w-6xl text-center">
            <SectionHeader
              label="Quick Access"
              title="Everything you need, in one place"
              dividerClassName="mx-auto mt-4 h-1 w-16 rounded-full bg-gold"
            />

            <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-3">
              {[
                { icon: <BookOpen />, title: "Educational Resources", text: "Videos, worksheets, and grade-specific learning materials.", href: "/resources", linkText: "Explore Resources" },
                { icon: <Megaphone />, title: "News & Announcements", text: "Stay up to date with school news, notices, and events.", href: "/news", linkText: "View News" },
                { icon: <Landmark />, title: "Contact Us", text: "Find school contact details, location information, and enquiries support.", href: "/contact", linkText: "Get in Touch" },
              ].map((item) => (
                <QuickCard key={item.href} {...item} />
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell section-shell--off-white">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[280px_1fr] lg:items-center">
            <div className="text-center lg:text-left">
              <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border-4 border-gold bg-white text-4xl font-bold text-navy lg:mx-0">
                AF
              </div>

              <h3 className="mt-6 font-serif text-lg font-semibold text-navy">Mrs. Ayesha Fridie</h3>
              <p className="mt-2 text-sm text-gold">Principal, Hidayatul Islam College</p>
            </div>

            <div>
              <SectionHeader
                label="A Word from Our Principal"
                title={<>A Word from{" "}<span className="block text-gold">Mrs. Fridie</span></>}
                className="text-left"
                dividerClassName=""
              />

              <blockquote className="mt-8 border-l-4 border-gold pl-6 text-base italic leading-7 text-gray-600">
                “At Hidayatul Islam College, we believe every child carries a light within them. Our role is to help that light shine — through knowledge, values, and a community that truly cares.”
              </blockquote>

              <p className="mt-8 leading-8 text-gray-600">
                Bismillah. Welcome to Hidayatul Islam College, a school that has served the Kensington community with pride and dedication for over four decades.
              </p>

              <p className="mt-6 leading-8 text-gray-600">
                We are an independent Islamic primary school where academic achievement goes hand in hand with character, compassion and faith.
              </p>

              <p className="mt-6 leading-8 text-gray-600">
                Together, we are raising the next generation of thinkers, leaders and believers. May Allah bless our collective efforts.
              </p>
            </div>
          </div>
        </section>
    </>
  );
}

function Highlight({ icon, title, text }) {
  return (
    <div className="flex items-center justify-center gap-4 border-r border-navy/15 px-6 py-6">
      <div className="text-navy [&>svg]:h-8 [&>svg]:w-8">{icon}</div>
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="text-sm">{text}</p>
      </div>
    </div>
  );
}

function QuickCard({ icon, title, text, href, linkText }) {
  return (
    <Link href={href} className="card-surface h-full transition hover:-translate-y-1 hover:border-gold hover:shadow-md">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-navy text-gold [&>svg]:h-7 [&>svg]:w-7">{icon}</div>
      <h3 className="mt-5 text-sm font-semibold text-navy">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-gray-600">{text}</p>
      <p className="mt-5 text-sm font-semibold text-gold">{linkText}</p>
    </Link>
  );
}