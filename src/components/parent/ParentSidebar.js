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
} from "lucide-react";

const links = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "My Bookings",
    href: "/my-bookings",
    icon: CalendarDays,
    badge: 2,
  },
  {
    name: "Notices",
    href: "/notices",
    icon: Bell,
    badge: 3,
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

export default function ParentSidebar({
  isCollapsed,
  onToggleCollapsed,
  onCloseMobile,
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
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

  const displayName =
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Parent";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleNavigation = () => {
    onCloseMobile?.();
  };

  return (
    <aside className="flex h-full w-full flex-col bg-navy-dark">
      {/* Logo / Header */}
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

      {/* Desktop collapse button */}
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
        {links.map((link) => {
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

              {!isCollapsed && (
                <>
                  <span>{link.name}</span>

                  {link.badge && (
                    <span className="ml-auto rounded-full bg-gold px-[7px] py-[2px] text-[10px] font-bold text-navy-dark">
                      {link.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}

        <div className="mx-4 my-2 h-px bg-white/10" />

        <Link
          href="/profile"
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

      {/* User information */}
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
                {user ? "Parent" : "Not signed in"}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile close button */}
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