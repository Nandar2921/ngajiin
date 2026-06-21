
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
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
    const searchTerm = `%${q}%`;
    
    console.log('🔍 Search query:', q);
    console.log('📊 Expanded:', expandedQueries);
    
    // ========== KEYWORD SEARCH ==========
    const quranKeyword = await pool.query(`
      SELECT 
        'quran' as type,
        id, surah, ayah, arabic, translation,
        CONCAT('QS. ', surah, ':', ayah) as reference,
        'Al-Quran' as category,
        NULL as content
      FROM quran_verses
      WHERE translation ILIKE $1
      LIMIT $2
    `, [searchTerm, limit]);

    console.log('📊 Quran results:', quranKeyword.rows.length);

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
    // [FIX] Sebelumnya query SELECT h.translation, h.reference langsung dari
    // tabel hadiths — kolom itu sudah dipindah ke hadith_translations &
    // hadith_gradings sejak migration 0003, jadi pencarian Hadits sebelumnya
    // selalu gagal/selalu 0 hasil. Sekarang di-JOIN LATERAL ke tabel yang benar.
    const hadithResults = await pool.query(`
      SELECT 
        'hadith' as type,
        h.id, NULL as surah, h.number as ayah, h.arabic,
        COALESCE(ht.text, '') as translation,
        h.narrator, COALESCE(hg.reference, '') as reference, 'Hadits' as category,
        NULL as content
      FROM hadiths h
      LEFT JOIN LATERAL (
        SELECT text FROM hadith_translations
        WHERE hadith_id = h.id AND language = 'id'
        ORDER BY id ASC LIMIT 1
      ) ht ON true
      LEFT JOIN LATERAL (
        SELECT reference FROM hadith_gradings
        WHERE hadith_id = h.id
        ORDER BY id ASC LIMIT 1
      ) hg ON true
      WHERE ht.text ILIKE $1 OR h.arabic ILIKE $1
      LIMIT $2
    `, [searchTerm, limit]);

    console.log('📊 Hadith results:', hadithResults.rows.length);

    const tafsirResults = await pool.query(`
      SELECT 
        'tafsir' as type,
        t.id, q.surah, q.ayah, NULL as arabic, NULL as translation,
        t.content, NULL as narrator, CONCAT('QS. ', q.surah, ':', q.ayah) as reference,
        CONCAT('Tafsir ', t.source) as category
      FROM tafsir t
      JOIN quran_verses q ON q.id = t.verse_id
      WHERE t.content ILIKE $1
      LIMIT $2
    `, [searchTerm, limit]);

    console.log('📊 Tafsir results:', tafsirResults.rows.length);

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
