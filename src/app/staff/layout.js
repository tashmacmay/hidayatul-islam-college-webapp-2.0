
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/providers/RoleProvider";
import { RefreshCw } from "lucide-react";

export default function StaffLayout({ children }) {
  const router = useRouter();
  const { role, loading } = useRole();

  useEffect(() => {
    if (loading || role === "staff") {
      return;
    }

    if (role === "parent") {
      router.replace("/dashboard");
      return;
    }

    router.replace("/login");
  }, [loading, role, router]);

  if (loading || role !== "staff") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div
          className="text-center"
          role="status"
          aria-live="polite"
        >
          <RefreshCw className="mx-auto animate-spin text-gold" size={32} />

          <p className="mt-4 text-sm font-medium text-slate-600">
            Checking your staff access...
          </p>
        </div>
      </main>
    );
  }

  return children;
}
