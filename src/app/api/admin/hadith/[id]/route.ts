import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'sikaji29',
  database: 'sikaji',
});

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await pool.query(`DELETE FROM hadiths WHERE id = $1`, [params.id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete hadith' }, { status: 500 });
  }
}