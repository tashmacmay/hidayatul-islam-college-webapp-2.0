"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Mail, Lock } from "lucide-react";

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
<div className="bg-navy-dark px-6 h-7 text-xs">
<div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-8">
              <div className="flex items-center gap-5">
            <span className="flex items-center gap-2">
              <Phone size={12} />
              +27 21 000 XXXX
            </span>

            <span className="flex items-center gap-2">
              <Mail size={12} />
              info@hidayatulislam.co.za
            </span>
          </div>

          <div className="flex items-center gap-5">
            <Link href="/contact" className="hover:text-gold">
              Admissions 2026
            </Link>
            <Link href="/login" className="hover:text-gold">
              Portal Login
            </Link>
          </div>
        </div>
      </div>

<nav className="bg-navy px-6 h-16 shadow-md">
           <div className="flex items-center justify-between px-8">       
        <Link href="/" className="flex items-center gap-2.5">
<div className="flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-gold bg-white">
    <img
    src="\images\HIC_Logo2.png"
    alt="Hidayatul Islam College Logo"
    className="h-14 w-14 object-contain"
  />
</div>

            <div className="leading-tight">
              <h1 className="text-lg font-semibold leading-tight text-white">
                Hidayatul Islam College
              </h1>
              <p className="text-[10px] font-medium text-gold">              
                  Knowledge is Light - Primary School
              </p>
            </div>
          </Link>

<div className="hidden items-center gap-5 text-[14px] font-medium md:flex">      
        {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`pb-1 transition ${
                  pathname === link.href
                    ? "border-b-2 border-gold text-gold"
                    : "text-white hover:text-gold"
                }`}
              >
                {link.name}
              </Link>
            ))}

            <Link
              href="/login"
              className="flex items-center gap-2 rounded-lg bg-gold px-4 py-1.5 font-semibold text-navy transition hover:bg-gold-light"
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