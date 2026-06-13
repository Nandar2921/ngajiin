import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Pool } from 'pg';
import { authOptions } from '@/lib/auth.config';

// PASTIKAN PAKAI PORT 5433 (Docker pgvector)
const pool = new Pool({
  host: 'localhost',
  port: 5433,  // ← UBAH DARI 5433 KE 5433
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
      LIMIT 100
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

    // Validasi input
    if (!verseId || !source || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Cek apakah verseId ada di quran_verses
    const verseCheck = await pool.query(
      'SELECT id FROM quran_verses WHERE id = $1',
      [verseId]
    );

    if (verseCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Verse not found' }, { status: 404 });
    }

    const result = await pool.query(
      `INSERT INTO tafsir (verse_id, source, content) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (verse_id, source) DO UPDATE SET content = EXCLUDED.content
       RETURNING *`,
      [verseId, source, content]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating tafsir:', error);
    return NextResponse.json({ error: 'Failed to create tafsir' }, { status: 500 });
  }
}

// DELETE: Hapus tafsir
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    await pool.query('DELETE FROM tafsir WHERE id = $1', [id]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tafsir:', error);
    return NextResponse.json({ error: 'Failed to delete tafsir' }, { status: 500 });
  }
}