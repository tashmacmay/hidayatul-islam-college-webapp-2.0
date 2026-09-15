export default function Contact() {
  return (
    <>
      {/* Hero Section */}

      <section className="relative h-[380px] overflow-hidden">
        <img
          src="/images/HIC-image2.jpg"
          alt="Contact Hidayatul Islam College"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-navy/80" />

        <div className="relative z-10 flex h-full items-center">
          <div className="mx-auto w-full max-w-7xl px-10">
            <p className="text-sm font-semibold uppercase tracking-[3px] text-gold">
              Home › Contact
            </p>

            <h1 className="mt-5 text-4xl font-bold text-white md:text-5xl">
              Get in
              <span className="text-gold"> Touch</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-blue-100">
              We would love to hear from you. Contact Hidayatul Islam College
              for enquiries, admissions and general information.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}

      <section className="px-10 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2">

            {/* Left Column */}

            <div>
              <p className="text-sm font-semibold uppercase tracking-[3px] text-gold">
                Contact Us
              </p>

              <h2 className="mt-3 text-3xl font-bold text-navy md:text-4xl">
                We'd Love to Hear From You
              </h2>

              <div className="mt-5 h-1 w-16 rounded-full bg-gold" />

              <p className="mt-6 max-w-xl text-sm leading-7 text-gray-600">
                Whether you have a question about admissions, the curriculum,
                school activities or any other matter, our team is here to
                assist you.
              </p>

              <div className="mt-10 space-y-7">

                {/* Address */}

                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy text-gold">
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

                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy text-gold">
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

                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy text-gold">
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

                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy text-gold">
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

            <div className="overflow-hidden rounded-3xl bg-gray-100 shadow-lg">

              <div className="flex min-h-[420px] flex-col items-center justify-center p-10 text-center">

                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy text-2xl text-gold">
                  ⌖
                </div>

                <p className="mt-6 text-sm font-semibold uppercase tracking-[3px] text-gold">
                  Find Us
                </p>

                <h3 className="mt-3 text-2xl font-bold text-navy">
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

      <section className="bg-gray-50 px-10 py-20">
        <div className="mx-auto max-w-7xl">

          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[3px] text-gold">
              Enquiries
            </p>

            <h2 className="mt-3 text-3xl font-bold text-navy md:text-4xl">
              How Can We Help?
            </h2>

            <div className="mx-auto mt-5 h-1 w-16 rounded-full bg-gold" />

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-600">
              For more information, please get in touch with the school
              through the contact details provided above.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">

            <div className="rounded-2xl bg-white p-7 text-center shadow-sm">
              <h3 className="text-lg font-bold text-navy">
                Admissions
              </h3>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                Enquire about applications, admissions and joining the HIC
                community.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-7 text-center shadow-sm">
              <h3 className="text-lg font-bold text-navy">
                General Enquiries
              </h3>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                Have a question about the school? Our team will be happy to
                assist.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-7 text-center shadow-sm">
              <h3 className="text-lg font-bold text-navy">
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

      <section className="bg-navy px-10 py-20 text-center text-white">
        <div className="mx-auto max-w-3xl">

          <h2 className="text-3xl font-bold md:text-4xl">
            Connect With the
            <span className="text-gold"> HIC Family</span>
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