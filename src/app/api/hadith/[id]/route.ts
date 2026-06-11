import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'sikaji29',
  database: 'sikaji',
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await pool.query(`
      SELECT h.*, b.name_indonesian as book_name 
      FROM hadiths h
      JOIN hadith_books b ON h.book_id = b.id
      WHERE h.id = $1
    `, [params.id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Hadith not found' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch hadith' }, { status: 500 });
  }
}