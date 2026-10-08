import {
  BookOpen,
  FileText,
  Play,
  BookMarked,
  School,
} from "lucide-react";
import { CtaBanner, EmptyState, PageHero, PopiaNote, SectionHeader } from "@/components/ui/primitives";
import FilterButtons from "@/components/public/FilterButtons";

const resourceCategories = [
  "All resources",
  "Literacy & Language",
  "Mathematics",
  "Islamic Studies",
  "Life Skills",
  "Parent Guides",
  "School Documents",
];

const grades = ["Grade R", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7"];

const includedResources = [
  { icon: FileText, label: "Term overview & schedule" },
  { icon: Play, label: "Worksheets" },
  { icon: BookOpen, label: "Video lessons" },
  { icon: BookMarked, label: "Reading lists" },
  { icon: School, label: "Calendar & key dates" },
  { icon: BookMarked, label: "Islamic studies materials" },
];

export default function Resources() {
  return (
    <>
      <PageHero
        image="/images/HIC-image2.jpg"
        imageAlt="Learning Resources"
        breadcrumb="Resources"
        title={<>Learning <span className="text-gold">Resources</span></>}
        description="Free educational materials for HIC learners, parents, and the wider Kensington community — worksheets, videos, guidance, and more."
      />

      <section className="section-shell section-shell--off-white">
        <div className="mx-auto max-w-6xl">
          <PopiaNote title="POPIA & Privacy Notice" variant="resources">
            Some resources may be available publicly, while others may require authorised access. Personal information must be handled in accordance with the Protection of Personal Information Act (POPIA).
          </PopiaNote>

          <div className="mt-8 rounded-2xl bg-navy p-8 text-white shadow-lg">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[3px] text-gold">Start Here</p>
                <h2 className="mt-3 text-lg font-semibold">Grade-Specific <span className="text-gold">Resources</span></h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">
                  Grade-specific materials will appear here once they are uploaded by the school.
                </p>

                <FilterButtons items={grades} tone="navy" className="mt-6 flex flex-wrap gap-2" />
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[2px] text-gold">Included in each pack</p>
                <div className="mt-5 space-y-4">
                  {includedResources.map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-3 text-sm text-blue-100"><Icon className="h-4 w-4 text-gold" />{label}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <FilterButtons items={resourceCategories} className="mt-8 flex flex-wrap gap-2" />

          <div className="mt-8">
            <EmptyState
              icon={<BookOpen className="h-6 w-6" />}
              title="No resources uploaded yet"
              description="Learning materials, worksheets, guides and school documents will appear here once they are uploaded by the school."
            />
          </div>

          <div className="mt-16">
            <SectionHeader
              title={<>Forms & <span className="text-gold">Policies</span></>}
              variant="left"
            />

            <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-white px-5 py-8 text-center">
              <p className="text-sm font-semibold text-navy">No forms or policies have been uploaded yet.</p>
              <p className="mt-2 text-xs leading-5 text-gray-500">
                School forms, policies and official documents will appear here when available.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CtaBanner
        eyebrow="Parent Portal"
        title="More resources in the Parent Portal"
        actions={[{ label: "Portal Login", href: "/login", variant: "primary" }]}
      />

    </>
  );
}