import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { pool } from '@/lib/pg';
import { authOptions } from '@/lib/auth.config';

// [FIX] Sebelumnya file ini cuma punya DELETE — padahal halaman admin
// (src/app/admin/hadith/page.tsx) memanggil PUT saat "Edit Hadits" disubmit.
// Akibatnya fitur edit hadits selalu gagal (405 Method Not Allowed).
// PUT ditambahkan di bawah, mengikuti pola tabel ternormalisasi yang sama
// dengan POST /api/admin/hadith.
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = await pool.connect();
  try {
    const id = params.id;
    const body = await request.json();
    const { bookId, number, arabic, translation, narrator, grade, reference } = body;

    if (!bookId || !number || !arabic) {
      return NextResponse.json({ error: 'Kitab, nomor, dan teks Arab wajib diisi' }, { status: 400 });
    }

    await client.query('BEGIN');

    const hadithResult = await client.query(
      `UPDATE hadiths SET book_id = $1, number = $2, arabic = $3, narrator = $4
       WHERE id = $5 RETURNING *`,
      [bookId, number, arabic, narrator || null, id]
    );

    if (hadithResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Hadith not found' }, { status: 404 });
    }

    // Upsert terjemahan bahasa Indonesia (update kalau sudah ada, insert kalau belum)
    const existingTranslation = await client.query(
      `SELECT id FROM hadith_translations WHERE hadith_id = $1 AND language = 'id' LIMIT 1`,
      [id]
    );
    if (existingTranslation.rows.length > 0) {
      await client.query(`UPDATE hadith_translations SET text = $1 WHERE id = $2`, [
        translation || '',
        existingTranslation.rows[0].id,
      ]);
    } else if (translation) {
      await client.query(
        `INSERT INTO hadith_translations (hadith_id, language, text) VALUES ($1, 'id', $2)`,
        [id, translation]
      );
    }

    // Upsert grading
    const existingGrading = await client.query(
      `SELECT id FROM hadith_gradings WHERE hadith_id = $1 LIMIT 1`,
      [id]
    );
    if (existingGrading.rows.length > 0) {
      await client.query(`UPDATE hadith_gradings SET grade = $1, reference = $2 WHERE id = $3`, [
        grade || '',
        reference || null,
        existingGrading.rows[0].id,
      ]);
    } else if (grade) {
      await client.query(
        `INSERT INTO hadith_gradings (hadith_id, scholar, grade, reference) VALUES ($1, 'Admin', $2, $3)`,
        [id, grade, reference || null]
      );
    }

    await client.query('COMMIT');

    return NextResponse.json({ ...hadithResult.rows[0], translation, grade, reference });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating hadith:', error);
    return NextResponse.json({ error: 'Failed to update hadith' }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // [SECURITY FIX] Sebelumnya tidak ada pengecekan auth — siapapun bisa
  // menghapus hadits lewat endpoint ini. Sekarang wajib admin.
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // hadith_translations & hadith_gradings punya ON DELETE CASCADE ke hadiths,
    // jadi tidak perlu hapus manual.
    await pool.query(`DELETE FROM hadiths WHERE id = $1`, [params.id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting hadith:', error);
    return NextResponse.json({ error: 'Failed to delete hadith' }, { status: 500 });
  }
}
