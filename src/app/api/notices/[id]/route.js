// app/api/notices/[id]/route.js
import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { verifyUser } from '@/lib/auth';
import sql from 'mssql';

export async function PUT(req, { params }) {
  console.log('🔍 PUT /api/notices/[id] called with id:', params.id);
  try {
    const user = await verifyUser(req);
    const id = params.id;
    const body = await req.json();
    console.log('🔍 Request body for update:', body);
    const { title, category, content, recipients, status, scheduled_for } = body;

    // Check if notice exists and user has permission
    const pool = await getConnection();
    const check = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT created_by_uid FROM Notices WHERE id = @id');
    if (check.recordset.length === 0) {
      return NextResponse.json({ error: 'Notice not found' }, { status: 404 });
    }
    const notice = check.recordset[0];
    if (user.uid !== notice.created_by_uid && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await pool.request()
      .input('id', sql.Int, id)
      .input('title', sql.NVarChar, title)
      .input('category', sql.NVarChar, category)
      .input('content', sql.NVarChar, content)
      .input('recipients', sql.NVarChar, recipients)
      .input('status', sql.NVarChar, status)
      .input('scheduled_for', sql.DateTime, scheduled_for ? new Date(scheduled_for) : null)
      .query(`
        UPDATE Notices
        SET title=@title, category=@category, content=@content, recipients=@recipients,
            status=@status, scheduled_for=@scheduled_for, updated_at=GETDATE()
        WHERE id=@id
      `);
    console.log('✅ Notice updated successfully');
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ PUT /api/notices/[id] error:', err);
    if (err.message === 'User not found in database' || 
        err.message === 'Invalid token' || 
        err.message === 'Missing or invalid Authorization header') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  console.log('🔍 DELETE /api/notices/[id] called with id:', params.id);
  try {
    const user = await verifyUser(req);
    const id = params.id;
    const pool = await getConnection();
    // Check permission
    const check = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT created_by_uid FROM Notices WHERE id = @id');
    if (check.recordset.length === 0) {
      return NextResponse.json({ error: 'Notice not found' }, { status: 404 });
    }
    const notice = check.recordset[0];
    if (user.uid !== notice.created_by_uid && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Notices WHERE id = @id');
    console.log('✅ Notice deleted successfully');
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ DELETE /api/notices/[id] error:', err);
    if (err.message === 'User not found in database' || 
        err.message === 'Invalid token' || 
        err.message === 'Missing or invalid Authorization header') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}