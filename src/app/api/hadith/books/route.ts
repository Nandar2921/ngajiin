import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'sikaji29',
  database: 'sikaji',
});

export async function GET() {
  try {
    const result = await pool.query(`SELECT * FROM hadith_books ORDER BY id`);
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}