import { NextResponse } from 'next/server';
import { requireParent } from '@/lib/auth';

import {
  initializeGraphForAppOnlyAuth,
  getBookingsAsync,
  getStaffMemberLookupAsync,
  formatParentBooking,
} from '@/lib/graph/graphHelper';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // ADDED: Prevents API caching

export async function GET(request) {
  try {
    // A valid Firebase token is not sufficient.
    // The database role must be parent.
    const user = await requireParent(request);

    const email = (user.email || '').toLowerCase().trim();

    if (!email) {
      return NextResponse.json(
        { error: 'Your account does not have an email address.' },
        { status: 400 }
      );
    }

    initializeGraphForAppOnlyAuth();

    const [response, staffLookup] = await Promise.all([
      getBookingsAsync(),

      getStaffMemberLookupAsync().catch((error) => {
        console.error('Staff lookup fetch failed:', error);
        return null;
      }),
    ]);

    const mine = (response.value || []).filter((booking) => {
      const bookerEmail = (
        booking.customerEmailAddress ||
        booking.customers?.[0]?.emailAddress ||
        ''
      ).toLowerCase().trim();

      return bookerEmail === email;
    });

    const bookings = mine.map((booking) =>
      formatParentBooking(booking, staffLookup)
    );

    return NextResponse.json(bookings);

  } catch (error) {
    console.error('GET /api/bookings error:', error);

    const status = Number(error.statusCode) || 500;

    return NextResponse.json(
      {
        error:
          status === 401 || status === 403
            ? error.message
            : 'Failed to retrieve Microsoft Bookings.',
      },
      { status }
    );
  }
}