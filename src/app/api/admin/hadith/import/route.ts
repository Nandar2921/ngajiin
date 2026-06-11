import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'sikaji29',
  database: 'sikaji',
});

export async function POST(request: Request) {
  try {
    const { hadiths: hadithList, bookId } = await request.json();
    let imported = 0;

    for (const hadith of hadithList) {
      await pool.query(
        `INSERT INTO hadiths (book_id, number, arabic, translation, narrator, grade, reference) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (book_id, number) DO UPDATE SET
         arabic = EXCLUDED.arabic,
         translation = EXCLUDED.translation,
         narrator = EXCLUDED.narrator,
         grade = EXCLUDED.grade,
         reference = EXCLUDED.reference`,
        [bookId, hadith.number, hadith.arabic, hadith.translation, hadith.narrator, hadith.grade, hadith.reference]
      );
      imported++;
    }

    return NextResponse.json({ success: true, imported });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to import hadith' }, { status: 500 });
  }
}