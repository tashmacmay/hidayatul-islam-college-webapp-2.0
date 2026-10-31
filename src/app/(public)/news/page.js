import { PageHero } from "@/components/ui/primitives";
import { Section, Container } from "@/components/ui/layout";
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

      <Section tone="white">
        <Container>
          <NewsList />
        </Container>
      </Section>
    </>
  );
}