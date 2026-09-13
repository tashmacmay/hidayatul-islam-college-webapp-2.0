"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";

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
    <header className="w-full text-white">
      <nav className="h-[76px] bg-navy shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
        <div className="flex h-full w-full items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-gold bg-white sm:h-14 sm:w-14">
              <img
                src="/images/HIC_Logo2.png"
                alt="Hidayatul Islam College Logo"
                className="h-10 w-10 object-contain sm:h-12 sm:w-12"
              />
            </div>

            <div className="leading-tight">
              <h1 className="text-sm font-semibold leading-tight text-white sm:text-base">
                Hidayatul Islam College
              </h1>
              <p className="text-[10px] font-medium text-gold">
                Knowledge is Light - Primary School
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-5 text-[12px] font-semibold md:flex">
            {links.map((link) => {
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`pb-1 transition-colors ${
                    active
                      ? "border-b-2 border-gold text-gold"
                      : "text-white hover:text-gold"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            <Link
              href="/login"
              className="flex items-center gap-2 rounded-lg bg-gold px-4 py-1.5 font-semibold text-navy transition-colors hover:bg-gold-light"
            >
              <Lock size={10} />
              Portal Login
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}