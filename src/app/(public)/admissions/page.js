import { PageHero, SectionHeader, CtaBanner } from "@/components/ui/primitives";
import { Section, Container } from "@/components/ui/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRightLeft, FileSignature, Trophy, RefreshCw, CheckCircle } from "lucide-react";

export const metadata = {
  title: "Admissions | Hidayatul Islam College",
  description: "Join the Hidayatul Islam College family. Learn about our admissions process, requirements, and how to apply.",
};

const admissionSteps = [
  {
    icon: FileText,
    title: "Registration Checklist",
    desc: "Download the registration checklist to ensure you have all the necessary documents ready.",
    href: "#", // Replace with checklist PDF URL
  },
  {
    icon: ArrowRightLeft,
    title: "Transfer Form",
    desc: "Download this form only if the student is transferring from another school.",
    href: "#", // Replace with transfer form PDF URL
  },
  {
    icon: FileSignature,
    title: "Application Form",
    desc: "Download and complete thoroughly. Email the completed form accompanied by the R500 non-refundable fee.",
    href: "#", // Replace with application form PDF URL
  },
  {
    icon: Trophy,
    title: "Sporting Codes",
    desc: "Download our sporting codes selection form to choose your preferred sports.",
    href: "#", // Replace with sports form PDF URL
  },
  {
    icon: RefreshCw,
    title: "Re-registration",
    desc: "All current students should complete the re-registration form accompanied by a fee of R100.",
    href: "#", // Replace with re-registration PDF URL
  },
];

export default function Admissions() {
  return (
    <>
      <PageHero
        image="/images/HIC_KidsPointing.jpg"
        imageAlt="Admissions at Hidayatul Islam College"
        breadcrumb="Admissions"
        title={<>Our <span className="text-gold">Admissions</span></>}
        description="The staff all work very hard to ensure that all pupils are given the same opportunities and are able to access these."
      />

      <Section tone="white" space="sm">
        <Container>
          <SectionHeader
            label="Fair and Just"
            title="Equal Opportunities for All"
            description="This is regardless of gender, race, religious background, financial circumstances or disabilities. We firmly believe that this is essential to promote a fair and just school."
            variant="centered--tight"
          />

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {admissionSteps.map((step) => (
              <Card key={step.title} variant="light">
                <step.icon className="h-6 w-6 text-gold" />
                <h3 className="mt-4 text-lg font-bold text-navy">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-gray-600 flex-1">
                  {step.desc}
                </p>
                <div className="mt-6">
                  <Button href={step.href} variant="outline-gold" size="sm">
                    Download Form
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="cream" space="sm">
        <Container size="narrow">
          <div className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-gold" />
            <h2 className="mt-6 text-2xl font-bold text-navy">What happens next?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-gray-600">
              We shall process your admission and update you with our final decision within <strong className="text-navy">15 days</strong> of receiving payment and all documentation.
            </p>
          </div>
        </Container>
      </Section>

      <CtaBanner
        title="Have questions about joining HIC?"
        actions={[{ label: "Contact Admissions", href: "/contact", variant: "primary" }]}
      />
    </>
  );
}