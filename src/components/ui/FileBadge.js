import { FileText } from "lucide-react";

export function FileBadge({ title }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-navy px-4 text-center">
      <FileText size={36} className="text-gold" />
      <span className="line-clamp-2 text-sm font-semibold text-white">
        {title}
      </span>
    </div>
  );
}