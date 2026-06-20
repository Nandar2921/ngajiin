import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config'; // ✅ IMPORT authOptions
import { pool } from '@/lib/pg'; // ✅ PAKAI POOL TERPUSAT

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  // ✅ FIX: tambahkan authOptions
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
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
    console.error('Error updating tafsir:', error);
    return NextResponse.json({ error: 'Failed to update tafsir' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // ✅ FIX: tambahkan authOptions
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await pool.query(`DELETE FROM tafsir WHERE id = $1`, [params.id]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tafsir:', error);
    return NextResponse.json({ error: 'Failed to delete tafsir' }, { status: 500 });
  }
}