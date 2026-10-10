import { PageHero } from "@/components/ui/primitives";
import NewsList from "@/components/public/NewsList";

export default function News() {
  return (
    <>
      <PageHero
        image="/images/HIC-image2.jpg"
        imageAlt="News and announcements"
        breadcrumb="News & Announcements"
        title={<>News & <span className="text-gold">Announcements</span></>}
        description="Stay up to date with everything happening at Hidayatul Islam College — events, achievements, notices, and community news."
      />

      <section className="section-shell section-shell--off-white">
        <div className="mx-auto max-w-6xl">
          <NewsList />
        </div>
      </section>
    </>
  );
}