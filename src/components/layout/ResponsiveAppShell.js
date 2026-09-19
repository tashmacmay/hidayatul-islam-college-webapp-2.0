"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

const SIDEBAR_STORAGE_KEY = "hic-sidebar-collapsed";

export default function ResponsiveAppShell({ sidebar, children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [initialised, setInitialised] = useState(false);

  // ------------------------------------------------------------
  // Load the sidebar preference once per browser session
  // ------------------------------------------------------------
  useEffect(() => {
    const savedState = sessionStorage.getItem(SIDEBAR_STORAGE_KEY);

    if (savedState === "true" || savedState === "false") {
      setCollapsed(savedState === "true");
    } else {
      // Default:
      // >= 1200px  -> expanded
      // 768-1199px -> collapsed
      const isLargeScreen = window.matchMedia(
        "(min-width: 1200px)"
      ).matches;

      setCollapsed(!isLargeScreen);
    }

    setInitialised(true);
  }, []);

  // ------------------------------------------------------------
  // Save the user's manual choice for the current session
  // ------------------------------------------------------------
  useEffect(() => {
    if (!initialised) return;

    sessionStorage.setItem(
      SIDEBAR_STORAGE_KEY,
      String(collapsed)
    );
  }, [collapsed, initialised]);

  // ------------------------------------------------------------
  // Close mobile drawer when Escape is pressed
  // ------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // ------------------------------------------------------------
  // Prevent page scrolling while mobile drawer is open
  // ------------------------------------------------------------
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const toggleSidebar = () => {
    setCollapsed((current) => !current);
  };

  const openMobileSidebar = () => {
    setMobileOpen(true);
  };

  const closeMobileSidebar = () => {
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-off-white md:flex">

      {/* ======================================================
          SIDEBAR

          IMPORTANT:
          The sidebar is rendered ONLY ONCE.

          Desktop:
          - It participates in the flex layout.
          - It takes up 240px or 64px of actual space.

          Mobile:
          - It becomes a fixed drawer.
          - It does not affect the page width.
          ====================================================== */}

      {sidebar({
        collapsed,
        mobileOpen,
        onToggle: toggleSidebar,
        onCloseMobile: closeMobileSidebar,
      })}

      {/* ======================================================
          MAIN CONTENT
          ====================================================== */}

      <div className="min-w-0 flex-1">

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={openMobileSidebar}
          aria-label="Open navigation menu"
          className="fixed left-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-lg bg-[#0d2260] text-white shadow-md transition hover:bg-[#1a3070] md:hidden"
        >
          <Menu size={20} />
        </button>

        {children}
      </div>

      {/* ======================================================
          MOBILE OVERLAY

          Only exists when the drawer is open.
          Clicking it closes the drawer.
          ====================================================== */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={closeMobileSidebar}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}
    </div>
  );
}