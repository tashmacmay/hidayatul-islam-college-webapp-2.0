import StaffSidebar from "@/components/staff/StaffSidebar";

export default function StaffLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#f7f8fc]">
      <StaffSidebar />

      <main className="ml-[240px] flex-1 p-8">
        {children}
      </main>
    </div>
  );
}