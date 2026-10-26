
import { getPostgresConnection } from '@/lib/db-postgres';

export async function GET() {
  try {
    const pool = getPostgresConnection();

    await pool.query('SELECT 1');

    return Response.json({
      status: 'healthy',
      database: 'postgres',
    });
  } catch (error) {
    console.error('PostgreSQL health check failed:', error.message);

    return Response.json(
      {
        status: 'unhealthy',
        database: 'postgres',
        error: 'Database connection failed',
      },
      { status: 500 }
    );
  }
}
