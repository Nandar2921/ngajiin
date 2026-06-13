import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  user: 'postgres',
  password: 'sikaji29',
  database: 'sikaji',
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const source = searchParams.get('source') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT 
        t.id, 
        t.source,
        t.content,
        q.surah, 
        q.ayah, 
        q.arabic, 
        q.translation
      FROM tafsir t
      JOIN quran_verses q ON q.id = t.verse_id
      WHERE 1=1
    `;
    let countQuery = `
      SELECT COUNT(*) 
      FROM tafsir t
      JOIN quran_verses q ON q.id = t.verse_id
      WHERE 1=1
    `;
    const queryParams: (string | number)[] = [];

    if (search) {
      query += ` AND (t.content ILIKE $${queryParams.length + 1} OR q.translation ILIKE $${queryParams.length + 1})`;
      countQuery += ` AND (t.content ILIKE $${queryParams.length + 1} OR q.translation ILIKE $${queryParams.length + 1})`;
      queryParams.push(`%${search}%`);
    }

    if (source) {
      query += ` AND t.source = $${queryParams.length + 1}`;
      countQuery += ` AND t.source = $${queryParams.length + 1}`;
      queryParams.push(source);
    }

    query += ` ORDER BY q.surah, q.ayah LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    
    const result = await pool.query(query, [...queryParams, limit, offset]);
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching tafsir:', error);
    return NextResponse.json({ error: 'Failed to fetch tafsir' }, { status: 500 });
  }
}