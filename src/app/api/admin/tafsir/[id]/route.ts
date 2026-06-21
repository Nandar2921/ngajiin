import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { pool } from '@/lib/pg';
import { authOptions } from '@/lib/auth.config';

// [FIX] Sebelumnya getServerSession() dipanggil TANPA authOptions — beda
// dari pola di semua route admin lain. Di App Router, next-auth v4 butuh
// authOptions secara eksplisit untuk bisa membaca session dengan benar;
// tanpa itu session kemungkinan besar selalu null, artinya admin yang
// sudah login pun akan selalu kena 401 saat edit/hapus tafsir. Juga diganti
// dari koneksi `new Pool()` sendiri ke pool terpusat @/lib/pg.

// PUT: Update tafsir
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { verseId, source, content } = body;

    const result = await pool.query(
      `UPDATE tafsir 
       SET verse_id = $1, source = $2, content = $3
       WHERE id = $4
       RETURNING *`,
      [verseId, source, content, params.id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Tafsir not found' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update tafsir' }, { status: 500 });
  }
}

// DELETE: Hapus tafsir
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await pool.query(`DELETE FROM tafsir WHERE id = $1`, [params.id]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete tafsir' }, { status: 500 });
  }
}