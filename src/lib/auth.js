
// src/lib/auth.js
import { verifyFirebaseToken } from './verifyToken';
import { getPostgresConnection } from './db-postgres';

export async function verifyUser(req) {
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('Missing or invalid Authorization header');
    err.code = 'MISSING_AUTH_HEADER';
    throw err;
  }

  const token = authHeader.slice('Bearer '.length).trim();

  if (!token) {
    const err = new Error('Authorization token is missing');
    err.code = 'EMPTY_TOKEN';
    throw err;
  }

  let decoded;
  try {
    decoded = await verifyFirebaseToken(token);
  } catch (error) {
    console.error('Firebase token verification failed:', error.message);
    const err = new Error('Invalid or expired authentication token');
    err.code = 'INVALID_TOKEN';
    throw err;
  }

  const uid = decoded.uid || decoded.sub;

  if (!uid) {
    const err = new Error('Firebase token is missing a UID');
    err.code = 'NO_UID_IN_TOKEN';
    throw err;
  }

  let result;
  try {
    const pool = getPostgresConnection();
    result = await pool.query(
      `SELECT id, role, is_admin
       FROM "dbo"."Users"
       WHERE firebase_uid = $1`,
      [uid]
    );
  } catch (error) {
    console.error('PostgreSQL user lookup failed:', error.message);
    const err = new Error('Database lookup failed');
    err.code = 'DB_LOOKUP_FAILED';
    err.cause = error;
    throw err;
  }

  if (result.rows.length === 0) {
    const err = new Error('User not found in database');
    err.code = 'USER_NOT_FOUND';
    throw err;
  }

  const { id, role, is_admin } = result.rows[0];

  return {
    ...decoded,
    uid,
    id,
    role,
    isAdmin: Boolean(is_admin),
  };
}

export async function requireAdmin(req) {
  const user = await verifyUser(req);

  if (user.role !== 'staff' || !user.isAdmin) {
    const err = new Error('Admin access required');
    err.code = 'NOT_ADMIN';
    throw err;
  }

  return user;
}
