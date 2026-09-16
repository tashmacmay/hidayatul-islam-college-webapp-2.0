"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  CalendarDays,
  Bell,
  BookOpen,
  Users,
  UserCircle,
  LogOut,
} from "lucide-react";

const links = [
  {
    name: "Dashboard",
    href: "/staff/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Bookings",
    href: "/staff/bookings",
    icon: CalendarDays,
  },
  {
    name: "Notices",
    href: "/staff/notices",
    icon: Bell,
  },
  {
    name: "Resources",
    href: "/staff/resources",
    icon: BookOpen,
  },
  {
    name: "Calendar",
    href: "/staff/calendar",
    icon: Users,
  },
];

export default function StaffSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-50 flex w-[240px] flex-col bg-navy-dark">

      {/* Logo */}
      <div className="flex items-center gap-[10px] border-b border-white/10 px-5 py-[18px]">
        <img
          src="/images/HIC_Logo2.png"
          alt="HIC Logo"
          className="h-[42px] w-[42px] rounded-full border-2 border-gold bg-white p-[2px]"
        />

        <div>
          <strong className="block font-serif text-[13px] font-bold text-white">
            HIC Staff
          </strong>

          <span className="text-[10px] text-gold-light">
            Hidayatul Islam College
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-[10px]">
        {links.map((link) => {
          const Icon = link.icon;

          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-[11px] border-l-[3px] px-5 py-[9px] text-[13px] font-medium transition-all ${
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

        <div className="mx-4 my-2 h-px bg-white/10" />

        <Link
          href="/staff/profile"
          className="flex items-center gap-[11px] border-l-[3px] border-transparent px-5 py-[9px] text-[13px] font-medium text-[#7090b0] hover:bg-white/5 hover:text-white"
        >
          <UserCircle size={17} />
          Profile
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

      {/* User */}
      <div className="border-t border-white/10 px-5 py-[14px]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold font-bold text-navy-dark">
            SM
          </div>

          <div>
            <div className="text-sm font-semibold text-white">
              Staff Member
            </div>

            <div className="text-xs text-[#7090b0]">
              Staff
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}