import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { pool } from '@/lib/pg';
import { authOptions } from '@/lib/auth.config';

export async function POST(request: Request) {
  // [SECURITY FIX] Sebelumnya endpoint bulk-import ini bisa diakses tanpa
  // login sama sekali. Sekarang wajib admin.
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = await pool.connect();
  try {
    const { hadiths: hadithList, bookId } = await request.json();

    if (!Array.isArray(hadithList) || !bookId) {
      return NextResponse.json({ error: 'Data hadits atau kitab tidak valid' }, { status: 400 });
    }

    let imported = 0;

    // [FIX] Sebelumnya INSERT langsung ke hadiths.translation/grade/reference
    // yang sudah tidak ada di skema. Sekarang ditulis ke hadiths +
    // hadith_translations + hadith_gradings dalam satu transaksi per hadits.
    // Translation/grading lama dihapus dulu sebelum insert ulang supaya
    // re-import file yang sama tetap idempotent (tidak menumpuk duplikat).
    await client.query('BEGIN');

    for (const hadith of hadithList) {
      const result = await client.query(
        `INSERT INTO hadiths (book_id, number, arabic, narrator)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (book_id, number) DO UPDATE SET
           arabic = EXCLUDED.arabic,
           narrator = EXCLUDED.narrator
         RETURNING id`,
        [bookId, hadith.number, hadith.arabic, hadith.narrator || null]
      );
      const hadithId = result.rows[0].id;

      await client.query(`DELETE FROM hadith_translations WHERE hadith_id = $1 AND language = 'id'`, [hadithId]);
      if (hadith.translation) {
        await client.query(
          `INSERT INTO hadith_translations (hadith_id, language, text) VALUES ($1, 'id', $2)`,
          [hadithId, hadith.translation]
        );
      }

      await client.query(`DELETE FROM hadith_gradings WHERE hadith_id = $1`, [hadithId]);
      if (hadith.grade) {
        await client.query(
          `INSERT INTO hadith_gradings (hadith_id, scholar, grade, reference) VALUES ($1, 'Import', $2, $3)`,
          [hadithId, hadith.grade, hadith.reference || null]
        );
      }

      imported++;
    }

    await client.query('COMMIT');

    return NextResponse.json({ success: true, imported });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error importing hadith:', error);
    return NextResponse.json({ error: 'Failed to import hadith' }, { status: 500 });
  } finally {
    client.release();
  }
}
