"use client";

import ResponsiveAppShell from "@/components/layout/ResponsiveAppShell";

/**
 * Standard shell for every logged-in page.
 *
 * Wraps content in:
 *   - ResponsiveAppShell (sidebar + mobile drawer)
 *   - <main> with the standard layout classes
 *   - inner content container with standard padding, max-width, and
 *     vertical spacing between sections
 *
 * Props:
 *   - sidebar:  render function passed straight to ResponsiveAppShell
 *   - children: page content (PageHeader + sections)
 *   - modals:   optional — modals to render as siblings of <main>.
 *               Rendered AFTER </main> but still inside the shell.
 *   - spaceY:   optional Tailwind class for vertical spacing between
 *               sections. Defaults to "space-y-8". Pass "" if the page
 *               uses explicit mb-* spacing and space-y would double up.
 *   - maxWidth: optional Tailwind max-width class for the inner
 *               container. Defaults to "max-w-[1600px]". Pass a narrower
 *               value (e.g. "max-w-[1200px]") for pages that intentionally
 *               use a narrower content column.
 */
export default function ShellPage({
  sidebar,
  children,
  modals,
  spaceY = "space-y-8",
  maxWidth = "max-w-[1600px]",
}) {
  return (
    <ResponsiveAppShell sidebar={sidebar}>
      <main className="relative min-w-0 flex-1 min-h-screen bg-slate-100">
        <div
          className={`mx-auto w-full ${maxWidth} px-5 py-6 md:px-8 md:py-8 ${spaceY}`}
        >
          {children}
        </div>
      </main>
      {modals}
    </ResponsiveAppShell>
  );
}
