"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import {
  UserCircle,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

/**
 * @param {{
 *   sections: Array<{
 *     heading?: string,
 *     items: Array<{
 *       name: string,
 *       href: string,
 *       icon: React.ComponentType,
 *       onClick?: (e: React.MouseEvent) => void,
 *       disabled?: boolean,
 *     }>,
 *   }>,
 *   profileHref: string,
 *   roleLabel: string,
 *   user: import("firebase/auth").User | null,
 *   loading: boolean,
 *   onLogout: () => void,
 * }} props
 */
export default function SidebarShell({
  sections,
  profileHref,
  roleLabel,
  user,
  loading,
  onLogout,
  collapsed = false,
  mobileOpen = false,
  onToggle,
  onCloseMobile,
}) {
  const pathname = usePathname();
  const isCollapsed = collapsed && !mobileOpen;

  const displayName =
    user?.displayName ||
    user?.email?.split("@")[0] ||
    roleLabel;

  const initials = displayName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 m-0 flex h-screen w-60 flex-col bg-navy-dark transition-transform duration-300 md:translate-x-0 md:transition-[width] ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      } ${isCollapsed ? "md:w-16" : "md:w-60"}`}
    >

      {/* ======================================================
          HEADER
          ====================================================== */}

      <div
        className={`relative flex items-center gap-3 border-b border-white/10 py-4 ${
          isCollapsed ? "justify-center px-2" : "px-5"
        }`}
      >

        <img
          src="/images/HIC_Logo2.png"
          alt="Hidayatul Islam College logo"
          className={`h-[42px] w-[42px] rounded-full border-2 border-gold bg-white p-[2px] ${
            isCollapsed ? "hidden" : ""
          }`}
        />

        <div className={isCollapsed ? "hidden" : undefined}>
          <strong className="block font-serif text-[13px] font-bold text-white">
            HIC Portal
          </strong>

          <span className="text-[10px] text-gold-light">
            Hidayatul Islam College
          </span>
        </div>

        {onToggle && (
          <button
            type="button"
            onClick={mobileOpen ? onCloseMobile : onToggle}
            className={`rounded-lg p-1.5 text-[#7090b0] transition hover:bg-white/10 hover:text-white ${
              isCollapsed ? "absolute right-1.5 top-4" : "ml-auto"
            }`}
            aria-label={
              mobileOpen
                ? "Close navigation menu"
                : isCollapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
            title={
              mobileOpen
                ? "Close navigation menu"
                : isCollapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
          >
            {mobileOpen ? (
              <X size={18} />
            ) : isCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>
        )}

      </div>

      {/* ======================================================
          NAVIGATION
          ====================================================== */}

      <div className="flex-1 overflow-y-auto py-2">

        {sections.map((section, sectionIndex) => (
          <Fragment key={section.heading || sectionIndex}>
            {section.heading && (
              <div className={isCollapsed ? "hidden" : "px-5 py-2"}>

                <div className="flex items-center gap-3">

                  <div className="h-px flex-1 bg-white/10" />

                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gold-light">
                    {section.heading}
                  </span>

                  <div className="h-px flex-1 bg-white/10" />

                </div>

              </div>
            )}

            {section.items.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={link.onClick}
                  className={`flex items-center gap-[11px] border-l-[3px] py-[9px] text-[13px] font-medium transition-all ${
                    isCollapsed ? "justify-center px-2" : "px-5"
                  } ${
                    active && !link.disabled
                      ? "border-gold bg-[#c9a2271a] text-white"
                      : "border-transparent text-[#7090b0] hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className={link.disabled ? "opacity-50" : undefined} size={17} />

                  <span className={isCollapsed ? "hidden" : undefined}>
                    {link.name}
                  </span>
                </Link>
              );
            })}

          </Fragment>
        ))}

        <div className="mx-4 my-2 h-px bg-white/10" />

        {/* ==================================================
            MY PROFILE
            ================================================== */}

        <Link
          href={profileHref}
          className={`flex items-center gap-[11px] border-l-[3px] py-[9px] text-[13px] font-medium transition-all ${
            isCollapsed ? "justify-center px-2" : "px-5"
          } ${
            pathname === profileHref
              ? "border-gold bg-[#c9a2271a] text-white"
              : "border-transparent text-[#7090b0] hover:bg-white/5 hover:text-white"
          }`}
        >
          <UserCircle size={17} />

          <span className={isCollapsed ? "hidden" : undefined}>
            My Profile
          </span>
        </Link>

        <div className="mx-4 my-2 h-px bg-white/10" />

        {/* ==================================================
            LOGOUT
            ================================================== */}

        <button
          type="button"
          onClick={onLogout}
          className={`flex w-full items-center gap-[11px] border-l-[3px] border-transparent py-[9px] text-[13px] font-medium text-[#7090b0] transition-all hover:bg-white/5 hover:text-white ${
            isCollapsed ? "justify-center px-2" : "px-5"
          }`}
        >
          <LogOut size={17} />

          <span className={isCollapsed ? "hidden" : undefined}>
            Logout
          </span>
        </button>

      </div>

      {/* ======================================================
          BOTTOM USER
          ====================================================== */}

      <div
        className={`border-t border-white/10 py-[14px] ${
          isCollapsed ? "px-2" : "px-5"
        }`}
      >

        <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold font-bold text-navy-dark">
            {loading ? "..." : initials}
          </div>

          <div className={`min-w-0 ${isCollapsed ? "hidden" : ""}`}>

            <div className="truncate text-sm font-semibold text-white">
              {loading
                ? "Loading..."
                : displayName}
            </div>

            <div className="text-xs text-[#7090b0]">
              {loading ? "" : roleLabel}
            </div>

          </div>

        </div>

      </div>

    </aside>
  );
}
