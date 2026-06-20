import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config'; // ✅ IMPORT
import { pool } from '@/lib/pg'; // ✅ PAKAI POOL TERPUSAT

export async function POST(request: Request) {
  // ✅ TAMBAHKAN AUTH CHECK
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { bookId, number, arabic, narrator, source, chapter } = body;

    // ✅ HAPUS translation, grade, reference - sudah dipindah ke tabel terpisah
    const result = await pool.query(
      `INSERT INTO hadiths (book_id, number, chapter, arabic, narrator, source) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [bookId, number, chapter || null, arabic, narrator, source]
    );

    // Jika ada translation, simpan ke hadith_translations
    if (body.translation) {
      await pool.query(
        `INSERT INTO hadith_translations (hadith_id, language, translator, text, source)
         VALUES ($1, 'id', $2, $3, $4)`,
        [result.rows[0].id, body.translator || 'Unknown', body.translation, body.translationSource || null]
      );
    }

    // Jika ada grading, simpan ke hadith_gradings
    if (body.grade) {
      await pool.query(
        `INSERT INTO hadith_gradings (hadith_id, scholar, grade, reference)
         VALUES ($1, $2, $3, $4)`,
        [result.rows[0].id, body.scholar || 'Unknown', body.grade, body.reference || null]
      );
    }

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating hadith:', error);
    return NextResponse.json({ error: 'Failed to create hadith' }, { status: 500 });
  }
}