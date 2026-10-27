import { NextResponse } from 'next/server';
import { authAdmin } from '@/lib/firebase-admin';

export async function GET() {
  try {
    // Just check if authAdmin is defined
    if (!authAdmin) throw new Error('authAdmin is undefined');
    // Optional: verify a dummy token to ensure it works
    return NextResponse.json({ success: true, message: 'Admin SDK is ready' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}