"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

import {
  LayoutDashboard,
  CalendarDays,
  Bell,
  BookOpen,
  Users,
} from "lucide-react";
import SidebarShell from "@/components/layout/SidebarShell";

export default function StaffSidebar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Listen for auth changes and fetch role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();

          const res = await fetch("/api/user-role", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const data = await res.json();
            setIsAdmin(data.is_admin || false);
          }
        } catch (err) {
          console.error("Error fetching role:", err);
        }
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    });

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

  // Staff-facing links
  const staffLinks = [
    {
      name: "My Dashboard",
      href: "/staff/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "School Notices",
      href: "/staff/school-notices",
      icon: Bell,
    },
    {
      name: "My Bookings",
      href: "/staff/bookings",
      icon: CalendarDays,
    },
    {
      name: "Learning Resources",
      href: "/staff/learning-resources",
      icon: BookOpen,
    },
    {
      name: "School Calendar",
      href: "/staff/calendar",
      icon: CalendarDays,
    },
  ];

  // Management links
  const adminLinks = [
    {
      name: "Term Calendar Management",
      href: "/staff/admin/term-calendar-management",
      icon: CalendarDays,
    },
    {
      name: "Notice Management",
      href: "/staff/admin/notice-management",
      icon: Bell,
    },
    {
      name: "Learning Resources Manager",
      href: "/staff/admin/Learning-resources",
      icon: BookOpen,
    },
    {
      name: "School Bookings",
      href: "/staff/admin/school-bookings",
      icon: CalendarDays,
    },
    {
      name: "User Management",
      href: "/staff/admin/user-management",
      icon: Users,
    },
    {
      name: "Media Management",
      href: "/staff/admin/media-management",
      icon: CalendarDays,
    },
  ];

  return (
    <SidebarShell
      sections={[
        { heading: "Staff", items: staffLinks },
        ...(!loading && isAdmin && adminLinks.length > 0
          ? [{
              heading: "Admin",
              items: adminLinks,
            }]
          : []),
      ]}
      profileHref="/staff/profile"
      roleLabel={isAdmin ? "Admin / Staff" : "Staff"}
      user={user}
      loading={loading}
      onLogout={handleLogout}
    />
  );
}
