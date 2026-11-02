"use client";

import StaffSidebar from "@/components/staff/StaffSidebar";
import ShellPage from "@/components/layout/ShellPage";
import PageHeader from "@/components/ui/PageHeader";
import { BookOpen } from "lucide-react";
import ResourceView from "@/components/public/ResourceView";

export default function StaffResourcesPage() {
  return (
    <ShellPage sidebar={(props) => <StaffSidebar {...props} />}>
      <PageHeader
        icon={BookOpen}
        portalLabel="Staff Portal"
        title="Learning Resources"
        subtitle="Access school learning materials and documents."
      />
      
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <ResourceView />
      </div>
    </ShellPage>
  );
}