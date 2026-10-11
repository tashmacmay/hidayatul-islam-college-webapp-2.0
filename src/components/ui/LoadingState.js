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
      <RefreshCw className="h-6 w-6 animate-spin text-gold" />
      <p className="mt-3 text-sm text-text-muted">
        {label}
      </p>
    </div>
  );
}
