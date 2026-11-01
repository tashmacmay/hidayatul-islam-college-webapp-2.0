import pg from 'pg';

const { Pool } = pg;

let pool;

export function getPostgresConnection() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured');
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
      // Neon sometimes rejects the strict certificate in Node.js. 
      // Setting this to false prevents the ECONNRESET error.
      ssl: { rejectUnauthorized: false }, 
    });

    pool.on('error', (error) => {
      console.error('Unexpected PostgreSQL pool error:', error.message);
    });
  }

  return pool;
}