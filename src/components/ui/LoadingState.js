"use client";

import { RefreshCw } from "lucide-react";

export default function LoadingState({
  label,
  className,
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-10 ${className || ""}`}
    >
      <RefreshCw className="animate-spin text-gold" size={32} />
      <p className="mt-3 text-sm text-text-muted">
        {label}
      </p>
    </div>
  );
}
