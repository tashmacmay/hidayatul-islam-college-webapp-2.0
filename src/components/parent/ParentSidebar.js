"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRole } from "@/providers/RoleProvider";

import {
  LayoutDashboard,
  CalendarDays,
  Bell,
  BookOpen,
} from "lucide-react";
import SidebarShell from "@/components/layout/SidebarShell";

export default function ParentSidebar({
  collapsed = false,
  mobileOpen = false,
  onToggle,
  onCloseMobile,
}) {
  const router = useRouter();
  const { isAdmin, loading: roleLoading } = useRole();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dbName, setDbName] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        setUser(currentUser);

        if (currentUser) {
          try {
            const token = await currentUser.getIdToken();
            const res = await fetch("/api/user-role", {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              const data = await res.json();
              setDbName(data.display_name || data.user?.display_name);
            }
          } catch (err) {
            console.error("Failed to fetch sidebar name:", err);
          }
        }

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const parentLinks = [
    {
      name: "My Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "My Bookings",
      href: "/my-bookings",
      icon: CalendarDays,
    },
    {
      name: "School Notices",
      href: "/notices",
      icon: Bell,
    },
    {
      name: "Learning Resources",
      href: "/learning-resources",
      icon: BookOpen,
    },
    {
      name: "School Calendar",
      href: "/calendar",
      icon: CalendarDays,
    },
  ];

  return (
    <SidebarShell
      sections={[{ heading: isAdmin ? "Parent" : null, items: parentLinks }]}
      profileHref="/profile"
      roleLabel="Parent"
      user={user}
      displayName={dbName}
      loading={loading || roleLoading}
      onLogout={handleLogout}
      collapsed={collapsed}
      mobileOpen={mobileOpen}
      onToggle={onToggle}
      onCloseMobile={onCloseMobile}
    />
  );
}