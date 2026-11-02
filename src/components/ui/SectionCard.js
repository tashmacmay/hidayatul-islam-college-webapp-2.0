import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SectionCard({
  title,
  subtitle,
  href,
  children,
}) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-lg font-bold text-navy">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-1 text-xs text-text-muted">
              {subtitle}
            </p>
          )}
        </div>

        {href && (
          <Link
            href={href}
            className="flex shrink-0 items-center gap-1 text-xs font-semibold text-navy transition hover:text-gold"
          >
            View All
            <ArrowRight size={14} />
          </Link>
        )}
      </div>

      <div className="p-5">
        {children}
      </div>
    </section>
  );
}
