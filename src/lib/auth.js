// lib/auth.js
import { verifyFirebaseToken } from './verifyToken';
import { getConnection } from './db';
import sql from 'mssql';

export async function verifyUser(req) {
  // ---- Step 1: Header presence ----
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('❌ verifyUser: Authorization header missing or malformed');
    const err = new Error('Missing or invalid Authorization header');
    err.code = 'MISSING_AUTH_HEADER';
    throw err;
  }

  const token = authHeader.slice('Bearer '.length).trim();

  if (!token) {
    console.error('❌ verifyUser: Bearer token is empty');
    const err = new Error('Authorization token is missing');
    err.code = 'EMPTY_TOKEN';
    throw err;
  }

  // ---- Step 2: Firebase token verification ----
  let decoded;
  try {
    decoded = await verifyFirebaseToken(token);
    console.log('🔑 Decoded token payload:', JSON.stringify(decoded, null, 2));
  } catch (error) {
    console.error('❌ verifyUser: Firebase token verification failed:', error.message);
    const err = new Error('Invalid or expired authentication token');
    err.code = 'INVALID_TOKEN';
    throw err;
  }

  const uid = decoded.uid || decoded.sub;
  if (!uid) {
    console.error('❌ verifyUser: No UID in decoded token');
    const err = new Error('Firebase token is missing a UID');
    err.code = 'NO_UID_IN_TOKEN';
    throw err;
  }

  // ---- Step 3: Look up user in SQL ----
  let result;
  try {
    const pool = await getConnection();
    result = await pool.request()
      .input('uid', sql.NVarChar, uid)
      .query(`
        SELECT id, role, is_admin
        FROM Users
        WHERE firebase_uid = @uid
      `);
  } catch (error) {
    console.error('❌ verifyUser: SQL lookup failed:', error.message);
    const err = new Error('Database lookup failed');
    err.code = 'DB_LOOKUP_FAILED';
    err.cause = error;
    throw err;
  }

  if (result.recordset.length === 0) {
    console.error('❌ verifyUser: No user found for firebase_uid:', uid);
    const err = new Error('User not found in database');
    err.code = 'USER_NOT_FOUND';
    throw err;
  }

  const { id, role, is_admin } = result.recordset[0];
  console.log('✅ verifyUser: user resolved', { uid, id, role, isAdmin: Boolean(is_admin) });

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