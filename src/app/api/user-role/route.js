
import { NextResponse } from 'next/server';
import { verifyUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // verifyUser validates Firebase and retrieves the
    // current role from Neon PostgreSQL.
    const user = await verifyUser(request);

    return NextResponse.json({
      role: user.role,
      is_admin: user.isAdmin,
    });

  } catch (error) {
    console.error('GET /api/user-role error:', {
      code: error?.code,
      message: error?.message,
    });

    const status = Number(error.statusCode) || 500;

    return NextResponse.json(
      {
        error:
          status === 401
            ? 'Unauthorized.'
            : status === 403
              ? 'Your account does not have an assigned role.'
              : 'Unable to retrieve your account role.',
      },
      { status }
    );
  }
}
