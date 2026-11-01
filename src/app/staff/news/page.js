"use client"; // <--- ADD THIS LINE

import StaffSidebar from "@/components/staff/StaffSidebar";
import ShellPage from "@/components/layout/ShellPage";
import PageHeader from "@/components/ui/PageHeader";
import { Section, Container } from "@/components/ui/layout";
import { Newspaper } from "lucide-react";
import NewsView from "@/features/news/NewsView";

export default function StaffNewsPage() {
  return (
    <ShellPage sidebar={(props) => <StaffSidebar {...props} />}>
      <PageHeader
        icon={Newspaper}
        portalLabel="Staff Portal"
        title="School News"
        subtitle="Stay up to date with the latest announcements."
      />
      <Section tone="white" space="sm">
        <Container>
          <NewsView />
        </Container>
      </Section>
    </ShellPage>
  );
}