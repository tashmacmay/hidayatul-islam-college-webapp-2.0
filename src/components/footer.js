import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-white/5 bg-navy-dark text-white">
      <div className="flex items-center justify-between px-8 py-2.5">

        {/* Left Side */}
        <div>
          <h2 className="text-[13px] font-medium text-slate-300">
            Hidayatul Islam College 
          </h2>

          <p className="mt-1 text-[11px] text-gray-500">
            © 2026 Hidayatul Islam College · Kensington, Cape Town · All rights reserved.
          </p>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-5 text-[11px] text-gray-500">
          <Link
            href="#"
            className="transition-colors duration-200 hover:text-gray-300"
          >
            POPIA Policy
          </Link>

          <Link
            href="#"
            className="transition-colors duration-200 hover:text-gray-300"
          >
            Terms of Use
          </Link>

          <Link
            href="#"
            className="transition-colors duration-200 hover:text-gray-300"
          >
            Accessibility
          </Link>

          <Link
            href="/staff/login"
            className="transition-colors duration-200 hover:text-gray-300"
          >
            Staff Portal
          </Link>
        </div>

      </div>
    </footer>
  );
}