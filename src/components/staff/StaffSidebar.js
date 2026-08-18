"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  LayoutDashboard,
  Bell,
  CalendarDays,
  UserCircle,
  LogOut,
  Settings,
} from "lucide-react";

export default function StaffSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const links = [
    { name: "Dashboard", href: "/staff/dashboard", icon: LayoutDashboard },
    { name: "Notices", href: "/staff/notices", icon: Bell },
    { name: "Bookings", href: "/staff/bookings", icon: CalendarDays },
    // Add more staff links as needed
  ];

  // Admin‑only links (shown if user is admin – you can fetch isAdmin from context)
  const adminLinks = [
    { name: "User Management", href: "/admin/users", icon: UserCircle },
    { name: "System Settings", href: "/admin/settings", icon: Settings },
  ];

  // In a real app, you'd get isAdmin from a global state or fetch it.
  // For now, we'll show them always (you can conditionally render later).
  const isAdmin = true; // TODO: replace with actual admin check

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-50 flex w-64 flex-col bg-navy-dark text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <img
          src="/images/HIC_Logo2.png"
          alt="Logo"
          className="h-10 w-10 rounded-full border-2 border-gold bg-white p-1"
        />
        <div>
          <strong className="block text-sm font-bold">HIC Portal</strong>
          <span className="text-xs text-gold-light">Staff</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-5 py-3 text-sm transition ${
                active
                  ? "border-l-4 border-gold bg-gold/10 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {link.name}
            </Link>
          );
        })}

        {/* Admin section */}
        {isAdmin && (
          <>
            <div className="mx-4 my-2 h-px bg-white/10" />
            <p className="px-5 py-2 text-xs uppercase tracking-wider text-gray-500">
              Admin
            </p>
            {adminLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-5 py-3 text-sm transition ${
                    active
                      ? "border-l-4 border-gold bg-gold/10 text-white"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {link.name}
                </Link>
              );
            })}
          </>
        )}

        <div className="mx-4 my-2 h-px bg-white/10" />

        <Link
          href="/staff/profile"
          className="flex items-center gap-3 px-5 py-3 text-sm text-gray-400 hover:bg-white/5 hover:text-white"
        >
          <UserCircle size={18} />
          Profile
        </Link>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-5 py-3 text-sm text-gray-400 hover:bg-white/5 hover:text-white"
        >
          <LogOut size={18} />
          Logout
        </button>
      </nav>

      {/* Bottom user info (optional) */}
      <div className="border-t border-white/10 px-5 py-4 text-sm">
        <p className="font-semibold">Staff Name</p>
        <p className="text-xs text-gray-400">Staff</p>
      </div>
    </aside>
  );
}