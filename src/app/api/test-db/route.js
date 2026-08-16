import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET() {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT GETDATE() AS now');
        return NextResponse.json({ success: true, time: result.recordset[0].now });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}