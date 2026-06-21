import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { pool } from '@/lib/pg';
import { authOptions } from '@/lib/auth.config';

export async function POST(request: Request) {
  // [SECURITY FIX] Endpoint ini sebelumnya tidak ada pengecekan auth sama
  // sekali — siapapun bisa menambah data hadits tanpa login. Sekarang wajib admin.
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = await pool.connect();
  try {
    const body = await request.json();
    const { bookId, number, arabic, translation, narrator, grade, reference } = body;

    if (!bookId || !number || !arabic) {
      return NextResponse.json({ error: 'Kitab, nomor, dan teks Arab wajib diisi' }, { status: 400 });
    }

    // [FIX] Sebelumnya INSERT langsung ke kolom hadiths.translation/grade/reference
    // yang sudah tidak ada sejak migration 0003 (skema dinormalisasi ke tabel
    // hadith_translations & hadith_gradings). Query lama selalu gagal (500).
    await client.query('BEGIN');

    const hadithResult = await client.query(
      `INSERT INTO hadiths (book_id, number, arabic, narrator)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [bookId, number, arabic, narrator || null]
    );
    const hadith = hadithResult.rows[0];

    if (translation) {
      await client.query(
        `INSERT INTO hadith_translations (hadith_id, language, text)
         VALUES ($1, 'id', $2)`,
        [hadith.id, translation]
      );
    }

    if (grade) {
      await client.query(
        `INSERT INTO hadith_gradings (hadith_id, scholar, grade, reference)
         VALUES ($1, 'Admin', $2, $3)`,
        [hadith.id, grade, reference || null]
      );
    }

    await client.query('COMMIT');

    return NextResponse.json({ ...hadith, translation, grade, reference }, { status: 201 });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error creating hadith:', error);
    // Konflik unique(book_id, number) -> pesan yang lebih jelas dari pesan generik
    if (error?.code === '23505') {
      return NextResponse.json({ error: 'Nomor hadits untuk kitab ini sudah ada' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create hadith' }, { status: 500 });
  } finally {
    client.release();
  }
}
