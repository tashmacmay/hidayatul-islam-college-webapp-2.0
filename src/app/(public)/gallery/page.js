import { PageHero, PopiaNote } from "@/components/ui/primitives";
import GalleryGrid from "@/components/public/GalleryGrid";
import { Section, Container } from "@/components/ui/layout";

export const metadata = {
  title: "Gallery | Hidayatul Islam College",
  description: "View photos of school life, events, sports, and learning at Hidayatul Islam College.",
};

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


      <Section tone="white">
        <Container>
          <PopiaNote className="mb-10">
            Gallery images featuring learners will only be published once the appropriate consent has been obtained, in accordance with the Protection of Personal Information Act (POPIA).
          </PopiaNote>
          <GalleryGrid />
        </Container>
      </Section>
    </>
  );
}