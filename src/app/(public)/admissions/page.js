import { PageHero, SectionHeader, CtaBanner } from "@/components/ui/primitives";
import { Section, Container } from "@/components/ui/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRightLeft, FileSignature, Trophy, RefreshCw } from "lucide-react";
import { schoolDocuments } from "@/lib/documents";

export const metadata = {
  title: "Admissions | Hidayatul Islam College",
  description: "Join the Hidayatul Islam College family. Learn about our admissions process, requirements, and how to apply.",
};

const admissionSteps = [
  { icon: FileText, title: "Registration Checklist", desc: "Download the registration checklist to ensure you have all the necessary documents ready.", href: schoolDocuments.admissions.checklist },
  { icon: ArrowRightLeft, title: "Transfer Form", desc: "Download this form only if the student is transferring from another school.", href: schoolDocuments.admissions.transfer },
  { icon: FileSignature, title: "Application Form", desc: "Download and complete thoroughly. Email the completed form accompanied by the R500 non-refundable fee.", href: schoolDocuments.admissions.application },
  { icon: Trophy, title: "Sporting Codes", desc: "Download our sporting codes selection form to choose your preferred sports.", href: schoolDocuments.admissions.sports },
  { icon: RefreshCw, title: "Re-registration", desc: "All current students should complete the re-registration form accompanied by a fee of R100.", href: schoolDocuments.admissions.reregistration },
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
            variant="left"
          />

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {admissionSteps.map((step) => (
              <Card key={step.title} variant="light">
                <step.icon className="h-6 w-6 text-gold" />
                <h3 className="mt-4 text-lg font-bold text-navy">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-gray-600 flex-1">
                  {step.desc}
                </p>
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <Button href={step.href} variant="ghost" className="px-0 text-gold hover:bg-transparent hover:text-gold-light">
                    Download Form &rarr;
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Super-stretched card (Removed gold left border) */}
          <div className="mt-12 w-full">
            <Card variant="pale" className="p-8 sm:p-10">
              <h3 className="text-xl font-bold text-navy">What happens next?</h3>
              <p className="mt-2 text-base leading-8 text-gray-600">
                We shall process your admission and update you with our final decision within <strong className="text-navy">15 days</strong> of receiving payment and all documentation.
              </p>
            </Card>
          </div>
        </Container>
      </Section>

      <CtaBanner
        title="Need help with your application?"
        description="If you are struggling to download the forms or have questions about the documentation required, our admissions team is here to assist you."
        actions={[{ label: "Contact Admissions", href: "/contact", variant: "primary" }]}
      />
    </>
  );
}