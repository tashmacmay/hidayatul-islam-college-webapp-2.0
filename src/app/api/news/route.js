// app/api/news/route.js
import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET() {
  console.log('🔍 GET /api/news called');

  try {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT
        id,
        title,
        slug,
        category,
        excerpt,
        content,
        featured_image_url,
        published_at,
        created_at,
        updated_at
      FROM NewsAnnouncements
      WHERE published = 1
        AND (image_contains_learners = 0 OR consent_confirmed = 1)
      ORDER BY published_at DESC
    `);

    console.log(`✅ Found ${result.recordset.length} news items`);
    return NextResponse.json({ news: result.recordset });
  } catch (err) {
    console.error('❌ NEWS GET ERROR:', err);

    const status = err.statusCode || 500;
    return NextResponse.json(
      {
        error: 'Failed to load news',
        statusCode: status,
        code: err.code,
        message: err.message,
      },
      { status }
    );
  }
}