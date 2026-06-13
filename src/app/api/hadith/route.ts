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
  const limit = parseInt(searchParams.get('limit') || '100');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    const result = await pool.query(`
      SELECT 
        h.id, h.number, h.arabic, h.translation, 
        h.narrator, h.grade, h.reference,
        b.id as book_id, b.name as book_name
      FROM hadiths h
      JOIN hadith_books b ON h.book_id = b.id
      ORDER BY h.book_id, h.number
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching hadith:', error);
    return NextResponse.json({ error: 'Failed to fetch hadith' }, { status: 500 });
  }
}