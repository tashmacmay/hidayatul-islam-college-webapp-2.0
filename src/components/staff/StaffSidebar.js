"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRole } from "@/providers/RoleProvider";

import {
  LayoutDashboard,
  CalendarDays,
  Bell,
  BookOpen,
  Users,
  Images,
} from "lucide-react";
import SidebarShell from "@/components/layout/SidebarShell";

export default function StaffSidebar({
  collapsed = false,
  mobileOpen = false,
  onToggle,
  onCloseMobile,
}) {
  const router = useRouter();
  const { isAdmin, loading: roleLoading } = useRole();
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [dbName, setDbName] = useState(null); // NEW: Store DB name

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      // Fetch DB profile for display name
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
      
      setUserLoading(false);
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
    { name: "My Dashboard", href: "/staff/dashboard", icon: LayoutDashboard },
    { name: "School Notices", href: "/staff/school-notices", icon: Bell },
    { name: "My Bookings", href: "/staff/bookings", icon: CalendarDays },
    { name: "Learning Resources", href: "/staff/learning-resources", icon: BookOpen },
    { name: "School Calendar", href: "/staff/calendar", icon: CalendarDays },
  ];

  // Management links
  const adminLinks = [
    { name: "Term Calendar Management", href: "/staff/admin/term-calendar-management", icon: CalendarDays },
    { name: "Notice Management", href: "/staff/admin/notice-management", icon: Bell },
    { name: "Learning Resources Manager", href: "/staff/admin/Learning-resources", icon: BookOpen },
    { name: "School Bookings", href: "/staff/admin/school-bookings", icon: CalendarDays },
    { name: "User Management", href: "/staff/admin/user-management", icon: Users },
    { name: "Media Management", href: "/staff/admin/media-management", icon: Images },
  ];

  return (
    <SidebarShell
      sections={[
        { heading: isAdmin ? "Staff" : null, items: staffLinks },
        ...(!roleLoading && isAdmin && adminLinks.length > 0
          ? [{ heading: "Admin", items: adminLinks }]
          : []),
      ]}
      profileHref="/staff/profile"
      roleLabel={isAdmin ? "Admin / Staff" : "Staff"}
      user={user}
      displayName={dbName}
      loading={roleLoading || userLoading}
      onLogout={handleLogout}
      collapsed={collapsed}
      mobileOpen={mobileOpen}
      onToggle={onToggle}
      onCloseMobile={onCloseMobile}
    />
  );
}