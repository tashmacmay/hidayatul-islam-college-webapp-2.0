
import { NextResponse } from 'next/server';
import { getPostgresConnection } from '@/lib/db-postgres';
import { requireStaff } from '@/lib/auth';

function validateNoticeId(rawId) {
  if (!/^\d+$/.test(String(rawId || ''))) {
    return null;
  }

  const id = Number(rawId);

  return Number.isSafeInteger(id) && id > 0
    ? id
    : null;
}

export async function PUT(req, { params }) {
  try {
    await requireStaff(req);

    const id = validateNoticeId(params.id);

    if (!id) {
      return NextResponse.json(
        { error: 'Invalid notice ID.' },
        { status: 400 }
      );
    }

    const body = await req.json();

    const {
      title,
      category,
      content,
      recipients,
      status,
      scheduled_for,
    } = body;

    if (
      !title?.trim?.() ||
      !category?.trim?.() ||
      !content?.trim?.() ||
      !recipients?.trim?.() ||
      !status?.trim?.()
    ) {
      return NextResponse.json(
        { error: 'Missing required fields.' },
        { status: 400 }
      );
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
        RETURNING id
      `,
      [
        title.trim(),
        category.trim(),
        content.trim(),
        recipients.trim(),
        status.trim(),
        scheduled_for ? new Date(scheduled_for) : null,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Notice not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('PUT /api/notices/[id] error:', error);

    const status = Number(error.statusCode) || 500;

    return NextResponse.json(
      {
        error:
          status === 401 || status === 403
            ? error.message
            : 'Failed to update notice.',
      },
      { status }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await requireStaff(req);

    const id = validateNoticeId(params.id);

    if (!id) {
      return NextResponse.json(
        { error: 'Invalid notice ID.' },
        { status: 400 }
      );
    }

    const pool = getPostgresConnection();

    const result = await pool.query(
      `
        DELETE FROM "dbo"."Notices"
        WHERE id = $1
        RETURNING id
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Notice not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('DELETE /api/notices/[id] error:', error);

    const status = Number(error.statusCode) || 500;

    return NextResponse.json(
      {
        error:
          status === 401 || status === 403
            ? error.message
            : 'Failed to delete notice.',
      },
      { status }
    );
  }
}
