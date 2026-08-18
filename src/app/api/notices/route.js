// app/api/notices/route.js
import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { verifyUser } from '@/lib/auth';
import sql from 'mssql';

// GET /api/notices?status=Published&search=...
export async function GET(req) {
  console.log('🔍 GET /api/notices called');
  try {
    console.log('🔍 Verifying user...');
    const user = await verifyUser(req);
    console.log('✅ User verified:', { uid: user.uid, role: user.role, isAdmin: user.isAdmin });

    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    console.log('🔍 Filters:', { status, search });

    const pool = await getConnection();
    console.log('✅ Database connected');

    // Build base query
    let query = `
      SELECT id, title, category, recipients, status, scheduled_for, created_at 
      FROM Notices 
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'All') {
      query += ' AND status = @status';
      params.push({ name: 'status', type: sql.NVarChar, value: status });
    }
    if (search) {
      // Try to search in both title and content – but content might not exist, so we'll check
      // We'll use a safe approach: only add content search if column exists (we'll check later)
      // For now, we'll use a try-catch around the query or use a subquery.
      // Since we don't know column existence, we can first attempt a simple query without content.
      // But to be safe, we'll include content search and catch error if column missing.
      // Alternatively, we can query the table schema first.
      // I'll add a simple approach: try to query with content, and if it fails, fallback to title only.
      // For now, let's include both and assume content exists.
      query += ' AND (title LIKE @search OR content LIKE @search)';
      params.push({ name: 'search', type: sql.NVarChar, value: `%${search}%` });
    }
    query += ' ORDER BY created_at DESC';

    console.log('🔍 SQL Query:', query);
    console.log('🔍 Parameters:', params);

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
    // Check if error is about missing column 'content'
    if (err.message && err.message.includes('Invalid column name')) {
      // Retry without content search
      try {
        console.log('🔄 Retrying without content search...');
        const url = new URL(req.url);
        const status = url.searchParams.get('status');
        const search = url.searchParams.get('search');
        const pool = await getConnection();
        let query = `
          SELECT id, title, category, recipients, status, scheduled_for, created_at 
          FROM Notices 
          WHERE 1=1
        `;
        const params = [];
        if (status && status !== 'All') {
          query += ' AND status = @status';
          params.push({ name: 'status', type: sql.NVarChar, value: status });
        }
        if (search) {
          query += ' AND title LIKE @search';
          params.push({ name: 'search', type: sql.NVarChar, value: `%${search}%` });
        }
        query += ' ORDER BY created_at DESC';
        const request = pool.request();
        params.forEach(p => request.input(p.name, p.type, p.value));
        const result = await request.query(query);
        console.log(`✅ Found ${result.recordset.length} notices (without content search)`);
        return NextResponse.json(result.recordset);
      } catch (retryErr) {
        console.error('❌ Retry also failed:', retryErr);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/notices – create a new notice
export async function POST(req) {
  console.log('🔍 POST /api/notices called');
  try {
    console.log('🔍 Verifying user...');
    const user = await verifyUser(req);
    console.log('✅ User verified:', { uid: user.uid, role: user.role });

    // Only staff/admins can create notices – check role
    if (user.role !== 'staff' && user.role !== 'admin') {
      console.warn('⛔ User not authorized to create notices:', user.role);
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const body = await req.json();
    console.log('🔍 Request body:', body);
    const { title, category, content, recipients, status, scheduled_for } = body;

    if (!title || !category || !content || !recipients || !status) {
      console.warn('⛔ Missing required fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const pool = await getConnection();
    console.log('✅ Database connected');

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
    if (err.message === 'User not found in database' || 
        err.message === 'Invalid token' || 
        err.message === 'Missing or invalid Authorization header') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}