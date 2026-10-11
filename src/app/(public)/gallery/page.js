import { PageHero, PopiaNote, SectionHeader } from "@/components/ui/primitives";
import GalleryGrid from "@/components/public/GalleryGrid";

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

          <div className="mt-10">
            <GalleryGrid />
          </div>
        </div>
      </section>

    </>
  );
}
