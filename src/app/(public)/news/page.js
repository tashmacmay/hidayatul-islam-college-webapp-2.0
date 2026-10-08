import { EmptyState, PageHero } from "@/components/ui/primitives";
import FilterButtons from "@/components/public/FilterButtons";

const filters = ["All", "News", "Events", "Achievements", "Notices", "Islamic"];

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
          <div className="mb-10 flex flex-wrap items-center gap-3">
            <span className="mr-2 text-xs font-semibold text-navy">Filter:</span>
            <FilterButtons items={filters} className="flex flex-wrap items-center gap-3" />
          </div>

          <div className="mx-auto max-w-4xl">
            <EmptyState
              icon={<span className="text-2xl">+</span>}
              title="No news or announcements yet"
              description="School news, events, achievements and important notices will appear here."
            />
          </div>
        </div>
      </section>

    </>
  );
}
