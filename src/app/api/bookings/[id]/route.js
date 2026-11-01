
import { NextResponse } from 'next/server';
import { requireParent } from '@/lib/auth';

import {
  initializeGraphForAppOnlyAuth,
  getAppointmentAsync,
  cancelBookingAsync,
} from '@/lib/graph/graphHelper';

export const runtime = 'nodejs';

export async function DELETE(request, { params }) {
  try {
    // Only an authorised parent can cancel a parent booking.
    const user = await requireParent(request);

    const email = (user.email || '').toLowerCase().trim();

    if (!email) {
      return NextResponse.json(
        { error: 'Your account does not have an email address.' },
        { status: 400 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing booking ID.' },
        { status: 400 }
      );
    }

    initializeGraphForAppOnlyAuth();

    const appointment = await getAppointmentAsync(id);

    const bookerEmail = (
      appointment.customerEmailAddress || ''
    ).toLowerCase().trim();

    // Retain the booking ownership check.
    if (!bookerEmail || bookerEmail !== email) {
      return NextResponse.json(
        { error: 'You are not the owner of this booking.' },
        { status: 403 }
      );
    }

    await cancelBookingAsync(id);

    return NextResponse.json({
      success: true,
      id,
    });

  } catch (error) {
    console.error(
      'DELETE /api/bookings/[id] error:',
      error
    );

    const status = Number(error.statusCode) || 500;

    return NextResponse.json(
      {
        error:
          status === 401 || status === 403
            ? error.message
            : 'Failed to cancel booking.',
      },
      { status }
    );
  }
}
