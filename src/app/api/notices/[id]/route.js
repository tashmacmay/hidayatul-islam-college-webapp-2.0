// app/api/notices/[id]/route.js
import { NextResponse } from 'next/server';
import { getPostgresConnection } from '@/lib/db-postgres';
import { verifyUser } from '@/lib/auth';

export async function PUT(req, { params }) {
  try {
    const user = await verifyUser(req);
    const id = Number(params.id);
    if (!/^\d+$/.test(params.id) || !Number.isSafeInteger(id) || id < 1) {
      return NextResponse.json({ error: 'Invalid notice ID' }, { status: 400 });
    }

    const body = await req.json();
    const { title, category, content, recipients, status, scheduled_for } = body;

    console.log('🔧 Updating notice:', { id, title, category, content, recipients, status, scheduled_for });

    // Validate required fields
    if (!title || !category || !content || !recipients || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const pool = getPostgresConnection();
    const result = await pool.query(
      `
        UPDATE "dbo"."Notices"
        SET
          title = $1,
          category = $2,
          content = $3,
          recipients = $4,
          status = $5,
          scheduled_for = $6,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
      `,
      [
        title,
        category,
        content,
        recipients,
        status,
        scheduled_for ? new Date(scheduled_for) : null,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Notice not found' }, { status: 404 });
    }

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
    const id = Number(params.id);
    if (!/^\d+$/.test(params.id) || !Number.isSafeInteger(id) || id < 1) {
      return NextResponse.json({ error: 'Invalid notice ID' }, { status: 400 });
    }

    const pool = getPostgresConnection();
    const result = await pool.query(
      'DELETE FROM "dbo"."Notices" WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Notice not found' }, { status: 404 });
    }
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