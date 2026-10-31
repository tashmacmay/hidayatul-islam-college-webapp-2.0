"use client";

import { useState } from "react";
import { CtaBanner, PageHero, PopiaNote, SectionHeader } from "@/components/ui/primitives";
import FilterButtons from "@/components/public/FilterButtons";
import ResourceList from "@/components/public/ResourceList";
import { Section, Container } from "@/components/ui/layout";

const grades = ["All Grades", "Grade R", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7"];

export default function Resources() {
  const [selectedGrade, setSelectedGrade] = useState("All Grades");

  return (
    <>
      <PageHero
        image="/images/HIC-image2.jpg"
        imageAlt="Learning Resources"
        breadcrumb="Resources"
        title={<>Learning <span className="text-gold">Resources</span></>}
        description="The school makes learning materials freely available to everyone, including the wider community. No login or school registration is required."
      />

      <Section tone="white">
        <Container>
          <PopiaNote title="POPIA & Privacy Notice" variant="resources">
            Personal information must be handled in accordance with the Protection of Personal Information Act (POPIA).
          </PopiaNote>

          <div className="mt-8 rounded-2xl bg-navy p-8 text-white shadow-lg">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[3px] text-gold">Start Here</p>
                <h2 className="mt-3 text-lg font-semibold">Grade-Specific <span className="text-gold">Resources</span></h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">
                  Grade-specific materials will appear here once they are uploaded by the school.
                </p>

                <FilterButtons
                  items={grades}
                  value={selectedGrade}
                  onChange={setSelectedGrade}
                  tone="navy"
                  className="mt-6 flex flex-wrap gap-2"
                />
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[2px] text-gold">About these resources</p>
                <p className="mt-5 text-sm leading-6 text-blue-100">
                  Resources may include learning materials or school documents. Availability varies according to what the school has published.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <ResourceList selectedGrade={selectedGrade} />
          </div>

          <div className="mt-16">
            <SectionHeader
              title={<>Forms & <span className="text-gold">Policies</span></>}
              variant="left"
            />

            <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-white px-5 py-8 text-center">
              <p className="text-sm font-semibold text-navy">School forms, policies and official documents</p>
              <p className="mt-2 text-xs leading-5 text-gray-500">
                Documents published by the school may be made available here.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <CtaBanner
        eyebrow="Parent Portal"
        title="More resources in the Parent Portal"
        actions={[{ label: "Portal Login", href: "/login", variant: "primary" }]}
      />

    </>
  );
}