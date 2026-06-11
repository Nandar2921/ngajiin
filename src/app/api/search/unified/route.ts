import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'sikaji29',
  database: 'sikaji',
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const limit = parseInt(searchParams.get('limit') || '20');

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [], total: 0, counts: { quran: 0, hadith: 0, tafsir: 0 } });
  }

  try {
    const searchTerm = `%${q}%`;

    // 1. Search Quran
    const quranResults = await pool.query(`
      SELECT 
        'quran' as type,
        id,
        surah,
        ayah,
        arabic,
        translation,
        NULL as narrator,
        NULL as source,
        NULL as content,
        CONCAT('QS. ', surah, ':', ayah) as reference
      FROM quran_verses
      WHERE translation ILIKE $1 OR arabic ILIKE $1
      LIMIT $2
    `, [searchTerm, limit]);

    // 2. Search Hadits
    const hadithResults = await pool.query(`
      SELECT 
        'hadith' as type,
        h.id,
        NULL as surah,
        h.number as ayah,
        h.arabic,
        h.translation,
        h.narrator,
        NULL as source,
        NULL as content,
        h.reference
      FROM hadiths h
      WHERE h.translation ILIKE $1 OR h.arabic ILIKE $1
      LIMIT $2
    `, [searchTerm, limit]);

    // 3. Search Tafsir
    const tafsirResults = await pool.query(`
      SELECT 
        'tafsir' as type,
        t.id,
        q.surah,
        q.ayah,
        NULL as arabic,
        t.content as translation,
        t.source as narrator,
        t.source,
        LEFT(t.content, 200) as content,
        CONCAT('QS. ', q.surah, ':', q.ayah) as reference
      FROM tafsir t
      JOIN quran_verses q ON t.verse_id = q.id
      WHERE t.content ILIKE $1
      LIMIT $2
    `, [searchTerm, limit]);

    // Combine all results
    const allResults = [
      ...quranResults.rows.map((r: any) => ({ ...r, category: 'Al-Quran' })),
      ...hadithResults.rows.map((r: any) => ({ ...r, category: 'Hadits' })),
      ...tafsirResults.rows.map((r: any) => ({ ...r, category: 'Tafsir' })),
    ];

    // Sort by relevance
    const priority: Record<string, number> = { quran: 1, hadith: 2, tafsir: 3 };
    allResults.sort((a, b) => (priority[a.type] || 99) - (priority[b.type] || 99));

    return NextResponse.json({
      keyword: q,
      total: allResults.length,
      results: allResults.slice(0, limit),
      counts: {
        quran: quranResults.rows.length,
        hadith: hadithResults.rows.length,
        tafsir: tafsirResults.rows.length,
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}