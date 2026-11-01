"use client"; // <--- ADD THIS LINE

import ParentSidebar from "@/components/parent/ParentSidebar";
import ShellPage from "@/components/layout/ShellPage";
import PageHeader from "@/components/ui/PageHeader";
import { Section, Container } from "@/components/ui/layout";
import { Newspaper } from "lucide-react";
import NewsView from "@/features/news/NewsView";

export default function ParentNewsPage() {
  return (
    <ShellPage sidebar={(props) => <ParentSidebar {...props} />}>
      <PageHeader
        icon={Newspaper}
        portalLabel="Parent Portal"
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