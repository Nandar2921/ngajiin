import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  user: 'postgres',
  password: 'sikaji29',
  database: 'sikaji',
});

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        b.id, 
        b.name, 
        b.name_indonesian, 
        COUNT(h.id) as total_hadith
      FROM hadith_books b
      LEFT JOIN hadiths h ON h.book_id = b.id
      GROUP BY b.id, b.name, b.name_indonesian
      ORDER BY b.id
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}