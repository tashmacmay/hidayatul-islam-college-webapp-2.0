import Link from "next/link";

export default function Contact() {
  return (
    <>
      {/* Hero Section */}

      <section className="relative flex min-h-[320px] items-end overflow-hidden bg-navy md:min-h-[340px]">
        <img
          src="/images/HIC-image2.jpg"
          alt="Contact Hidayatul Islam College"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/80 to-navy/45" />
        <div className="absolute inset-0 opacity-20 [background-image:repeating-linear-gradient(135deg,transparent,transparent_12px,rgba(255,255,255,0.08)_12px,rgba(255,255,255,0.08)_13px)]" />

        <div className="relative z-10 w-full px-6 pb-10 md:px-16 md:pb-[52px]">
          <p className="mb-3.5 flex items-center gap-2 text-[9px] text-blue-200 md:text-[10px]">
            <Link href="/" className="text-gold-light transition-colors hover:text-gold">
              Home
            </Link>
            <span className="text-navy-dark">›</span>
            <span className="text-blue-200/75">Contact Us</span>
          </p>

          <div className="mb-5 h-[3px] w-[60px] rounded-full bg-gold" />

          <h1 className="mb-3 font-serif text-2xl font-bold leading-tight text-white md:text-[28px]">
            Get in <span className="text-gold">Touch</span>
          </h1>

          <p className="max-w-[560px] text-sm leading-7 text-blue-100">
            We would love to hear from you. Contact Hidayatul Islam College
            for enquiries, admissions and general information.
          </p>
        </div>
      </section>

      {/* Contact Information */}

      <section className="bg-white px-6 py-20 md:px-10 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">

            {/* Left Column */}

            <div>
              <p className="text-xs font-semibold uppercase tracking-[3px] text-gold">
                Find Us
              </p>

              <h2 className="mt-3 font-serif text-xl font-bold leading-tight text-navy md:text-2xl">
                Contact Information
              </h2>

              <div className="mt-5 h-1 w-16 rounded-full bg-gold" />

              <p className="mt-6 max-w-xl text-sm leading-7 text-gray-600">
                Whether you have a question about admissions, the curriculum,
                school activities or any other matter, our team is here to
                assist you.
              </p>

              <div className="mt-8 space-y-4">

                {/* Address */}

                <div className="flex gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy text-gold">
                    <span className="text-lg">⌖</span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-navy">
                      Address
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-gray-600">
                      Hidayatul Islam College
                      <br />
                      Cape Town, South Africa
                    </p>
                  </div>
                </div>

                {/* Phone */}

                <div className="flex gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy text-gold">
                    <span className="text-lg">☎</span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-navy">
                      Phone
                    </h3>

                    <a
                      href="tel:+27000000000"
                      className="mt-1 block text-sm text-gray-600 transition hover:text-gold"
                    >
                      +27 21 593 7544
                    </a>
                  </div>
                </div>

                {/* Email */}

                <div className="flex gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy text-gold">
                    <span className="text-lg">✉</span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-navy">
                      Email
                    </h3>

                    <a
                      href="mailto:info@hidayatulislamcollege.co.za"
                      className="mt-1 block text-sm text-gray-600 transition hover:text-gold"
                    >
                      hislaam@telkomsa.net
                    </a>
                  </div>
                </div>

                {/* School Hours */}

                <div className="flex gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy text-gold">
                    <span className="text-lg">◷</span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-navy">
                      School Hours
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-gray-600">
                      Monday – Friday
                      <br />
                      School hours vary by phase.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Column - Map */}

            <div className="overflow-hidden rounded-2xl bg-gray-100 shadow-lg">

              <div className="flex min-h-[420px] flex-col items-center justify-center p-8 text-center md:p-10">

                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy text-2xl text-gold">
                  ⌖
                </div>

                <p className="mt-6 text-sm font-semibold uppercase tracking-[3px] text-gold">
                  Find Us
                </p>

                <h3 className="mt-3 text-base font-semibold text-navy">
                  Hidayatul Islam College
                </h3>

                <p className="mt-3 max-w-sm text-sm leading-6 text-gray-600">
                  Find our campus and get directions using Google Maps.
                </p>

                <a
                  href="https://www.google.com/maps/search/?api=1&query=Hidayatul+Islam+College"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-7 rounded-xl bg-gold px-6 py-3 text-sm font-semibold text-navy transition hover:opacity-90"
                >
                  Open in Google Maps
                </a>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Enquiries */}

      <section className="bg-off-white px-6 py-20 md:px-10 md:py-24">
        <div className="mx-auto max-w-6xl">

          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[3px] text-gold">
              Other Ways to Reach Us
            </p>

            <h2 className="mt-3 font-serif text-xl font-bold leading-tight text-navy md:text-2xl">
              Quick Contacts
            </h2>

            <div className="mx-auto mt-5 h-1 w-16 rounded-full bg-gold" />

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-600">
              For more information, please get in touch with the school
              through the contact details provided above.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">

            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
              <h3 className="text-base font-semibold text-navy">
                Admissions
              </h3>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                Enquire about applications, admissions and joining the HIC
                community.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
              <h3 className="text-base font-semibold text-navy">
                General Enquiries
              </h3>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                Have a question about the school? Our team will be happy to
                assist.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
              <h3 className="text-base font-semibold text-navy">
                School Information
              </h3>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                Contact us for information about academics, activities and
                school programmes.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}

      <section className="bg-navy px-6 py-20 text-center text-white md:px-10 md:py-24">
        <div className="mx-auto max-w-3xl">

          <h2 className="font-serif text-xl font-bold leading-tight md:text-2xl">
            Ready to be part of the
            <span className="text-gold"> HIC family?</span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-blue-100">
            We look forward to hearing from you and welcoming you to
            Hidayatul Islam College.
          </p>

          <a
            href="mailto:hislaam@telkomsa.net"
            className="mt-8 inline-block rounded-xl bg-gold px-7 py-3 text-sm font-semibold text-navy transition hover:opacity-90"
          >
            Email Us
          </a>

        </div>
      </section>
    </>
  );
}