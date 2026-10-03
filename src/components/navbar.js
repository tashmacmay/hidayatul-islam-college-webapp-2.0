"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Lock, Menu, X } from "lucide-react";

const links = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Academics", href: "/academics" },
  { name: "News", href: "/news" },
  { name: "Resources", href: "/resources" },
  { name: "Gallery", href: "/gallery" },
  { name: "Contact", href: "/contact" },
];

const publicPages = [
  "/",
  "/about",
  "/academics",
  "/news",
  "/resources",
  "/gallery",
  "/contact",
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isPublicPage = publicPages.includes(pathname);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={`z-50 w-full text-white ${
        isPublicPage ? "absolute left-0 top-0" : "relative"
      }`}
    >
      <nav
        className={`shadow-[0_2px_8px_rgba(0,0,0,0.12)] ${
          isPublicPage ? "bg-navy/85" : "bg-navy"
        }`}
      >
        <div className="flex h-[76px] w-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/* Logo and school name */}
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="flex min-w-0 items-center gap-2.5"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-gold bg-white sm:h-14 sm:w-14">
              <img
                src="/images/HIC_Logo2.png"
                alt="Hidayatul Islam College Logo"
                className="h-10 w-10 object-contain sm:h-12 sm:w-12"
              />
            </div>

            <div className="min-w-0 leading-tight">
              <h1 className="text-sm font-semibold leading-tight text-white sm:text-base">
                Hidayatul Islam College
              </h1>

              <p className="text-[10px] font-medium text-gold">
                Knowledge is Light - Primary School
              </p>
            </div>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-5 text-[12px] font-normal lg:flex">
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
              className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-gold px-4 py-1.5 font-medium text-navy transition-colors hover:bg-gold-light"
            >
              <Lock size={10} />
              Portal Login
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={
              menuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/30 text-white transition-colors hover:border-gold hover:text-gold lg:hidden"
          >
            {menuOpen ? <X size={25} /> : <Menu size={25} />}
          </button>
        </div>

        {/* Mobile navigation: solid navy so links remain readable */}
        {menuOpen && (
          <div
            id="mobile-navigation"
            className="border-t border-white/15 bg-navy px-4 pb-5 pt-3 shadow-lg sm:px-6 lg:hidden"
          >
            <div className="flex flex-col">
              {links.map((link) => {
                const active = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`border-b border-white/10 px-3 py-3 text-sm font-normal transition-colors ${
                      active
                        ? "bg-white/10 text-gold"
                        : "text-white hover:bg-white/10 hover:text-gold"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}

              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-gold px-4 py-3 text-sm font-medium text-navy transition-colors hover:bg-gold-light"
              >
                <Lock size={16} />
                Portal Login
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}