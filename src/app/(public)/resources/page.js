import { PageHero, CtaBanner } from "@/components/ui/primitives";
import ResourceView from "@/components/public/ResourceView";

export const metadata = {
  title: "Learning Resources | Hidayatul Islam College",
  description: "Access free educational materials, worksheets, and videos provided openly to our community.",
};

export default function Resources() {
  return (
    <>
      <PageHero
        image="/images/HIC-image2.jpg"
        imageAlt="Learning Resources"
        breadcrumb="Resources"
        title={<>Learning <span className="text-gold">Resources</span></>}
        description="The school makes learning materials freely available to everyone, including the wider community. No login or school registration is required."
      />
      
      <ResourceView />

      <CtaBanner
        eyebrow="Parent Portal"
        title="More resources in the Parent Portal"
        actions={[{ label: "Portal Login", href: "/login", variant: "primary" }]}
      />
    </>
  );
}