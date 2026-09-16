// app/api/notices/route.js
import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { verifyUser } from '@/lib/auth';
import sql from 'mssql';

export async function GET(req) {
  console.log('🔍 GET /api/notices called');
  try {
    const user = await verifyUser(req);
    console.log('✅ User verified:', { uid: user.uid, role: user.role });

    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    console.log('🔍 Filters:', { status, search });

    const pool = await getConnection();
    let query = `
      SELECT id, title, category, content, recipients, status, scheduled_for, created_at 
      FROM Notices 
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'All') {
      query += ' AND status = @status';
      params.push({ name: 'status', type: sql.NVarChar, value: status });
    }
    if (search) {
      query += ' AND (title LIKE @search OR content LIKE @search)';
      params.push({ name: 'search', type: sql.NVarChar, value: `%${search}%` });
    }
    query += ' ORDER BY created_at DESC';

    const request = pool.request();
    params.forEach(p => request.input(p.name, p.type, p.value));
    const result = await request.query(query);
    console.log(`✅ Found ${result.recordset.length} notices`);

    return NextResponse.json(result.recordset);
  } catch (err) {
    console.error('❌ GET /api/notices error:', err);
    if (err.message === 'User not found in database' || 
        err.message === 'Invalid token' || 
        err.message === 'Missing or invalid Authorization header') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req) {
  console.log('🔍 POST /api/notices called');
  try {
    const user = await verifyUser(req);
    console.log('✅ User verified:', { uid: user.uid, role: user.role });

    // Only staff/admins can create
    if (user.role !== 'staff' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const body = await req.json();
    console.log('🔍 Request body:', body);
    const { title, category, content, recipients, status, scheduled_for } = body;

    // Validate required fields
    if (!title || !category || !content || !recipients || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input('title', sql.NVarChar, title)
      .input('category', sql.NVarChar, category)
      .input('content', sql.NVarChar, content)
      .input('recipients', sql.NVarChar, recipients)
      .input('status', sql.NVarChar, status)
      .input('scheduled_for', sql.DateTime, scheduled_for ? new Date(scheduled_for) : null)
      .input('created_by_uid', sql.NVarChar, user.uid)
      .query(`
        INSERT INTO Notices (title, category, content, recipients, status, scheduled_for, created_by_uid)
        VALUES (@title, @category, @content, @recipients, @status, @scheduled_for, @created_by_uid);
        SELECT SCOPE_IDENTITY() AS id
      `);

    const newId = result.recordset[0].id;
    console.log(`✅ Notice created with ID: ${newId}`);
    return NextResponse.json({ id: newId }, { status: 201 });
  } catch (err) {
    console.error('❌ POST /api/notices error:', err);
    // Return a detailed error message to help debug
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}