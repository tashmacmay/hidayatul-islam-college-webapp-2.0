"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Lock, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/layout";

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
    <header className={`nav-shell ${isPublicPage ? "absolute left-0 top-0" : "relative"}`}>
      <nav className={isPublicPage ? "nav-container" : "nav-container--solid"}>
        <Container className="nav-inner">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="nav-brand"
          >
            <div className="nav-brand-mark">
              <img
                src="/images/HIC_Logo2.png"
                alt="Hidayatul Islam College Logo"
                className="h-10 w-10 object-contain sm:h-12 sm:w-12"
              />
            </div>

            <div className="min-w-0 leading-tight">
              <h1 className="nav-brand-title">Hidayatul Islam College</h1>
              <p className="nav-brand-tag">Knowledge is Light - Primary School</p>
            </div>
          </Link>

          <div className="nav-desktop">
            {links.map((link) => {
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`${"nav-link"} ${active ? "nav-link--active" : ""}`}
                >
                  {link.name}
                </Link>
              );
            })}

            <Button href="/login" variant="primary" size="sm" className="ml-2">
              <Lock size={12} />
              Portal Login
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={
              menuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            className="nav-toggle"
          >
            {menuOpen ? <X size={25} /> : <Menu size={25} />}
          </button>
        </Container>

        {menuOpen && (
          <div id="mobile-navigation" className="nav-mobile-panel">
            <Container className="flex flex-col">
              {links.map((link) => {
                const active = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`${"nav-mobile-link"} ${active ? "nav-mobile-link--active" : ""}`}
                  >
                    {link.name}
                  </Link>
                );
              })}

              <Button
                href="/login"
                variant="primary"
                className="mt-4 w-full"
                onClick={() => setMenuOpen(false)}
              >
                <Lock size={16} />
                Portal Login
              </Button>
            </Container>
          </div>
        )}
      </nav>
    </header>
  );
}