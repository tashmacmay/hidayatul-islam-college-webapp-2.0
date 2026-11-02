"use client";

import ParentSidebar from "@/components/parent/ParentSidebar";
import ShellPage from "@/components/layout/ShellPage";
import PageHeader from "@/components/ui/PageHeader";
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
      
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <NewsView />
      </div>
    </ShellPage>
  );
}