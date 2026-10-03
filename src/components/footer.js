import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-row">
        <div>
          <h2 className="site-footer-title">Hidayatul Islam College</h2>
          <p className="site-footer-copy">
            © 2026 Hidayatul Islam College · Kensington, Cape Town · All rights reserved.
          </p>
        </div>

        <div className="flex items-center gap-5">
          <Link href="#" className="site-footer-link">
            POPIA Policy
          </Link>

          <Link href="#" className="site-footer-link">
            Terms of Use
          </Link>

          <Link href="#" className="site-footer-link">
            Accessibility
          </Link>

          <Link href="/staff/login" className="site-footer-link">
            Staff Portal
          </Link>
        </div>
      </div>
    </footer>
  );
}