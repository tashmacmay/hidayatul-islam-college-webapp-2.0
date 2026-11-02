import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function DashboardStatCard({
  icon,
  title,
  value,
  subtitle,
  href,
}) {
  return (
    <Link href={href} className="group block">
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-gold hover:shadow-md">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy">
            <span className="text-gold">
              {icon}
            </span>
          </div>

          <ArrowRight
            size={17}
            className="text-slate-300 transition group-hover:text-gold"
          />
        </div>

        <p className="mt-5 text-sm font-medium text-text-muted">
          {title}
        </p>

        <h3 className="mt-1 text-3xl font-bold text-navy">
          {value}
        </h3>

        <p className="mt-1 text-xs text-text-muted">
          {subtitle}
        </p>
      </div>
    </Link>
  );
}
