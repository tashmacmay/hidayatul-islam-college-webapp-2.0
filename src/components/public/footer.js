import Link from "next/link";
import { Container } from "@/components/ui/layout";

export default function Footer() {
  return (
    <footer className="site-footer">
      <Container className="flex flex-col items-center justify-between gap-4 py-6 md:flex-row md:py-4">
        <div className="text-center md:text-left">
          <h2 className="site-footer-title">Hidayatul Islam College</h2>
          <p className="site-footer-copy">
            © 2026 Hidayatul Islam College · Kensington, Cape Town · All rights reserved.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-5">
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
      </Container>
    </footer>
  );
}