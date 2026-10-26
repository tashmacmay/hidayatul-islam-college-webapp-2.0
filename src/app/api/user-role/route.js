import { NextResponse } from 'next/server';
import { getPostgresConnection } from '@/lib/db-postgres';
import { verifyUser } from '@/lib/auth';

export async function GET(request) {
    try {
        const user = await verifyUser(request);
        const uid = user.uid;

        const pool = getPostgresConnection();
        const result = await pool.query(
            'SELECT role, is_admin FROM "dbo"."Users" WHERE firebase_uid = $1',
            [uid]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'User not found in database' },
                { status: 404 }
            );
        }

        const { role, is_admin } = result.rows[0];
        return NextResponse.json({
            role,
            is_admin: Boolean(is_admin)
        });
    } catch (error) {
        console.error('DB error:', error);
        if (error.message === 'User not found in database' ||
            error.message === 'Invalid token' ||
            error.message === 'Missing or invalid Authorization header') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}