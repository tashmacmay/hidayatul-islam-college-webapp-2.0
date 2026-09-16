import {
  CalendarDays,
  Bell,
  BookOpen,
  Users,
} from "lucide-react";

function StatCard({ icon, title, value, subtitle }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 text-navy">
        {icon}
      </div>

      <p className="text-sm text-text-muted">
        {title}
      </p>

      <h3 className="mt-1 text-3xl font-bold text-navy">
        {value}
      </h3>

      <p className="mt-1 text-sm text-text-muted">
        {subtitle}
      </p>
    </div>
  );
}

function DashboardCard({ title, children }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-lg font-bold text-navy">
        {title}
      </h2>

      {children}
    </div>
  );
}

export default function StaffDashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-text-muted">
          Assalamu Alaikum,
        </p>

        <h1 className="text-4xl font-bold text-navy">
          Welcome back, Staff Member
        </h1>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<CalendarDays size={28} />}
          title="Bookings Today"
          value="12"
          subtitle="Scheduled appointments"
        />

        <StatCard
          icon={<Bell size={28} />}
          title="Notices"
          value="5"
          subtitle="Pending announcements"
        />

        <StatCard
          icon={<BookOpen size={28} />}
          title="Resources"
          value="48"
          subtitle="Available resources"
        />

        <StatCard
          icon={<Users size={28} />}
          title="Parents"
          value="214"
          subtitle="Registered parents"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardCard title="Today's Bookings">
          <div className="space-y-4">
            <div className="rounded-lg bg-off-white p-4">
              Parent Consultation - 09:00
            </div>

            <div className="rounded-lg bg-off-white p-4">
              Admissions Meeting - 11:00
            </div>

            <div className="rounded-lg bg-off-white p-4">
              Principal Meeting - 14:00
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Recent Notices">
          <div className="space-y-4">
            <p>Sports Day Announcement</p>
            <p>Winter Uniform Reminder</p>
            <p>Fee Collection Update</p>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}