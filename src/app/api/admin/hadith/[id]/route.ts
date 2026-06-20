import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { pool } from '@/lib/pg';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // ✅ TAMBAHKAN AUTH CHECK
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // ✅ Hapus juga dari tabel terkait (CASCADE akan otomatis)
    const result = await pool.query(
      `DELETE FROM hadiths WHERE id = $1 RETURNING *`,
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Hadith not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting hadith:', error);
    return NextResponse.json({ error: 'Failed to delete hadith' }, { status: 500 });
  }
}