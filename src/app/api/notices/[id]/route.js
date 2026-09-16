// app/api/notices/[id]/route.js
import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { verifyUser } from '@/lib/auth';
import sql from 'mssql';

export async function PUT(req, { params }) {
  try {
    const user = await verifyUser(req);
    const id = params.id;
    const body = await req.json();
    const { title, category, content, recipients, status, scheduled_for } = body;

    console.log('🔧 Updating notice:', { id, title, category, content, recipients, status, scheduled_for });

    // Validate required fields
    if (!title || !category || !content || !recipients || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const pool = await getConnection();
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

    console.log('✅ Notice updated:', id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ PUT error:', err);
    if (err.message === 'User not found in database' || err.message === 'Invalid token' || err.message === 'Missing or invalid Authorization header') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = await verifyUser(req);
    const id = params.id;
    const pool = await getConnection();
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Notices WHERE id = @id');
    console.log('🗑️ Notice deleted:', id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ DELETE error:', err);
    if (err.message === 'User not found in database' || err.message === 'Invalid token' || err.message === 'Missing or invalid Authorization header') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}