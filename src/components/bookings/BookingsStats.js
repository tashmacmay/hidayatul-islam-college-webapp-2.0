export default function BookingsStats({ bookings, loading }) {
  const upcomingCount = bookings.filter((b) => b.status === "upcoming").length;
  const pastCount = bookings.filter((b) => b.status === "past").length;
  const totalCount = bookings.length;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <p className="text-sm text-text-muted">Upcoming</p>
        <h2 className="mt-2 text-3xl font-bold text-navy">
          {loading ? "..." : upcomingCount}
        </h2>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <p className="text-sm text-text-muted">Past</p>
        <h2 className="mt-2 text-3xl font-bold text-navy">
          {loading ? "..." : pastCount}
        </h2>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <p className="text-sm text-text-muted">Total</p>
        <h2 className="mt-2 text-3xl font-bold text-navy">
          {loading ? "..." : totalCount}
        </h2>
      </div>
    </div>
  );
}