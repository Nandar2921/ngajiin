import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  user: 'postgres',
  password: 'sikaji29',
  database: 'sikaji',
});

// Sinonim untuk memperkaya pencarian
const synonyms: Record<string, string[]> = {
  'qurban': ['udhiyah', 'aqiqah', 'dam', 'penyembelihan', 'hewan kurban', 'kurban'],
  'riba': ['bunga bank', 'rentenir', 'usury', 'bunga'],
  'shalat': ['solat', 'sembahyang', 'salat'],
  'puasa': ['shaum', 'fasting', 'ramadhan'],
  'zakat': ['sedekah wajib', 'infaq'],
  'haji': ['umrah', 'ibadah haji'],
  'jihad': ['perjuangan', 'berjuang'],
  'sabar': ['tabah', 'tahan'],
  'syukur': ['bersyukur', 'terima kasih'],
};

function expandQuery(query: string): string[] {
  const words = query.toLowerCase().split(' ');
  const expanded = [query];
  
  for (const word of words) {
    if (synonyms[word]) {
      expanded.push(...synonyms[word]);
    }
  }
  
  return [...new Set(expanded)];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const limit = parseInt(searchParams.get('limit') || '30');
  const useSemantic = searchParams.get('semantic') === 'true';

  if (!q || q.length < 2) {
    return NextResponse.json({ keyword: q, total: 0, results: [], counts: { quran: 0, hadith: 0, tafsir: 0 } });
  }

  try {
    const expandedQueries = expandQuery(q);
    const searchTerms = expandedQueries.map(term => `%${term}%`);
    
    // ========== KEYWORD SEARCH ==========
    const quranKeyword = await pool.query(`
      SELECT 
        'quran' as type,
        id, surah, ayah, arabic, translation,
        CONCAT('QS. ', surah, ':', ayah) as reference,
        'Al-Quran' as category,
        NULL as content
      FROM quran_verses
      WHERE translation ILIKE ANY($1::text[])
      LIMIT $2
    `, [searchTerms, limit]);

    // ========== SEMANTIC SEARCH (jika diaktifkan) ==========
    let semanticResults: any[] = [];
    
    if (useSemantic) {
      try {
        const semanticRes = await fetch(`http://localhost:3000/api/search/semantic?q=${encodeURIComponent(q)}&limit=${limit}`);
        if (semanticRes.ok) {
          const semanticData = await semanticRes.json();
          semanticResults = semanticData.results || [];
        }
      } catch (err) {
        console.error('Semantic search error:', err);
      }
    }

    // ========== SEARCH HADITS & TAFSIR ==========
    const hadithResults = await pool.query(`
      SELECT 
        'hadith' as type,
        h.id, NULL as surah, h.number as ayah, h.arabic, h.translation,
        h.narrator, h.reference, 'Hadits' as category,
        NULL as content
      FROM hadiths h
      WHERE h.translation ILIKE ANY($1::text[])
      LIMIT $2
    `, [searchTerms, limit]);

    const tafsirResults = await pool.query(`
      SELECT 
        'tafsir' as type,
        t.id, q.surah, q.ayah, NULL as arabic, NULL as translation,
        t.content, NULL as narrator, CONCAT('QS. ', q.surah, ':', q.ayah) as reference,
        CONCAT('Tafsir ', t.source) as category
      FROM tafsir t
      JOIN quran_verses q ON q.id = t.verse_id
      WHERE t.content ILIKE ANY($1::text[])
      LIMIT $2
    `, [searchTerms, limit]);

    // Gabungkan semua hasil
    let allResults = [...quranKeyword.rows, ...hadithResults.rows, ...tafsirResults.rows];
    
    // Tambahkan semantic results yang belum ada
    if (useSemantic && semanticResults.length > 0) {
      const existingIds = new Set(quranKeyword.rows.map(r => r.id));
      for (const sem of semanticResults) {
        if (!existingIds.has(sem.id)) {
          allResults.push(sem);
        }
      }
    }

    return NextResponse.json({
      keyword: q,
      total: allResults.length,
      results: allResults,
      counts: {
        quran: quranKeyword.rows.length + (useSemantic ? semanticResults.filter(r => r.type === 'quran').length : 0),
        hadith: hadithResults.rows.length,
        tafsir: tafsirResults.rows.length,
      },
      expandedQueries: expandedQueries.length > 1 ? expandedQueries : undefined,
      semanticUsed: useSemantic,
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}