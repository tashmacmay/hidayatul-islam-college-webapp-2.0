// layout.js

import ParentSidebar from "@/components/parent/ParentSidebar";

export default function ParentLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <ParentSidebar />

      <main className="ml-[240px] flex-1 bg-off-white p-8">
        {children}
      </main>
    </div>
  );
}