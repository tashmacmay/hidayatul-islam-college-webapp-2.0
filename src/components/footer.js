import Link from "next/link";

const links = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Academics", href: "/academics" },
  { name: "News", href: "/news" },
  { name: "Resources", href: "/resources" },
  { name: "Gallery", href: "/gallery" },
  { name: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-navy-dark text-white px-6 py-8 mt-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-6">
        <div>
          <h2 className="text-lg font-bold text-gold">Hidayatul Islam College</h2>
          <p className="text-sm text-gray-300 mt-2">
            Primary school education rooted in academic excellence and values.
          </p>
          <p className="text-xs text-gray-400 mt-4">
            © 2026 Hidayatul Islam College. All rights reserved.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-gold">
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}