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
  {
    icon: CalendarDays,
    title: "Monthly",
    desc: "Paid in advance at the beginning of each month.",
  },
  {
    icon: CalendarRange,
    title: "Termly",
    desc: "Paid in advance at the beginning of each term.",
  },
  {
    icon: CreditCard,
    title: "Annually",
    desc: "Paid in full before the 28th of February.",
  },
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
          <SectionHeader
            label="Financial Management"
            title="Our Funding Model"
            description="School fees cover our high running costs and are vital to maintaining our educational standards. We are proud to partner with families who value education and understand the necessity of funding a quality, community-based school."
            variant="centered--tight"
          />

          <div className="mx-auto mt-6 max-w-3xl text-center">
            <p className="text-sm font-semibold text-navy mb-8">
              Our Governing Body manages finances tightly to ensure an unqualified Financial Audit each year.
            </p>
            
            {/* DOWNLOAD AT THE TOP */}
            <Button 
              href={schoolDocuments.fees.structure} 
              variant="primary" 
              className="px-8 py-4 text-base inline-flex items-center gap-2"
            >
              <Download className="h-5 w-5" />
              Download Fee Structure
            </Button>
            <p className="mt-3 text-xs font-medium text-gray-500 uppercase tracking-widest">PDF Format</p>
          </div>

          <div className="mt-20">
            <SectionHeader
              title="Payment Schedules"
              description="School fees must be paid according to one of the following schedules:"
              variant="centered"
            />

            <div className="mt-10 grid gap-4 sm:grid-cols-3 max-w-4xl mx-auto">
              {paymentSchedules.map((opt) => (
                <Card key={opt.title} variant="light" className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-navy/5 text-navy">
                    <opt.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-base font-bold text-navy">{opt.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-600">{opt.desc}</p>
                </Card>
              ))}
            </div>

            {/* SEPARATED PAYMENT METHODS */}
            <div className="mt-10 max-w-4xl mx-auto rounded-2xl bg-cream p-6 text-center sm:p-8 flex flex-col sm:flex-row items-center justify-center gap-4 border border-gold/20">
              <Banknote className="h-6 w-6 text-gold shrink-0" />
              <p className="text-sm font-medium text-navy text-left">
                <span className="font-bold">Payment Methods:</span> Cash payments are accepted at the school office during operating hours. Electronic transfers (EFT) can also be made using the banking details provided on your invoice.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="cream" space="sm">
        <Container>
          <div className="mx-auto max-w-4xl">
            {/* NOTICE TO LEAVE - NOW WHITE */}
            <Card variant="light" className="sm:p-10 border-l-4 border-l-gold">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center border-b border-gray-100 pb-5 mb-5">
                <AlertCircle className="h-8 w-8 shrink-0 text-gold" />
                <div>
                  <h2 className="text-xl font-bold text-navy">Notice of Intent to Leave</h2>
                  <p className="mt-1 text-sm text-gray-500">Please read carefully regarding withdrawals.</p>
                </div>
              </div>
              
              <div className="space-y-4 text-sm leading-7 text-gray-600">
                <p>
                  Notice of intention to leave The Group of Schools OR a division of the Group of Schools.
                </p>
                <p>
                  A <strong className="text-navy">three month notice period</strong> must be given if a parent intends withdrawing a student from one of the divisions, unless they intend leaving at the end of Grade 7.
                </p>
                <p>
                  Fees will be due for three months after receipt of an <strong className="text-navy">EXIT FORM</strong>, which is available from Reception.
                </p>
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