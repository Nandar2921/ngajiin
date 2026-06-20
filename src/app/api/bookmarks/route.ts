import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { pool } from '@/lib/pg';
import { authOptions } from '@/lib/auth.config';

// GET: Ambil semua bookmark user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    const result = await pool.query(`
      SELECT 
        b.id,
        b.verse_id as "verseId",
        q.surah,
        q.ayah,
        q.arabic,
        q.translation,
        b.created_at as "createdAt"
      FROM bookmarks b
      JOIN quran_verses q ON q.id = b.verse_id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `, [userId]);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookmarks', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST: Tambah bookmark
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();
    const { verseId } = body;

    if (!verseId) {
      return NextResponse.json(
        { error: 'verseId is required' },
        { status: 400 }
      );
    }

    // Cek apakah sudah ada
    const existing = await pool.query(
      'SELECT id FROM bookmarks WHERE user_id = $1 AND verse_id = $2',
      [userId, verseId]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'Bookmark already exists' },
        { status: 400 }
      );
    }

    await pool.query(
      'INSERT INTO bookmarks (user_id, verse_id) VALUES ($1, $2)',
      [userId, verseId]
    );

    return NextResponse.json({ success: true, message: 'Bookmark added' });
  } catch (error) {
    console.error('Error creating bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to create bookmark', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE: Hapus bookmark
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();
    const { verseId } = body;

    if (!verseId) {
      return NextResponse.json(
        { error: 'verseId is required' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'DELETE FROM bookmarks WHERE user_id = $1 AND verse_id = $2 RETURNING id',
      [userId, verseId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Bookmark not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Bookmark deleted' });
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to delete bookmark', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Support OPTIONS (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}