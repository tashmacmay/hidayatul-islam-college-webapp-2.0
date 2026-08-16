import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import sql from 'mssql';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    if (!uid) {
        return NextResponse.json(
            { error: 'Missing uid parameter' },
            { status: 400 }
        );
    }

    try {
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
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}