"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

import {
  LayoutDashboard,
  CalendarDays,
  Bell,
  BookOpen,
  UserCircle,
  LogOut,
  Users,
  Settings,
} from "lucide-react";

export default function StaffSidebar() {
  const pathname = usePathname();
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
          const res = await fetch(`/api/user-role?uid=${currentUser.uid}`);
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

  // Staff links
  const staffLinks = [
    { name: "Dashboard", href: "/staff/dashboard", icon: LayoutDashboard },
    { name: "Notices", href: "/staff/notices", icon: Bell },
    { name: "Bookings", href: "/staff/bookings", icon: CalendarDays },
    { name: "Learning Resources", href: "/staff/resources", icon: BookOpen },
    { name: "School Calendar", href: "/staff/calendar", icon: CalendarDays },
  ];

  // Admin-only links
  const adminLinks = [
    { name: "User Management", href: "/admin/users", icon: Users },
    { name: "System Settings", href: "/admin/settings", icon: Settings },
  ];

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Staff";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-50 flex w-[240px] flex-col bg-navy-dark">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-4">
        <img
          src="/images/HIC_Logo2.png"
          alt="Logo"
          className="h-[42px] w-[42px] rounded-full border-2 border-gold bg-white p-[2px]"
        />
        <div>
          <strong className="block font-serif text-[13px] font-bold text-white">
            HIC Portal
          </strong>
          <span className="text-[10px] text-gold-light">
            Hidayatul Islam College
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-2">
        {staffLinks.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`group flex items-center gap-[11px] border-l-[3px] px-5 py-[9px] text-[13px] font-medium transition-all ${
                active
                  ? "border-gold bg-[#c9a2271a] text-white"
                  : "border-transparent text-[#7090b0] hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={17} />
              <span>{link.name}</span>
              {/* Optional badge: you can add badge logic here if needed */}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="mx-4 my-2 h-px bg-white/10" />
            <p className="px-5 py-2 text-[10px] uppercase tracking-wider text-[#7090b0]">
              Admin
            </p>
            {adminLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group flex items-center gap-[11px] border-l-[3px] px-5 py-[9px] text-[13px] font-medium transition-all ${
                    active
                      ? "border-gold bg-[#c9a2271a] text-white"
                      : "border-transparent text-[#7090b0] hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={17} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </>
        )}

        <div className="mx-4 my-2 h-px bg-white/10" />

        <Link
          href="/staff/profile"
          className="flex items-center gap-[11px] border-l-[3px] border-transparent px-5 py-[9px] text-[13px] font-medium text-[#7090b0] hover:bg-white/5 hover:text-white"
        >
          <UserCircle size={17} />
          My Profile
        </Link>

        <div className="mx-4 my-2 h-px bg-white/10" />

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-[11px] border-l-[3px] border-transparent px-5 py-[9px] text-[13px] font-medium text-[#7090b0] transition-all hover:bg-white/5 hover:text-white"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>

      {/* Bottom User */}
      <div className="border-t border-white/10 px-5 py-[14px]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold font-bold text-navy-dark">
            {loading ? "..." : initials}
          </div>
          <div>
            <div className="text-sm font-semibold text-white">
              {loading ? "Loading..." : displayName}
            </div>
            <div className="text-xs text-[#7090b0]">
              {loading ? "" : (isAdmin ? "Admin / Staff" : "Staff")}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}