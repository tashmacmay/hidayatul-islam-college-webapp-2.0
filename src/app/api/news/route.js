import { NextResponse } from 'next/server';
import { getPostgresConnection } from '@/lib/db-postgres';

export async function GET() {
  console.log('🔍 GET /api/news called');

  try {
    const pool = getPostgresConnection();

    const result = await pool.query(`
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
      FROM "dbo"."NewsAnnouncements"
      WHERE published = TRUE
        AND (
          image_contains_learners = FALSE
          OR consent_confirmed = TRUE
        )
      ORDER BY published_at DESC
    `);

    console.log(`✅ Found ${result.rows.length} news items`);
    return NextResponse.json({ news: result.rows });
  } catch (err) {
    console.error('❌ NEWS GET ERROR:', err.message);

    return NextResponse.json(
      {
        error: 'Failed to load news',
        message: 'Unable to retrieve news at this time.',
      },
      { status: 500 }
    );
  }
}
