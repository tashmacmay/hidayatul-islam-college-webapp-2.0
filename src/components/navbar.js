"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Academics", href: "/academics" },
  { name: "News", href: "/news" },
  { name: "Resources", href: "/resources" },
  { name: "Gallery", href: "/gallery" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="bg-navy text-white">
      <div className="bg-navy-dark px-6 py-2 text-xs">
        <div className="mx-auto flex max-w-7xl justify-between">
          <div className="flex gap-6">
            <span>☎ +27 21 000 XXXX</span>
            <span>✉ info@hidayatulislam.co.za</span>
          </div>
          <div className="flex gap-6">
            <Link href="/contact">Admissions 2026</Link>
            <Link href="/login">Portal Login</Link>
          </div>
        </div>
      </div>

      <nav className="px-6 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-4">
            <img
              src="public\images\public\images\HIC_Logo(2).webp"
              alt="Hidayatul Islam College Logo"
              className="h-16 w-16 rounded-full bg-white object-contain p-1"
            />

            <div>
              <h1 className="text-2xl font-bold leading-tight">
                Hidayatul Islam College
              </h1>
              <p className="text-sm italic text-gold">
                Knowledge is Light · Primary School
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-7 text-sm md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`pb-1 transition ${
                  pathname === link.href
                    ? "border-b-2 border-gold text-gold"
                    : "hover:text-gold"
                }`}
              >
                {link.name}
              </Link>
            ))}

            <Link
              href="/login"
              className="rounded-md bg-gold px-5 py-3 font-semibold text-navy hover:bg-gold-light"
            >
              🔒 Portal Login
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}