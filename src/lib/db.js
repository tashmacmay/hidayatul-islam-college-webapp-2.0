// lib/db.js
import sql from 'mssql';

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: '127.0.0.1', // or '127.0.0.1''localhost'
    port: 62729, // your dynamic port
    database: process.env.DB_NAME,
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
};

let pool = null;

export async function getConnection() {
    try {
        if (!pool) {
            pool = await sql.connect(config);
            console.log('✅ Connected to SQL Server');
        }
        return pool;
    } catch (error) {
        console.error('❌ Database connection error:', error);
        throw error;
    }
}

export async function closeConnection() {
    if (pool) {
        await pool.close();
        pool = null;
    }
}
