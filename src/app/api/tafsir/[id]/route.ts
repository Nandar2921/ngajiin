import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
});
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await pool.query(
      `SELECT 
        t.id, 
        t.content, 
        t.source,
        q.surah, 
        q.ayah,
        q.arabic,
        q.translation
      FROM tafsir t
      JOIN quran_verses q ON q.id = t.verse_id
      WHERE t.id = $1`,
      [params.id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Tafsir tidak ditemukan' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data tafsir' },
      { status: 500 }
    );
  }
}