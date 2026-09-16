"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

export default function ParentSidebar() {
  const pathname = usePathname();

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

        {links.map((link) => {
          const Icon = link.icon;

          const active =
            pathname === link.href;

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

              {link.badge && (
                <span className="ml-auto rounded-full bg-gold px-[7px] py-[2px] text-[10px] font-bold text-navy-dark">
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="mx-4 my-2 h-px bg-white/10" />

        <Link
          href="/profile"
          className="flex items-center gap-[11px] border-l-[3px] border-transparent px-5 py-[9px] text-[13px] font-medium text-[#7090b0] hover:bg-white/5 hover:text-white"
        >
          <UserCircle size={17} />
          My Profile
        </Link>

        <div className="mx-4 my-2 h-px bg-white/10" />

        <Link
          href="/logout"
          className="flex items-center gap-[11px] border-l-[3px] border-transparent px-5 py-[9px] text-[13px] font-medium text-[#7090b0] hover:bg-white/5 hover:text-white"
        >
          <LogOut size={17} />
          Logout
        </Link>
      </div>

      {/* Bottom User */}

      <div className="border-t border-white/10 px-5 py-[14px]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold font-bold text-navy-dark">
            AA
          </div>

          <div>
            <div className="text-sm font-semibold text-white">
              Aisha Adams
            </div>

            <div className="text-xs text-[#7090b0]">
              Parent
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}