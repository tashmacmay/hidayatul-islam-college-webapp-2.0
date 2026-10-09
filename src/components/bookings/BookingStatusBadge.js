export default function BookingStatusBadge({ status }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        status === "upcoming"
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {status === "upcoming" ? "Upcoming" : "Past"}
    </span>
  );
}