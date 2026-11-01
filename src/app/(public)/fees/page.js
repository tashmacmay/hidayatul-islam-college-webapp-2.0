import { PageHero, SectionHeader, CtaBanner } from "@/components/ui/primitives";
import { Section, Container } from "@/components/ui/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, CalendarRange, CreditCard, Banknote, AlertCircle, Download } from "lucide-react";
import { schoolDocuments } from "@/lib/documents";

export const metadata = {
  title: "School Fees | Hidayatul Islam College",
  description: "View the fee structure, payment options, and financial policies for Hidayatul Islam College.",
};

const paymentSchedules = [
  { icon: CalendarDays, title: "Monthly", desc: "Paid in advance at the beginning of each month." },
  { icon: CalendarRange, title: "Termly", desc: "Paid in advance at the beginning of each term." },
  { icon: CreditCard, title: "Annually", desc: "Paid in full before the 28th of February." },
];

export default function Fees() {
  return (
    <>
      <PageHero
        image="/images/HIC_Field.jpg"
        imageAlt="School Fees at Hidayatul Islam College"
        breadcrumb="Fees"
        title={<>Funding <span className="text-gold">Model</span></>}
        description="We are an Independent Community-based school registered with the Department of Education (WCED)."
      />

      <Section tone="white" space="sm">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start mb-16">
            {/* Left side: Intro & Download */}
            <div>
              <SectionHeader
                label="Financial Management"
                title="Our Funding Model"
                variant="left"
                divider={true}
              />
              <div className="mt-6 space-y-4 text-base leading-8 text-gray-600">
                <p>
                  School fees cover our high running costs and are vital to maintaining our educational standards. We are proud to partner with families who value education and understand the necessity of funding a quality, community-based school.
                </p>
                <p className="font-medium text-navy">
                  Our Governing Body manages finances tightly to ensure an unqualified Financial Audit each year.
                </p>
              </div>
              
              <div className="mt-8">
                <Button 
                  href={schoolDocuments.fees.structure} 
                  variant="primary" 
                  className="px-8 py-4 text-base inline-flex items-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  Download Fee Structure
                </Button>
              </div>
            </div>

            {/* Right side: Payment Schedules (Navy Block, Horizontal layout) */}
            <Card variant="navy" className="p-8">
              <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4">Payment Schedules</h3>
              <p className="mt-4 text-sm text-blue-100 mb-2">School fees must be paid according to one of the following schedules:</p>
              
              <div className="flex flex-col">
                {paymentSchedules.map((opt) => (
                  <div key={opt.title} className="flex items-center gap-5 py-5 border-b border-white/10 last:border-0 last:pb-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-gold">
                      <opt.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">{opt.title}</h4>
                      <p className="text-sm text-blue-100 mt-1">{opt.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Payment Methods Banner */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row items-center gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
              <Banknote className="h-7 w-7" />
            </div>
            <div>
              <h4 className="font-bold text-navy text-lg">Accepted Payment Methods</h4>
              <p className="text-sm text-gray-600 mt-1">
                <strong className="text-navy">Cash</strong> payments are accepted at the school office during operating hours. Electronic transfers (EFT) can also be made using the banking details provided on your invoice.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="cream" space="sm">
        <Container>
          <SectionHeader 
            label="Withdrawals" 
            title="Notice of Intent to Leave" 
            description="Please read carefully regarding withdrawals from The Group of Schools OR a division of the Group of Schools."
            variant="centered--tight" 
          />
          
          <div className="mt-8 w-full">
            <Card variant="light" className="p-8 sm:p-10 text-center sm:text-left shadow-sm">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="space-y-4 text-base leading-8 text-gray-600">
                  <p>
                    A <strong className="text-navy">three month notice period</strong> must be given if a parent intends withdrawing a student from one of the divisions, unless they intend leaving at the end of Grade 7.
                  </p>
                  <p>
                    Fees will be due for three months after receipt of an <strong className="text-navy">EXIT FORM</strong>, which is available from Reception.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </Section>

      <CtaBanner
        title="Need to discuss payment arrangements?"
        actions={[{ label: "Contact the Office", href: "/contact", variant: "primary" }]}
      />
    </>
  );
}