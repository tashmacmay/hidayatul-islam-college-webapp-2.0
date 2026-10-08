import { CtaBanner, InfoRow, PageHero, SectionHeader } from "@/components/components";

const contactRows = [
  { icon: "⌖", title: "Address", content: <p className="mt-1 text-sm leading-6 text-gray-600">Hidayatul Islam College<br />Cape Town, South Africa</p> },
  { icon: "☎", title: "Phone", content: <a href="tel:+27000000000" className="mt-1 block text-sm text-gray-600 transition hover:text-gold">+27 21 593 7544</a> },
  { icon: "✉", title: "Email", content: <a href="mailto:info@hidayatulislamcollege.co.za" className="mt-1 block text-sm text-gray-600 transition hover:text-gold">hislaam@telkomsa.net</a> },
  { icon: "◷", title: "School Hours", content: <p className="mt-1 text-sm leading-6 text-gray-600">Monday – Friday<br />School hours vary by phase.</p> },
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

      <section className="section-shell section-shell--white">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            <div>
              <SectionHeader
                label="Find Us"
                title="Contact Information"
                className="text-left"
                variant="left"
              />

              <p className="mt-6 max-w-xl text-sm leading-7 text-gray-600">
                Whether you have a question about admissions, the curriculum, school activities or any other matter, our team is here to assist you.
              </p>

              <div className="mt-8 space-y-4">
                {contactRows.map((row) => (
                  <InfoRow key={row.title} icon={<span className="text-lg">{row.icon}</span>} title={row.title}>{row.content}</InfoRow>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl bg-gray-100 shadow-lg">
              <div className="flex min-h-[420px] flex-col items-center justify-center p-8 text-center md:p-10">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy text-2xl text-gold">⌖</div>
                <p className="mt-6 text-sm font-semibold uppercase tracking-[3px] text-gold">Find Us</p>
                <h3 className="mt-3 text-base font-semibold text-navy">Hidayatul Islam College</h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-gray-600">Find our campus and get directions using Google Maps.</p>
                <a href="https://www.google.com/maps/search/?api=1&query=Hidayatul+Islam+College" target="_blank" rel="noopener noreferrer" className="mt-7 rounded-xl bg-gold px-6 py-3 text-sm font-semibold text-navy transition hover:opacity-90">Open in Google Maps</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell section-shell--off-white">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <SectionHeader
              label="Other Ways to Reach Us"
              title="Quick Contacts"
              description="For more information, please get in touch with the school through the contact details provided above."
              variant="centered"
            />
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { title: "Admissions", text: "Enquire about applications, admissions and joining the HIC community." },
              { title: "General Enquiries", text: "Have a question about the school? Our team will be happy to assist." },
              { title: "School Information", text: "Contact us for information about academics, activities and school programmes." },
            ].map((item) => (
              <div key={item.title} className="card-contact">
                <h3 className="text-base font-semibold text-navy">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner
        title="Ready to be part of the HIC family?"
        actions={[{ label: "Email Us", href: "mailto:hislaam@telkomsa.net", variant: "primary" }]}
      />

    </>
  );
}
