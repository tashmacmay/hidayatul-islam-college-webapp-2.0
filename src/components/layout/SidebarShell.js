"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import {
  UserCircle,
  LogOut,
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
}) {
  const pathname = usePathname();

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
    <aside className="fixed left-0 top-0 bottom-0 z-50 flex h-screen w-[240px] flex-col bg-navy-dark">

      {/* ======================================================
          HEADER
          ====================================================== */}

      <div className="flex items-center gap-3 px-5 py-4">

        <img
          src="/images/HIC_Logo2.png"
          alt="Hidayatul Islam College logo"
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

      {/* ======================================================
          NAVIGATION
          ====================================================== */}

      <div className="flex-1 overflow-y-auto py-2">

        {sections.map((section, sectionIndex) => (
          <Fragment key={section.heading || sectionIndex}>
            {section.heading && (
              <div className="px-5 py-2">

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
                  className={`flex items-center gap-[11px] border-l-[3px] px-5 py-[9px] text-[13px] font-medium transition-all ${
                    active && !link.disabled
                      ? "border-gold bg-[#c9a2271a] text-white"
                      : "border-transparent text-[#7090b0] hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className={link.disabled ? "opacity-50" : undefined} size={17} />

                  <span>
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
          className={`flex items-center gap-[11px] border-l-[3px] px-5 py-[9px] text-[13px] font-medium transition-all ${
            pathname === profileHref
              ? "border-gold bg-[#c9a2271a] text-white"
              : "border-transparent text-[#7090b0] hover:bg-white/5 hover:text-white"
          }`}
        >
          <UserCircle size={17} />

          <span>
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
          className="flex w-full items-center gap-[11px] border-l-[3px] border-transparent px-5 py-[9px] text-[13px] font-medium text-[#7090b0] transition-all hover:bg-white/5 hover:text-white"
        >
          <LogOut size={17} />

          <span>
            Logout
          </span>
        </button>

      </div>

      {/* ======================================================
          BOTTOM USER
          ====================================================== */}

      <div className="border-t border-white/10 px-5 py-[14px]">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold font-bold text-navy-dark">
            {loading ? "..." : initials}
          </div>

          <div className="min-w-0">

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
