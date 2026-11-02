import { PageHero, PopiaNote } from "@/components/ui/primitives";
import { Section, Container } from "@/components/ui/layout";
import NewsList from "@/components/public/NewsList";

export const metadata = {
  title: "News & Announcements | Hidayatul Islam College",
  description: "Stay up to date with the latest news, events, and notices from Hidayatul Islam College.",
};

export default function News() {
  return (
    <>
      <PageHero
        image="/images/HIC_GirlsDresses.jpg"
        imageAlt="News and announcements"
        breadcrumb="News & Announcements"
        title={<>News & <span className="text-gold">Announcements</span></>}
        description="Stay up to date with everything happening at Hidayatul Islam College — events, achievements, notices, and community news."
      />

      <Section tone="white">
        <Container>
          <PopiaNote className="mb-10">
            News articles featuring learners will only be published once the appropriate consent has been obtained, in accordance with the Protection of Personal Information Act (POPIA).
          </PopiaNote>

          <NewsList />
        </Container>
      </Section>
    </>
  );
}