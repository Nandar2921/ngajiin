import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Pool } from 'pg';
import { authOptions } from '@/lib/auth.config';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'sikaji29',
  database: 'sikaji',
});

// GET: Ambil semua tafsir
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await pool.query(`
      SELECT t.*, q.surah, q.ayah, q.translation
      FROM tafsir t
      JOIN quran_verses q ON t.verse_id = q.id
      ORDER BY q.surah, q.ayah
    `);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching tafsir:', error);
    return NextResponse.json({ error: 'Failed to fetch tafsir' }, { status: 500 });
  }
}

// POST: Tambah tafsir baru
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { verseId, source, content } = body;

    const result = await pool.query(
      `INSERT INTO tafsir (verse_id, source, content) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [verseId, source, content]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating tafsir:', error);
    return NextResponse.json({ error: 'Failed to create tafsir' }, { status: 500 });
  }
}