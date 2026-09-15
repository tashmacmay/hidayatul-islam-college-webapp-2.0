// lib/auth.js
import { verifyFirebaseToken } from './verifyToken';
import { getConnection } from './db';
import sql from 'mssql';

export async function verifyUser(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }
  const token = authHeader.split(' ')[1];

  try {
    // Decode and verify the token using jose
    const decoded = await verifyFirebaseToken(token);
    console.log('🔑 Decoded token payload:', JSON.stringify(decoded, null, 2));

    // Firebase tokens use 'uid', but sometimes 'sub' is used. Try both.
    const uid = decoded.uid || decoded.sub;
    if (!uid) {
      throw new Error('No UID found in token');
    }
    console.log('🔍 Looking up user with UID:', uid);

    // Fetch role from MS SQL
    const pool = await getConnection();
    const result = await pool.request()
      .input('uid', sql.NVarChar, uid)
      .query('SELECT role, is_admin FROM Users WHERE firebase_uid = @uid');

    if (result.recordset.length === 0) {
      console.error('❌ User not found for UID:', uid);
      // Log the first few users to compare
      const allUsers = await pool.request().query('SELECT firebase_uid FROM Users');
      console.log('📋 Existing UIDs in DB:', allUsers.recordset.map(r => r.firebase_uid));
      const error = new Error('User not found in database');
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    const { role, is_admin } = result.recordset[0];
    return {
      ...decoded,
      uid,
      role,
      isAdmin: Boolean(is_admin),
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    throw error; // rethrow to let the API handle it
  }
}

export async function requireAdmin(req) {
  const user = await verifyUser(req);
  if (user.role !== 'staff' || !user.isAdmin) {
    throw new Error('Admin access required');
  }
  return user;
}