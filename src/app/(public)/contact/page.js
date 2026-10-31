import { CtaBanner, InfoRow, PageHero, SectionHeader } from "@/components/ui/primitives";
import { Section, Container } from "@/components/ui/layout";
import { Card } from "@/components/ui/card";
import { MapPin, Phone, Mail } from "lucide-react";

export const metadata = {
  title: "Contact Us | Hidayatul Islam College",
  description: "Get in touch with Hidayatul Islam College for admissions, enquiries, and location details.",
};

const contactRows = [
  {
    icon: <MapPin size={20} />,
    title: "Address",
    content: (
      <p className="mt-1 text-sm leading-6 text-gray-600">
        Corner of Second Avenue and Tenth Street<br />
        Kensington, Cape Town<br />
        South Africa
      </p>
    ),
  },
  {
    icon: <Phone size={20} />,
    title: "Phone",
    content: (
      <div className="mt-1 space-y-1 text-sm text-gray-600">
        <a href="tel:+27215937544" className="block transition hover:text-gold">021 593 7544</a>
        <a href="tel:+27215936423" className="block transition hover:text-gold">021 593 6423</a>
      </div>
    ),
  },
  {
    icon: <Mail size={20} />,
    title: "Email",
    content: (
      <div className="mt-1 text-sm leading-6 text-gray-600">
        <a href="mailto:hidayatulprimary@gmail.com" className="block transition hover:text-gold">hidayatulprimary@gmail.com</a>
        <p className="mt-3 font-semibold text-navy">Principal &amp; Chief Operations Officer contact</p>
        <p>Mr J. Alexander — Principal<br />Mrs A. Fridie — Chief Operations Officer</p>
        <a href="mailto:afridie@hidayatulprimary.co.za" className="block transition hover:text-gold">afridie@hidayatulprimary.co.za</a>
      </div>
    ),
  },
];

export default function Contact() {
  return (
    <>
      <PageHero
        image="/images/HIC-image2.jpg"
        imageAlt="Contact Hidayatul Islam College"
        breadcrumb="Contact Us"
        title={<>Get in <span className="text-gold">Touch</span></>}
        description="We would love to hear from you. Contact Hidayatul Islam College for enquiries, admissions and general information."
      />

      <Section tone="white">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            <div>
              <SectionHeader label="Find Us" title="Contact Information" className="text-left" variant="left" />
              <p className="mt-6 max-w-xl text-sm leading-7 text-gray-600">
                Whether you have a question about admissions, the curriculum, school activities or any other matter, our team is here to assist you.
              </p>
              <div className="mt-8 space-y-4">
                {contactRows.map((row) => (
                  <InfoRow key={row.title} icon={row.icon} title={row.title}>{row.content}</InfoRow>
                ))}
              </div>
            </div>

            <Card variant="light" padded={false} className="overflow-hidden border-t-4 border-t-gold">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-navy px-5 py-4 text-white md:px-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[3px] text-gold">Find Us</p>
                  <h3 className="mt-1 text-base font-semibold">Hidayatul Islam College</h3>
                </div>
                <MapPin size={24} className="text-gold" />
              </div>
              <div className="h-[480px] w-full bg-gray-100 sm:h-[560px] lg:h-[640px]">
                <iframe
                  title="Google Maps search for Hidayatul Islam College near Second Avenue and Tenth Street, Kensington, Cape Town"
                  src="https://maps.google.com/maps?q=Corner%20of%20Second%20Avenue%20and%20Tenth%20Street%2C%20Kensington%2C%20Cape%20Town&output=embed"
                  loading="lazy"
                  className="h-full w-full border-0"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </Card>
          </div>
        </Container>
      </Section>

      <Section tone="cream">
        <Container>
          <div className="text-center">
            <SectionHeader label="Other Ways to Reach Us" title="Quick Contacts" description="For more information, please get in touch with the school through the contact details provided above." variant="centered" />
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { title: "Admissions", text: "Enquire about applications, admissions and joining the HIC community." },
              { title: "General Enquiries", text: "Have a question about the school? Our team will be happy to assist." },
              { title: "School Information", text: "Contact us for information about academics, activities and school programmes." },
            ].map((item) => (
              <Card key={item.title} variant="light" className="text-center">
                <h3 className="text-base font-semibold text-navy">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">{item.text}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <CtaBanner
        title="Ready to be part of the HIC family?"
        actions={[{ label: "Email Us", href: "mailto:hidayatulprimary@gmail.com", variant: "primary" }]}
      />
    </>
  );
}