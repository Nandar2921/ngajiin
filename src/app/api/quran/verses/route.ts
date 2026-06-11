import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'sikaji29',
  database: 'sikaji',
});

// GET: Ambil daftar ayat untuk dropdown
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '100');
  
  try {
    const result = await pool.query(`
      SELECT id, surah, ayah, translation 
      FROM quran_verses 
      ORDER BY surah, ayah 
      LIMIT $1
    `, [limit]);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch verses' }, { status: 500 });
  }
}