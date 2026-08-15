"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  CalendarDays,
  Bell,
  BookOpen,
  GraduationCap,
} from "lucide-react";

function StatCard({ icon, title, value, subtitle }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-gold hover:shadow-md">
      <div className="mb-4 text-navy">{icon}</div>
      <p className="text-sm text-text-muted">{title}</p>
      <h3 className="mt-2 text-3xl font-bold text-navy">{value}</h3>
      <p className="mt-1 text-sm text-text-muted">{subtitle}</p>
    </div>
  );
}

function DashboardCard({ title, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition hover:border-gold hover:shadow-md">
      <h2 className="text-xl font-bold text-navy">{title}</h2>
      <div className="mt-4 h-1 w-12 rounded-full bg-gold" />
      <div className="mt-6">{children}</div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  const displayName = user.displayName || user.email?.split("@")[0] || "Parent";

  return (
    <>
      {/* Page Header – no logout button */}
      <section className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[3px] text-gold">
          Parent Dashboard
        </p>
        <h1 className="mt-2 text-4xl font-bold text-navy">
          Assalamu Alaikum, {displayName}
        </h1>
        <div className="mt-4 h-1 w-16 rounded-full bg-gold" />
        <p className="mt-4 max-w-2xl text-text-muted">
          Welcome back. Here you can manage bookings, view notices, access
          resources and keep track of important school information.
        </p>
      </section>

      {/* Stats */}
      <section className="mb-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<CalendarDays size={30} />}
          title="My Bookings"
          value="2"
          subtitle="Upcoming appointments"
        />
        <StatCard
          icon={<Bell size={30} />}
          title="Notices"
          value="3"
          subtitle="New this week"
        />
        <StatCard
          icon={<BookOpen size={30} />}
          title="Resources"
          value="12"
          subtitle="Available resources"
        />
        <StatCard
          icon={<GraduationCap size={30} />}
          title="Events"
          value="2"
          subtitle="Upcoming this month"
        />
      </section>

      {/* Row 1 */}
      <section className="grid gap-6 lg:grid-cols-2">
        <DashboardCard title="Upcoming Bookings">
          <div className="space-y-4">
            <div className="rounded-lg bg-gold-pale p-4">
              <p className="font-semibold text-navy">Teacher Meeting</p>
              <p className="text-sm text-text-muted">Mr Johnson • 09:30 AM</p>
            </div>
            <div className="rounded-lg bg-gold-pale p-4">
              <p className="font-semibold text-navy">Uniform Fitting</p>
              <p className="text-sm text-text-muted">Admin Office • 10:00 AM</p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Recent Notices">
          <div className="space-y-5">
            <div>
              <p className="font-semibold text-navy">Sports Day – 23 May</p>
              <p className="text-sm text-text-muted">Posted 10 May</p>
            </div>
            <div>
              <p className="font-semibold text-navy">Winter Uniform Reminder</p>
              <p className="text-sm text-text-muted">Posted 9 May</p>
            </div>
            <div>
              <p className="font-semibold text-navy">School Fees – Term 2</p>
              <p className="text-sm text-text-muted">Posted 8 May</p>
            </div>
          </div>
        </DashboardCard>
      </section>

      {/* Row 2 */}
      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <DashboardCard title="My Learner">
          <div className="space-y-3">
            <p>
              <span className="font-semibold text-navy">Name:</span> Yusuf Adams
            </p>
            <p>
              <span className="font-semibold text-navy">Grade:</span> Grade 4
            </p>
            <p>
              <span className="font-semibold text-navy">Class:</span> 4B
            </p>
            <p>
              <span className="font-semibold text-navy">Attendance:</span> 94%
            </p>
          </div>
        </DashboardCard>

        <DashboardCard title="School Calendar">
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-navy">
                Parent Teacher Consultations
              </p>
              <p className="text-sm text-text-muted">22 May</p>
            </div>
            <div>
              <p className="font-semibold text-navy">Sports Day</p>
              <p className="text-sm text-text-muted">30 May</p>
            </div>
            <div>
              <p className="font-semibold text-navy">End of Term 2</p>
              <p className="text-sm text-text-muted">26 June</p>
            </div>
          </div>
        </DashboardCard>
      </section>
    </>
  );
}