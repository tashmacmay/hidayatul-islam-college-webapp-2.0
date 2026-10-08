"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

import {
CalendarDays,
Bell,
BookOpen,
ArrowRight,
RefreshCw,
} from "lucide-react";

import ParentSidebar from "@/components/parent/ParentSidebar";
import ResponsiveAppShell from "@/components/layout/ResponsiveAppShell";
import { auth } from "@/lib/firebase";

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
icon,
title,
value,
subtitle,
href,
}) {
return ( <Link href={href} className="group block"> <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-gold hover:shadow-md"> <div className="flex items-start justify-between"> <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy"> <span className="text-gold">
{icon} </span> </div>

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

// ============================================================
// SECTION CARD
// ============================================================

function SectionCard({
title,
subtitle,
href,
children,
}) {
return ( <section className="rounded-2xl border border-slate-100 bg-white shadow-sm"> <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4"> <div> <h2 className="text-lg font-bold text-navy">
{title} </h2>

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

// ============================================================
// QUICK LINK
// ============================================================

function QuickLink({
href,
icon,
title,
description,
}) {
return ( <Link
   href={href}
   className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-gold hover:shadow-md"
 > <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy transition group-hover:bg-gold"> <span className="text-gold group-hover:text-navy">
{icon} </span> </div>

   <div className="min-w-0 flex-1">
    <h3 className="font-bold text-navy">
      {title}
    </h3>

    <p className="mt-1 text-sm text-text-muted">
      {description}
    </p>
  </div>

  <ArrowRight
    size={18}
    className="shrink-0 text-slate-300 transition group-hover:text-gold"
  />
</Link>
 
);
}

// ============================================================
// PARENT DASHBOARD
// ============================================================

export default function DashboardPage() {
const router = useRouter();

// ==========================================================
// AUTH
// ==========================================================

const [user, setUser] = useState(null);
const [authLoading, setAuthLoading] = useState(true);

// ==========================================================
// DASHBOARD DATA
// ==========================================================

const [notices, setNotices] = useState([]);
const [resourceCount, setResourceCount] =
useState(0);

// ==========================================================
// LOADING / ERROR
// ==========================================================

const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

// ==========================================================
// AUTHENTICATION
// ==========================================================

useEffect(() => {
const unsubscribe = onAuthStateChanged(
auth,
(currentUser) => {
if (!currentUser) {
router.push("/login");
return;
}

     setUser(currentUser);
    setAuthLoading(false);
  }
);

return () => unsubscribe();
 
}, [router]);

// ==========================================================
// LOAD DASHBOARD DATA
// ==========================================================

useEffect(() => {
if (!user) {
return;
}

 
async function loadDashboard() {
  try {
    setLoading(true);
    setError("");

    const token = await user.getIdToken();

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // ------------------------------------------------------
    // Load notices and resources.
    //
    // Bookings are intentionally not loaded here.
    // ------------------------------------------------------

    const [
      noticesResponse,
      resourcesResponse,
    ] = await Promise.all([
      fetch("/api/notices", {
        method: "GET",
        headers,
      }),

      fetch("/api/resources", {
        method: "GET",
        headers,
      }),
    ]);

    const [
      noticesData,
      resourcesData,
    ] = await Promise.all([
      noticesResponse.json(),
      resourcesResponse.json(),
    ]);

    // ------------------------------------------------------
    // Notices
    // /api/notices returns the array directly.
    // ------------------------------------------------------

    if (!noticesResponse.ok) {
      throw new Error(
        noticesData.error ||
          "Failed to load notices."
      );
    }

    setNotices(
      Array.isArray(noticesData)
        ? noticesData
        : []
    );

    // ------------------------------------------------------
    // Resources
    // ------------------------------------------------------

    if (!resourcesResponse.ok) {
      throw new Error(
        resourcesData.error ||
          "Failed to load resources."
      );
    }

    const resources = Array.isArray(
      resourcesData
    )
      ? resourcesData
      : Array.isArray(
          resourcesData.resources
        )
      ? resourcesData.resources
      : [];

    setResourceCount(resources.length);
  } catch (err) {
    console.error(
      "Parent dashboard error:",
      err
    );

    setError(
      err.message ||
        "Unable to load dashboard data. Please try again."
    );
  } finally {
    setLoading(false);
  }
}

loadDashboard();
 
}, [user]);

// ==========================================================
// AUTH LOADING
// ==========================================================

if (authLoading) {
return ( <div className="flex min-h-screen items-center justify-center bg-slate-100"> <RefreshCw
       size={28}
       className="animate-spin text-gold"
     /> </div>
);
}

if (!user) {
return null;
}

// ==========================================================
// USER DISPLAY NAME
// ==========================================================

const displayName =
user.displayName ||
user.email?.split("@")[0] ||
"Parent";

// ==========================================================
// RECENT NOTICES
// ==========================================================

const recentNotices = notices.slice(0, 3);

// ==========================================================
// PAGE
// ==========================================================

return (
<ResponsiveAppShell
sidebar={(sidebarProps) => (
<ParentSidebar {...sidebarProps} />
)}
> <main className="min-h-screen bg-slate-100"> <div className="mx-auto w-full max-w-[1600px] px-5 py-6 md:px-8 md:py-8">

       {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <section className="mb-7">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Parent Portal
          </span>
        </div>

        <h1 className="text-2xl font-bold text-navy md:text-3xl">
          Assalamu Alaikum, {displayName}
        </h1>

        <p className="mt-1 max-w-2xl text-sm text-text-muted">
          Welcome back. Here is a quick overview of
          your school information.
        </p>
      </section>

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ==================================================
          SUMMARY CARDS
      ================================================== */}

      <section className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {/* ------------------------------------------------
            BOOKINGS
            ------------------------------------------------
            Intentionally left empty because bookings are
            being handled by another team member.
        ------------------------------------------------ */}

        <Link
          href="/my-bookings"
          className="group block"
        >
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-gold hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy">
                <CalendarDays
                  size={21}
                  className="text-gold"
                />
              </div>

              <ArrowRight
                size={17}
                className="text-slate-300 transition group-hover:text-gold"
              />
            </div>

            <p className="mt-5 text-sm font-medium text-text-muted">
              My Bookings
            </p>

            <h3 className="mt-1 text-3xl font-bold text-navy">
              —
            </h3>

            <p className="mt-1 text-xs text-text-muted">
              Booking information
            </p>
          </div>
        </Link>

        {/* ------------------------------------------------
            NOTICES
        ------------------------------------------------ */}

        <StatCard
          icon={<Bell size={21} />}
          title="Notices"
          value={
            loading
              ? "..."
              : notices.length
          }
          subtitle="Published school notices"
          href="/notices"
        />

        {/* ------------------------------------------------
            RESOURCES
        ------------------------------------------------ */}

        <StatCard
          icon={<BookOpen size={21} />}
          title="Resources"
          value={
            loading
              ? "..."
              : resourceCount
          }
          subtitle="Available resources"
          href="/resources"
        />

      </section>

      {/* ==================================================
          RECENT NOTICES
      ================================================== */}

      <section className="mb-7">
        <SectionCard
          title="Recent Notices"
          subtitle="Latest published school announcements"
          href="/notices"
        >
          {loading ? (
            <div className="flex items-center gap-2 py-5 text-sm text-text-muted">
              <RefreshCw
                size={17}
                className="animate-spin text-gold"
              />

              Loading notices...
            </div>
          ) : recentNotices.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
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
          ) : (
            <div className="space-y-2">
              {recentNotices.map(
                (notice) => (
                  <Link
                    key={notice.id}
                    href="/notices"
                    className="group block rounded-xl p-4 transition hover:bg-gold-pale"
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
                )
              )}
            </div>
          )}
        </SectionCard>
      </section>

      {/* ==================================================
          QUICK LINKS
      ================================================== */}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-navy">
            Quick Links
          </h2>

          <p className="mt-1 text-sm text-text-muted">
            Quickly access important school information.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">

          <QuickLink
            href="/resources"
            icon={<BookOpen size={22} />}
            title="Learning Resources"
            description="Access educational materials, videos, guides and school documents."
          />

          <QuickLink
            href="/calendar"
            icon={<CalendarDays size={22} />}
            title="School Calendar"
            description="View term calendars, important dates and school information."
          />

        </div>
      </section>

    </div>
  </main>
</ResponsiveAppShell>
 
);
}
