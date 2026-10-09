import { NextResponse } from "next/server";
import { fetchRecentBookingsFromGraph } from "@/lib/reporting/bookingsSync";

export async function GET() {
  try {
    const rows = await fetchRecentBookingsFromGraph();

    return NextResponse.json({
      count: rows.length,
      sample: rows.slice(0, 5),
    });
  } catch (error) {
    console.error("DEV PREVIEW ERROR:", error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}