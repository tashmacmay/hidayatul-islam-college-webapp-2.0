"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

import {
  LayoutDashboard,
  CalendarDays,
  Bell,
  BookOpen,
} from "lucide-react";
import SidebarShell from "@/components/layout/SidebarShell";

export default function ParentSidebar() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // FIREBASE USER
  // ============================================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // ============================================================
  // PARENT LINKS
  // ============================================================

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
      sections={[{ heading: "Parent", items: parentLinks }]}
      profileHref="/profile"
      roleLabel="Parent"
      user={user}
      loading={loading}
      onLogout={handleLogout}
    />
  );
}
