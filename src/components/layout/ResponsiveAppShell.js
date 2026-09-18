"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const STORAGE_KEY = "hic-sidebar-collapsed";

export default function ResponsiveAppShell({
  children,
  sidebar,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  /*
   * Restore the user's sidebar preference for the current browser session.
   * sessionStorage is intentionally used instead of localStorage so that
   * the preference does not persist indefinitely.
   */
  useEffect(() => {
    const savedState = sessionStorage.getItem(STORAGE_KEY);

    if (savedState !== null) {
      setIsCollapsed(savedState === "true");
    } else {
      /*
       * On first use, tablets get the collapsed layout while larger
       * desktop screens start expanded.
       *
       * This is only the initial default. Once the user changes the
       * sidebar state, their choice is preserved for the session.
       */
      setIsCollapsed(window.innerWidth < 1200);
    }

    setHydrated(true);
  }, []);

  const toggleCollapsed = () => {
    setIsCollapsed((current) => {
      const next = !current;
      sessionStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  const openMobileMenu = () => {
    setIsMobileOpen(true);
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  /*
   * Close the mobile drawer after navigating to another page.
   */
  useEffect(() => {
    setIsMobileOpen(false);
  }, [children]);

  if (!hydrated) {
    /*
     * Prevent a visible layout jump while the saved sidebar preference
     * is being restored from sessionStorage.
     */
    return (
      <div className="min-h-screen bg-off-white">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-off-white">
      {/* Mobile overlay */}
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50
          h-screen
          transition-transform duration-300 ease-in-out
          md:relative md:z-auto md:translate-x-0
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:block
          ${isCollapsed ? "md:w-[64px]" : "md:w-[240px]"}
          w-[240px]
          shrink-0
        `}
      >
        {sidebar({
          isCollapsed,
          isMobileOpen,
          onToggleCollapsed: toggleCollapsed,
          onCloseMobile: closeMobileMenu,
        })}
      </div>

      {/* Main application area */}
      <div className="min-w-0 flex-1">
        {/* Mobile navigation button */}
        <div className="flex items-center border-b border-border bg-white px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={openMobileMenu}
            aria-label="Open navigation menu"
            className="rounded-lg p-2 text-navy hover:bg-gray-100"
          >
            <Menu size={24} />
          </button>

          <span className="ml-3 text-sm font-semibold text-navy">
            Hidayatul Islam College
          </span>
        </div>

        {children}
      </div>
    </div>
  );
}