import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// ===== EKSTRAK SANAD DARI TEKS ARAB =====
function extractSanad(arabicText: string): { sanad: string; matan: string } {
  if (!arabicText) return { sanad: '', matan: '' };

  let sanad = '';
  let matan = arabicText;

  // Pola: Cari kata "قال" (berkata) yang menandakan akhir sanad dan awal matan
  // Sanad adalah teks dari awal sampai "قال" terakhir sebelum matan
  const qalaMatches = [...arabicText.matchAll(/قَالَ|قَالَتْ/g)];
  
  if (qalaMatches.length > 0) {
    // Ambil "قال" terakhir sebagai pemisah
    const lastQala = qalaMatches[qalaMatches.length - 1];
    const lastQalaIndex = lastQala.index || 0;
    
    // Sanad = dari awal sampai "قال" terakhir + "قال" itu sendiri
    sanad = arabicText.substring(0, lastQalaIndex + lastQala[0].length).trim();
    // Matan = setelah "قال" terakhir
    matan = arabicText.substring(lastQalaIndex + lastQala[0].length).trim();
  }

  // Jika tidak ada "قال", coba cari pola sanad lainnya
  if (!sanad) {
    // Pola: حدثنا ... عن ... عن ... عن ... (tanpa qala)
    const sanadPattern = /(?:حَدَّثَنَا|أَخْبَرَنَا).*?(?:عَنْ|عَنِ).*?(?:عَنْ|عَنِ).*?(?:عَنْ|عَنِ)/i;
    const match = arabicText.match(sanadPattern);
    if (match) {
      sanad = match[0].trim();
      matan = arabicText.replace(match[0], '').trim();
    }
  }

  return { sanad, matan };
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // [FIX] Sebelumnya hanya `h.*` — tidak pernah JOIN ke hadith_translations
    // atau hadith_gradings, jadi terjemahan & status hadits tidak pernah
    // tampil di halaman detail meski tidak error. Sekarang di-JOIN LATERAL.
    const result = await pool.query(`
      SELECT 
        h.*,
        b.name_indonesian as book_name,
        COALESCE(ht.text, '') as translation,
        ht.translator,
        COALESCE(hg.grade, '') as grade,
        COALESCE(hg.reference, '') as reference
      FROM hadiths h
      JOIN hadith_books b ON h.book_id = b.id
      LEFT JOIN LATERAL (
        SELECT text, translator FROM hadith_translations
        WHERE hadith_id = h.id AND language = 'id'
        ORDER BY id ASC LIMIT 1
      ) ht ON true
      LEFT JOIN LATERAL (
        SELECT grade, reference FROM hadith_gradings
        WHERE hadith_id = h.id
        ORDER BY id ASC LIMIT 1
      ) hg ON true
      WHERE h.id = $1
    `, [params.id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Hadith not found' }, { status: 404 });
    }

    const hadith = result.rows[0];

    // ===== EKSTRAK SANAD DARI TEKS ARAB =====
    const { sanad, matan } = extractSanad(hadith.arabic);

    return NextResponse.json({
      ...hadith,
      sanad: sanad || hadith.narrator || '',
      matan: matan || hadith.arabic,
    });
  } catch (error) {
    console.error('Error fetching hadith:', error);
    return NextResponse.json({ error: 'Failed to fetch hadith' }, { status: 500 });
  }
}