import Link from "next/link";
import {
  ArrowRight,
  Bell,
} from "lucide-react";

export default function RecentNoticesPreview({
  notices,
  viewAllHref,
  itemHref,
}) {
  if (notices.length === 0) {
    return (
      <div className="min-h-[220px] rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
        <Bell
          size={25}
          className="mx-auto mb-2 text-slate-300"
        />

        <p className="text-sm font-semibold text-text-muted">
          No recent notices
        </p>

        <p className="mt-1 text-xs text-text-muted">
          Published school notices will appear
          here.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[220px] space-y-2">
      {notices.map((notice) => (
        <Link
          key={notice.id}
          href={itemHref || viewAllHref}
          className="group block rounded-xl border border-slate-100 p-4 transition hover:bg-gold-pale"
        >
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy">
              <Bell
                size={14}
                className="text-gold"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-navy">
                {notice.title ||
                  "School Notice"}
              </p>

              {notice.type && (
                <p className="mt-1 text-xs font-medium text-gold">
                  {notice.type}
                </p>
              )}

              {notice.content && (
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-text-muted">
                  {notice.content}
                </p>
              )}
            </div>

            <ArrowRight
              size={15}
              className="mt-1 shrink-0 text-slate-300 transition group-hover:text-gold"
            />
          </div>
        </Link>
      ))}
    </div>
  );
}
