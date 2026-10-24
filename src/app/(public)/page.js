import Link from "next/link";
import { SectionHeader, StatStrip } from "@/components/ui/primitives";
import HomeHeroSlider from "@/components/public/HomeHeroSlider";

import {
  BookOpen,
  Megaphone,
  GraduationCap,
  ShieldCheck,
  Star,
  Landmark,
} from "lucide-react";

export default function Home() {
  const highlights = [
    { icon: <GraduationCap />, title: "Grade R-7", text: "Grades Offered" },
    { icon: <ShieldCheck />, title: "Independent School", text: "Registered with the Western Cape Education Department" },
    { icon: <Star />, title: "Opened in 1999", text: "Kensington, Cape Town" },
    { icon: <Landmark />, title: "Islamic Values", text: "Character & Community" },
  ];
  return (
    <>
      <HomeHeroSlider />

        <StatStrip items={highlights} />

        <section className="section-shell section-shell--white">
          <div className="mx-auto max-w-6xl text-center">
            <SectionHeader
              label="Quick Access"
              title="Everything you need, in one place"
              variant="centered--tight"
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
                JA
              </div>

              <h3 className="mt-6 font-serif text-lg font-semibold text-navy">Mr J. Alexander</h3>
              <p className="mt-2 text-sm text-gold">Principal</p>
            </div>

            <div>
              <SectionHeader
                label="Welcome"
                title={<>Hidayatul Islam{" "}<span className="block text-gold">Primary School</span></>}
                variant="left"
                divider={false}
              />

              <p className="mt-8 border-l-4 border-gold pl-6 text-base leading-7 text-gray-600">
                Welcome to Hidayatul Islam College Primary School in Kensington, Cape Town. Opened in 1999, the coeducational school offers Grades R to 7 and follows the CAPS curriculum with an integrated Islamic syllabus.
              </p>
            </div>
          </div>
        </section>
    </>
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