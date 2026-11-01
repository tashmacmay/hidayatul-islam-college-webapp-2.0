import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      {/* Replaced Container with full-width flex and matching hero padding */}
      <div className="flex w-full flex-col items-center justify-between gap-4 px-6 py-6 md:flex-row md:px-16 md:py-4">
        <div className="text-center md:text-left">
          <h2 className="site-footer-title">Hidayatul Islam College</h2>
          <p className="site-footer-copy">
            © 2026 Hidayatul Islam College · Kensington, Cape Town · All rights reserved.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          <Link href="#" className="site-footer-link">
            POPIA Policy
          </Link>
          <Link href="#" className="site-footer-link">
            Terms of Use
          </Link>
          <Link href="#" className="site-footer-link">
            Accessibility
          </Link>
          {/* Staff Portal removed as requested */}
        </div>
      </div>
    </footer>
  );
}