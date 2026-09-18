"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ChevronLeft, X } from "lucide-react";

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

export default function StaffSidebar({
  isCollapsed,
  onToggleCollapsed,
  onCloseMobile,
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();

          const res = await fetch(
            `/api/user-role?uid=${currentUser.uid}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

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

  const staffLinks = [
    {
      name: "Dashboard",
      href: "/staff/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Notices",
      href: "/staff/notices",
      icon: Bell,
    },
    {
      name: "Bookings",
      href: "/staff/bookings",
      icon: CalendarDays,
    },
    {
      name: "Learning Resources",
      href: "/staff/resources",
      icon: BookOpen,
    },
    {
      name: "School Calendar",
      href: "/staff/calendar",
      icon: CalendarDays,
    },
  ];

  const adminLinks = [
    {
      name: "User Management",
      href: "/admin/users",
      icon: Users,
    },
    {
      name: "System Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ];

  const displayName =
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Staff";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleNavigation = () => {
    onCloseMobile?.();
  };

  const renderLink = (link) => {
    const Icon = link.icon;
    const active = pathname === link.href;

    return (
      <Link
        key={link.href}
        href={link.href}
        onClick={handleNavigation}
        title={isCollapsed ? link.name : undefined}
        className={`group flex items-center ${
          isCollapsed
            ? "justify-center px-2"
            : "gap-[11px] px-5"
        } border-l-[3px] py-[9px] text-[13px] font-medium transition-all ${
          active
            ? "border-gold bg-[#c9a2271a] text-white"
            : "border-transparent text-[#7090b0] hover:bg-white/5 hover:text-white"
        }`}
      >
        <Icon size={17} className="shrink-0" />

        {!isCollapsed && <span>{link.name}</span>}
      </Link>
    );
  };

  return (
    <aside className="flex h-full w-full flex-col bg-navy-dark">
      {/* Logo */}
      <div
        className={`flex items-center ${
          isCollapsed ? "justify-center px-2" : "gap-3 px-5"
        } py-4`}
      >
        <img
          src="/images/HIC_Logo2.png"
          alt="Hidayatul Islam College"
          className="h-[42px] w-[42px] shrink-0 rounded-full border-2 border-gold bg-white p-[2px]"
        />

        {!isCollapsed && (
          <div className="min-w-0">
            <strong className="block truncate font-serif text-[13px] font-bold text-white">
              HIC Portal
            </strong>

            <span className="block truncate text-[10px] text-gold-light">
              Hidayatul Islam College
            </span>
          </div>
        )}
      </div>

      {/* Collapse */}
      <div className="hidden px-3 pb-2 md:block">
        <button
          type="button"
          onClick={onToggleCollapsed}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex w-full items-center justify-center rounded-lg p-2 text-[#7090b0] transition hover:bg-white/5 hover:text-white"
        >
          <ChevronLeft
            size={18}
            className={`transition-transform duration-300 ${
              isCollapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-2">
        {staffLinks.map(renderLink)}

        {isAdmin && (
          <>
            <div className="mx-4 my-2 h-px bg-white/10" />

            {!isCollapsed && (
              <p className="px-5 py-2 text-[10px] uppercase tracking-wider text-[#7090b0]">
                Admin
              </p>
            )}

            {adminLinks.map(renderLink)}
          </>
        )}

        <div className="mx-4 my-2 h-px bg-white/10" />

        <Link
          href="/staff/profile"
          onClick={handleNavigation}
          title={isCollapsed ? "My Profile" : undefined}
          className={`flex items-center ${
            isCollapsed
              ? "justify-center px-2"
              : "gap-[11px] px-5"
          } border-l-[3px] border-transparent py-[9px] text-[13px] font-medium text-[#7090b0] hover:bg-white/5 hover:text-white`}
        >
          <UserCircle size={17} className="shrink-0" />

          {!isCollapsed && <span>My Profile</span>}
        </Link>

        <div className="mx-4 my-2 h-px bg-white/10" />

        <button
          type="button"
          onClick={handleLogout}
          title={isCollapsed ? "Logout" : undefined}
          className={`flex w-full items-center ${
            isCollapsed
              ? "justify-center px-2"
              : "gap-[11px] px-5"
          } border-l-[3px] border-transparent py-[9px] text-[13px] font-medium text-[#7090b0] transition-all hover:bg-white/5 hover:text-white`}
        >
          <LogOut size={17} className="shrink-0" />

          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>

      {/* User */}
      <div
        className={`border-t border-white/10 ${
          isCollapsed ? "px-2" : "px-5"
        } py-[14px]`}
      >
        <div
          className={`flex items-center ${
            isCollapsed ? "justify-center" : "gap-3"
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold font-bold text-navy-dark">
            {loading ? "..." : initials}
          </div>

          {!isCollapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">
                {loading ? "Loading..." : displayName}
              </div>

              <div className="text-xs text-[#7090b0]">
                {loading
                  ? ""
                  : isAdmin
                    ? "Admin / Staff"
                    : "Staff"}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile close */}
      <button
        type="button"
        onClick={onCloseMobile}
        aria-label="Close navigation menu"
        className="absolute right-3 top-3 rounded-lg p-2 text-white hover:bg-white/10 md:hidden"
      >
        <X size={20} />
      </button>
    </aside>
  );
}