import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Pool } from 'pg';
import { authOptions } from '@/lib/auth.config';

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  user: 'postgres',
  password: 'sikaji29',
  database: 'sikaji',
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tafsirList, source } = await request.json();

    if (!tafsirList || !Array.isArray(tafsirList) || tafsirList.length === 0) {
      return NextResponse.json({ error: 'Invalid tafsir data' }, { status: 400 });
    }

    let imported = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const item of tafsirList) {
      try {
        // Format yang didukung: 
        // { surah, ayah, content } atau { surah, ayah, tafsir }
        const surah = item.surah;
        const ayah = item.ayah;
        const content = item.content || item.tafsir;
        
        if (!surah || !ayah || !content) {
          failed++;
          errors.push(`Missing data: surah=${surah}, ayah=${ayah}, content length=${content?.length}`);
          continue;
        }

        // Cari verse_id berdasarkan surah dan ayah
        const verseResult = await pool.query(
          'SELECT id FROM quran_verses WHERE surah = $1 AND ayah = $2',
          [surah, ayah]
        );

        if (verseResult.rows.length === 0) {
          failed++;
          errors.push(`Surah ${surah}:${ayah} not found in database`);
          continue;
        }

        const verseId = verseResult.rows[0].id;

        // Insert tafsir
        await pool.query(
          `INSERT INTO tafsir (verse_id, source, content) 
           VALUES ($1, $2, $3) 
           ON CONFLICT (verse_id, source) DO UPDATE SET content = EXCLUDED.content`,
          [verseId, source || 'Kemenag', content]
        );
        
        imported++;
      } catch (error) {
        failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Error on ${item.surah}:${item.ayah} - ${errorMessage}`);
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      failed,
      errors: errors.slice(0, 10),
    });

  } catch (error) {
    console.error('Error importing tafsir:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to import tafsir: ${errorMessage}` }, { status: 500 });
  }
}