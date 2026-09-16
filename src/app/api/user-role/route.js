import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { verifyUser } from '@/lib/auth';
import sql from 'mssql';

export async function GET(request) {
    try {
        const user = await verifyUser(request);
        const uid = user.uid;

        const pool = await getConnection();
        const result = await pool.request()
            .input('uid', sql.NVarChar, uid)
            .query('SELECT role, is_admin FROM Users WHERE firebase_uid = @uid');

        if (result.recordset.length === 0) {
            return NextResponse.json(
                { error: 'User not found in database' },
                { status: 404 }
            );
        }

        const { role, is_admin } = result.recordset[0];
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