
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/providers/RoleProvider";
import { RefreshCw } from "lucide-react";

export default function ParentLayout({ children }) {
  const router = useRouter();
  const { role, loading } = useRole();

  useEffect(() => {
    if (loading || role === "parent") {
      return;
    }

    // Staff members, including administrators,
    // belong in the staff portal.
    if (role === "staff") {
      router.replace("/staff/dashboard");
      return;
    }

    // No valid database role.
    router.replace("/login");
  }, [loading, role, router]);

  // Never render parent content while access is unresolved
  // or when the authenticated user is not a parent.
  if (loading || role !== "parent") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div
          className="text-center"
          role="status"
          aria-live="polite"
        >
          <RefreshCw className="mx-auto animate-spin text-gold" size={32} />

          <p className="mt-4 text-sm font-medium text-slate-600">
            Checking your portal access...
          </p>
        </div>
      </main>
    );
  }

  return children;
}
