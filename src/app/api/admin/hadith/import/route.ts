import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { pool } from '@/lib/pg';

export async function POST(request: Request) {
  // ✅ TAMBAHKAN AUTH CHECK
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { hadiths: hadithList, bookId } = await request.json();
    let imported = 0;

    for (const hadith of hadithList) {
      // ✅ INSERT ke hadiths (tanpa translation, grade, reference)
      const result = await pool.query(
        `INSERT INTO hadiths (book_id, number, chapter, arabic, narrator, source) 
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (book_id, number) DO UPDATE SET
         chapter = EXCLUDED.chapter,
         arabic = EXCLUDED.arabic,
         narrator = EXCLUDED.narrator,
         source = EXCLUDED.source
         RETURNING id`,
        [bookId, hadith.number, hadith.chapter || null, hadith.arabic, hadith.narrator, hadith.source]
      );

      const hadithId = result.rows[0].id;

      // ✅ Insert translation jika ada
      if (hadith.translation) {
        await pool.query(
          `INSERT INTO hadith_translations (hadith_id, language, translator, text, source)
           VALUES ($1, 'id', $2, $3, $4)
           ON CONFLICT (hadith_id, language) DO UPDATE SET
           translator = EXCLUDED.translator,
           text = EXCLUDED.text,
           source = EXCLUDED.source`,
          [hadithId, hadith.translator || 'Unknown', hadith.translation, hadith.translationSource || null]
        );
      }

      // ✅ Insert grading jika ada
      if (hadith.grade) {
        await pool.query(
          `INSERT INTO hadith_gradings (hadith_id, scholar, grade, reference)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (hadith_id, scholar) DO UPDATE SET
           grade = EXCLUDED.grade,
           reference = EXCLUDED.reference`,
          [hadithId, hadith.scholar || 'Unknown', hadith.grade, hadith.reference || null]
        );
      }

      imported++;
    }

    return NextResponse.json({ success: true, imported });
  } catch (error) {
    console.error('Error importing hadith:', error);
    return NextResponse.json({ error: 'Failed to import hadith' }, { status: 500 });
  }
}