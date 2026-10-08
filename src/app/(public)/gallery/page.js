import { Images } from "lucide-react";
import { EmptyState, PageHero, PopiaNote, SectionHeader } from "@/components/ui/primitives";
import FilterButtons from "@/components/public/FilterButtons";

const categories = ["All", "Sport", "Islamic Events", "Academic", "School Events", "Outings"];

export default function Gallery() {
  return (
    <>
      <PageHero
        image="/images/HIC-image2.jpg"
        imageAlt="Gallery and Media"
        breadcrumb="Gallery & Media"
        title={<>Gallery & <span className="text-gold">Media</span></>}
        description="A window into life at Hidayatul Islam College — events, learning, sport, and community moments captured throughout the year."
      />

      <section className="section-shell section-shell--white">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            label="Our Moments"
            title="School Life in Pictures"
            className="text-center"
            variant="centered--tight"
          />

          <PopiaNote className="mx-auto mt-8 max-w-5xl">
            Photos will only be published once the appropriate consent has been obtained. Images containing learners must be handled in accordance with the Protection of Personal Information Act (POPIA).
          </PopiaNote>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <FilterButtons items={categories} className="flex flex-wrap justify-center gap-3" />
          </div>

          <div className="mt-10">
            <EmptyState
              icon={<Images className="h-6 w-6" />}
              title="No gallery photos yet"
              description="Photos from school events, learning activities, sport, outings and community moments will appear here once they are uploaded by the school."
              variant="gallery"
              titleElement="h3"
            />
          </div>
        </div>
      </section>

    </>
  );
}
