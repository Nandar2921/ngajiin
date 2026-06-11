import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'sikaji29',
  database: 'sikaji',
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookId, number, arabic, translation, narrator, grade, reference } = body;

    const result = await pool.query(
      `INSERT INTO hadiths (book_id, number, arabic, translation, narrator, grade, reference) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [bookId, number, arabic, translation, narrator, grade, reference]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create hadith' }, { status: 500 });
  }
}