"use client";

import { Clock3, FileSpreadsheet } from "lucide-react";

export default function SchoolBookingsPage() {
  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[3px] text-gold">
          Admin
        </p>

        <h1 className="mt-2 text-4xl font-bold text-navy">
          School Bookings
        </h1>

        <div className="mt-4 h-1 w-16 rounded-full bg-gold" />

        <p className="mt-4 max-w-2xl text-text-muted">
          Manage and monitor all bookings made across the school.
          Administrators can view appointments, search records,
          and create bookings on behalf of parents.
        </p>
      </div>

      {/* School Overview Section */}
<div className="mb-5 flex items-center justify-between">
  <div className="flex items-center gap-2">
    <Clock3 size={20} />

    <h2 className="text-xl font-bold text-navy">
      School Booking Overview
    </h2>
  </div>

  {/* Action Button */}
<button className="flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-navy transition hover:opacity-90">
  <FileSpreadsheet size={16} />
  Generate Report
</button>
</div>

        <p className="mb-5 text-sm text-text-muted">
          Overview of all school bookings across staff members.
        </p>

        {/* Search Bar */}
        <div className="mb-5">
          <input
            type="text"
            placeholder="Search bookings..."
            className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-gold focus:outline-none"
          />
        </div>

        {/* Bookings Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">

            <thead>
              <tr className="border-b border-gray-200 text-sm text-text-muted">
                <th className="pb-3">Parent</th>
                <th className="pb-3">Staff Member</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Time</th>
                <th className="pb-3">Purpose</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>

            <tbody>

              <tr className="border-b border-gray-100">
                <td className="py-4 font-medium text-navy">
                  Aisha Adams
                </td>

                <td>Principal</td>

                <td>20 Aug 2026</td>

                <td>09:00</td>

                <td>Admissions Query</td>

                <td>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    Confirmed
                  </span>
                </td>
              </tr>

              <tr className="border-b border-gray-100">
                <td className="py-4 font-medium text-navy">
                  Fatima Khan
                </td>

                <td>Secretary</td>

                <td>21 Aug 2026</td>

                <td>11:00</td>

                <td>Fee Discussion</td>

                <td>
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                    Pending
                  </span>
                </td>
              </tr>

              <tr>
                <td className="py-4 font-medium text-navy">
                  Yusuf Jacobs
                </td>

                <td>Principal</td>

                <td>22 Aug 2026</td>

                <td>14:00</td>

                <td>Academic Meeting</td>

                <td>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    Completed
                  </span>
                </td>
              </tr>

            </tbody>

          </table>
        </div>
      </div>
  );
}
//this is when we add the admin check
  {/* {/* School Overview Section */}
     {/* <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <Clock3 size={20} />

          <h2 className="text-xl font-bold text-navy">
            School Booking Overview
          </h2>
        </div>

        <p className="mb-4 text-sm text-text-muted">
          Visible to administrators only. This will later
          display all bookings across staff members and allow
          bookings to be created on behalf of parents.
        </p>

        <div className="rounded-lg bg-off-white p-4 text-text-muted">
          School-wide booking table coming soon.
        </div>
  </div>*/}