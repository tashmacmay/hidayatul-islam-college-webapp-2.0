// app/api/health/db/route.js

import { getConnection } from '@/lib/db';

export async function GET() {
    try {
        const pool = await getConnection();

        await pool.request().query('SELECT 1');

        return Response.json({
            status: 'healthy',
        });
    } catch (error) {
        return Response.json(
            {
                status: 'unhealthy',
                error: error.message,
            },
            { status: 500 }
        );
    }
}