"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

import {
  LayoutDashboard,
  CalendarDays,
  Bell,
  BookOpen,
  UserCircle,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  X,
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
  collapsed = false,
  mobileOpen = false,
  onToggle,
  onCloseMobile,
}) {
  const pathname = usePathname();
  const router = useRouter();

  const { user, loading } = useAuth();

  // ------------------------------------------------------------
  // Logout
  // ------------------------------------------------------------

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // ------------------------------------------------------------
  // User information
  // ------------------------------------------------------------

  const displayName =
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Parent";

  const initials = displayName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // ------------------------------------------------------------
  // Close mobile drawer when navigating
  // ------------------------------------------------------------

  const handleNavigation = () => {
    if (mobileOpen) {
      onCloseMobile?.();
    }
  };

  // ------------------------------------------------------------
  // Sidebar classes
  // ------------------------------------------------------------

  const sidebarClasses = `
    z-50
    flex
    h-screen
    shrink-0
    flex-col
    bg-[#081540]

    /* -------------------------
       MOBILE
       ------------------------- */

    fixed
    inset-y-0
    left-0
    w-[240px]
    transition-transform
    duration-300
    ease-in-out

    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}

    /* -------------------------
       DESKTOP / TABLET
       ------------------------- */

    md:sticky
    md:top-0
    md:translate-x-0
    md:transition-[width]
    md:duration-300

    ${collapsed ? "md:w-16" : "md:w-[240px]"}
  `;

  return (
    <aside className={sidebarClasses}>

      {/* ======================================================
          HEADER
          ====================================================== */}

      <div
        className={`flex h-[76px] shrink-0 items-center ${
          collapsed
            ? "justify-center px-2"
            : "gap-3 px-5"
        }`}
      >
        <img
          src="/images/HIC_Logo2.png"
          alt="Hidayatul Islam College logo"
          className="h-[42px] w-[42px] shrink-0 rounded-full border-2 border-[#c9a227] bg-white p-[2px]"
        />

        {!collapsed && (
          <div className="min-w-0">
            <strong className="block truncate font-serif text-[13px] font-bold text-white">
              HIC Portal
            </strong>

            <span className="block truncate text-[10px] text-[#f0d080]">
              Hidayatul Islam College
            </span>
          </div>
        )}

        {/* Mobile close button */}
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation"
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-[#7090b0] transition hover:bg-white/10 hover:text-white md:hidden"
        >
          <X size={19} />
        </button>
      </div>

      {/* ======================================================
          DESKTOP COLLAPSE BUTTON
          ====================================================== */}

      <div
        className={`hidden md:flex ${
          collapsed
            ? "justify-center"
            : "justify-end px-4"
        } pb-3`}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-label={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
          title={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
          className="flex h-8 w-8 items-center justify-center rounded-md text-[#7090b0] transition hover:bg-white/10 hover:text-white"
        >
          {collapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </button>
      </div>

      {/* ======================================================
          NAVIGATION
          ====================================================== */}

      <div className="flex-1 overflow-y-auto py-2">

        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={handleNavigation}
              title={collapsed ? link.name : undefined}
              className={`
                group
                flex
                relative
                items-center
                border-l-[3px]
                py-[9px]
                text-[13px]
                font-medium
                transition-all

                ${
                  collapsed
                    ? "justify-center px-2"
                    : "gap-[11px] px-5"
                }

                ${
                  active
                    ? "border-[#c9a227] bg-[#c9a2271a] text-white"
                    : "border-transparent text-[#7090b0] hover:bg-white/5 hover:text-white"
                }
              `}
            >
              <Icon size={17} className="shrink-0" />

              {!collapsed && (
                <span className="min-w-0 truncate">
                  {link.name}
                </span>
              )}

              {!collapsed && link.badge && (
                <span className="ml-auto rounded-full bg-[#c9a227] px-[7px] py-[2px] text-[10px] font-bold text-[#081540]">
                  {link.badge}
                </span>
              )}

              {collapsed && link.badge && (
                <span className="absolute right-1 top-1 rounded-full bg-[#c9a227] px-[4px] py-[1px] text-[8px] font-bold text-[#081540]">
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Divider */}
        <div
          className={`my-2 h-px bg-white/10 ${
            collapsed ? "mx-2" : "mx-4"
          }`}
        />

        {/* Profile */}
        <Link
          href="/profile"
          onClick={handleNavigation}
          title={collapsed ? "My Profile" : undefined}
          className={`
            flex
            items-center
            border-l-[3px]
            border-transparent
            py-[9px]
            text-[13px]
            font-medium
            text-[#7090b0]
            transition-all
            hover:bg-white/5
            hover:text-white

            ${
              collapsed
                ? "justify-center px-2"
                : "gap-[11px] px-5"
            }
          `}
        >
          <UserCircle size={17} className="shrink-0" />

          {!collapsed && (
            <span>My Profile</span>
          )}
        </Link>

        {/* Divider */}
        <div
          className={`my-2 h-px bg-white/10 ${
            collapsed ? "mx-2" : "mx-4"
          }`}
        />

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className={`
            flex
            w-full
            items-center
            border-l-[3px]
            border-transparent
            py-[9px]
            text-[13px]
            font-medium
            text-[#7090b0]
            transition-all
            hover:bg-white/5
            hover:text-white

            ${
              collapsed
                ? "justify-center px-2"
                : "gap-[11px] px-5"
            }
          `}
        >
          <LogOut size={17} className="shrink-0" />

          {!collapsed && (
            <span>Logout</span>
          )}
        </button>
      </div>

      {/* ======================================================
          USER FOOTER
          ====================================================== */}

      <div
        className={`
          shrink-0
          border-t
          border-white/10
          py-[14px]

          ${
            collapsed
              ? "flex justify-center px-2"
              : "px-5"
          }
        `}
      >
        <div
          className={`flex items-center ${
            collapsed ? "justify-center" : "gap-3"
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#c9a227] font-bold text-[#081540]">
            {loading ? "..." : initials}
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">
                {loading
                  ? "Loading..."
                  : displayName}
              </div>

              <div className="text-xs text-[#7090b0]">
                {user
                  ? "Parent"
                  : "Not signed in"}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}