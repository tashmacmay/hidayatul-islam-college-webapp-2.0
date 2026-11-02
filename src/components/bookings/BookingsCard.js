"use client";

import { Search } from "lucide-react";

export default function BookingsCard({
  title,
  titleIcon: Icon,
  actions,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search bookings...",
  activeFilter,
  onFilterChange,
  filters = ["upcoming", "past", "all"],
  children,
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      {/* Title row + actions */}
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={20} className="shrink-0 text-navy" />}

          <h2 className="text-xl font-bold text-navy">{title}</h2>
        </div>

        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        />

        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold"
        />
      </div>

      {/* Filter pills */}
      <div className="mb-5 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => onFilterChange(filter)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeFilter === filter
                ? "bg-navy text-white"
                : "bg-gray-100 text-text-muted hover:bg-gray-200"
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* Table area — page supplies its own table */}
      {children}
    </div>
  );
}