import { NextResponse } from 'next/server';
import { pool } from '@/lib/pg';

const EMBEDDING_API_URL = process.env.EMBEDDING_API_URL || 'http://localhost:8000';
const isProduction = process.env.NODE_ENV === 'production';

// ========== DAFTAR NAMA SURAH ==========
const surahNamesList: Record<number, { latin: string; arabic: string; meaning: string }> = {
  1: { latin: 'Al-Fatihah', arabic: 'الفاتحة', meaning: 'Pembukaan' },
  2: { latin: 'Al-Baqarah', arabic: 'البقرة', meaning: 'Sapi Betina' },
  3: { latin: "Ali 'Imran", arabic: 'آل عمران', meaning: 'Keluarga Imran' },
  4: { latin: 'An-Nisa', arabic: 'النساء', meaning: 'Wanita' },
  5: { latin: 'Al-Maidah', arabic: 'المائدة', meaning: 'Hidangan' },
  6: { latin: "Al-An'am", arabic: 'الأنعام', meaning: 'Binatang Ternak' },
  7: { latin: "Al-A'raf", arabic: 'الأعراف', meaning: 'Tempat Tertinggi' },
  8: { latin: 'Al-Anfal', arabic: 'الأنفال', meaning: 'Harta Rampasan' },
  9: { latin: 'At-Taubah', arabic: 'التوبة', meaning: 'Pengampunan' },
  10: { latin: 'Yunus', arabic: 'يونس', meaning: 'Nabi Yunus' },
  11: { latin: 'Hud', arabic: 'هود', meaning: 'Nabi Hud' },
  12: { latin: 'Yusuf', arabic: 'يوسف', meaning: 'Nabi Yusuf' },
  13: { latin: "Ar-Ra'd", arabic: 'الرعد', meaning: 'Guruh' },
  14: { latin: 'Ibrahim', arabic: 'إبراهيم', meaning: 'Nabi Ibrahim' },
  15: { latin: 'Al-Hijr', arabic: 'الحجر', meaning: 'Bukit' },
  16: { latin: 'An-Nahl', arabic: 'النحل', meaning: 'Lebah' },
  17: { latin: 'Al-Isra', arabic: 'الإسراء', meaning: 'Perjalanan Malam' },
  18: { latin: 'Al-Kahf', arabic: 'الكهف', meaning: 'Gua' },
  19: { latin: 'Maryam', arabic: 'مريم', meaning: 'Maryam' },
  20: { latin: 'Taha', arabic: 'طه', meaning: 'Thaha' },
  21: { latin: 'Al-Anbiya', arabic: 'الأنبياء', meaning: 'Para Nabi' },
  22: { latin: 'Al-Hajj', arabic: 'الحج', meaning: 'Haji' },
  23: { latin: "Al-Mu'minun", arabic: 'المؤمنون', meaning: 'Orang Beriman' },
  24: { latin: 'An-Nur', arabic: 'النور', meaning: 'Cahaya' },
  25: { latin: 'Al-Furqan', arabic: 'الفرقان', meaning: 'Pembeda' },
  26: { latin: "Asy-Syu'ara", arabic: 'الشعراء', meaning: 'Para Penyair' },
  27: { latin: 'An-Naml', arabic: 'النمل', meaning: 'Semut' },
  28: { latin: 'Al-Qasas', arabic: 'القصص', meaning: 'Cerita' },
  29: { latin: 'Al-Ankabut', arabic: 'العنكبوت', meaning: 'Laba-laba' },
  30: { latin: 'Ar-Rum', arabic: 'الروم', meaning: 'Romawi' },
  31: { latin: 'Luqman', arabic: 'لقمان', meaning: 'Luqman' },
  32: { latin: 'As-Sajdah', arabic: 'السجدة', meaning: 'Sujud' },
  33: { latin: 'Al-Ahzab', arabic: 'الأحزاب', meaning: 'Golongan Sekutu' },
  34: { latin: 'Saba', arabic: 'سبأ', meaning: 'Kaum Saba' },
  35: { latin: 'Fatir', arabic: 'فاطر', meaning: 'Pencipta' },
  36: { latin: 'Yasin', arabic: 'يس', meaning: 'Yasin' },
  37: { latin: 'As-Saffat', arabic: 'الصافات', meaning: 'Yang Berbaris' },
  38: { latin: 'Sad', arabic: 'ص', meaning: 'Shad' },
  39: { latin: 'Az-Zumar', arabic: 'الزمر', meaning: 'Rombongan' },
  40: { latin: 'Ghafir', arabic: 'غافر', meaning: 'Yang Mengampuni' },
  41: { latin: 'Fussilat', arabic: 'فصلت', meaning: 'Yang Dijelaskan' },
  42: { latin: 'Asy-Syura', arabic: 'الشورى', meaning: 'Musyawarah' },
  43: { latin: 'Az-Zukhruf', arabic: 'الزخرف', meaning: 'Perhiasan' },
  44: { latin: 'Ad-Dukhan', arabic: 'الدخان', meaning: 'Kabut' },
  45: { latin: 'Al-Jasiyah', arabic: 'الجاثية', meaning: 'Berlutut' },
  46: { latin: 'Al-Ahqaf', arabic: 'الأحقاف', meaning: 'Bukit Pasir' },
  47: { latin: 'Muhammad', arabic: 'محمد', meaning: 'Muhammad' },
  48: { latin: 'Al-Fath', arabic: 'الفتح', meaning: 'Kemenangan' },
  49: { latin: 'Al-Hujurat', arabic: 'الحجرات', meaning: 'Kamar' },
  50: { latin: 'Qaf', arabic: 'ق', meaning: 'Qaf' },
  51: { latin: 'Adz-Dzariyat', arabic: 'الذاريات', meaning: 'Angin Menerbangkan' },
  52: { latin: 'At-Tur', arabic: 'الطور', meaning: 'Bukit' },
  53: { latin: 'An-Najm', arabic: 'النجم', meaning: 'Bintang' },
  54: { latin: 'Al-Qamar', arabic: 'القمر', meaning: 'Bulan' },
  55: { latin: 'Ar-Rahman', arabic: 'الرحمن', meaning: 'Yang Maha Pengasih' },
  56: { latin: 'Al-Waqiah', arabic: 'الواقعة', meaning: 'Hari Kiamat' },
  57: { latin: 'Al-Hadid', arabic: 'الحديد', meaning: 'Besi' },
  58: { latin: 'Al-Mujadilah', arabic: 'المجادلة', meaning: 'Wanita Penggugat' },
  59: { latin: 'Al-Hasyr', arabic: 'الحشر', meaning: 'Pengusiran' },
  60: { latin: 'Al-Mumtahanah', arabic: 'الممتحنة', meaning: 'Wanita Diuji' },
  61: { latin: 'As-Saff', arabic: 'الصف', meaning: 'Barisan' },
  62: { latin: 'Al-Jumuah', arabic: 'الجمعة', meaning: 'Jumat' },
  63: { latin: 'Al-Munafiqun', arabic: 'المنافقون', meaning: 'Orang Munafik' },
  64: { latin: 'At-Tagabun', arabic: 'التغابن', meaning: 'Ditampakkan Kesalahan' },
  65: { latin: 'At-Talaq', arabic: 'الطلاق', meaning: 'Talak' },
  66: { latin: 'At-Tahrim', arabic: 'التحريم', meaning: 'Pengharaman' },
  67: { latin: 'Al-Mulk', arabic: 'الملك', meaning: 'Kerajaan' },
  68: { latin: 'Al-Qalam', arabic: 'القلم', meaning: 'Pena' },
  69: { latin: 'Al-Haqqah', arabic: 'الحاقة', meaning: 'Hari Kiamat' },
  70: { latin: "Al-Ma'arij", arabic: 'المعارج', meaning: 'Tempat Naik' },
  71: { latin: 'Nuh', arabic: 'نوح', meaning: 'Nabi Nuh' },
  72: { latin: 'Al-Jinn', arabic: 'الجن', meaning: 'Jin' },
  73: { latin: 'Al-Muzzammil', arabic: 'المزمل', meaning: 'Orang Berselimut' },
  74: { latin: 'Al-Muddassir', arabic: 'المدثر', meaning: 'Orang Berkemul' },
  75: { latin: 'Al-Qiyamah', arabic: 'القيامة', meaning: 'Kiamat' },
  76: { latin: 'Al-Insan', arabic: 'الإنسان', meaning: 'Manusia' },
  77: { latin: 'Al-Mursalat', arabic: 'المرسلات', meaning: 'Malaikat Diutus' },
  78: { latin: 'An-Naba', arabic: 'النبأ', meaning: 'Berita Besar' },
  79: { latin: "An-Nazi'at", arabic: 'النازعات', meaning: 'Malaikat Pencabut' },
  80: { latin: 'Abasa', arabic: 'عبس', meaning: 'Bermuka Masam' },
  81: { latin: 'At-Takwir', arabic: 'التكوير', meaning: 'Menggulung' },
  82: { latin: 'Al-Infitar', arabic: 'الإنفطار', meaning: 'Terbelah' },
  83: { latin: 'Al-Mutaffifin', arabic: 'المطففين', meaning: 'Orang Curang' },
  84: { latin: 'Al-Insyiqaq', arabic: 'الإنشقاق', meaning: 'Terbelah' },
  85: { latin: 'Al-Buruj', arabic: 'البروج', meaning: 'Gugusan Bintang' },
  86: { latin: 'At-Tariq', arabic: 'الطارق', meaning: 'Datang Malam' },
  87: { latin: "Al-A'la", arabic: 'الأعلى', meaning: 'Paling Tinggi' },
  88: { latin: 'Al-Gasyiyah', arabic: 'الغاشية', meaning: 'Pembalasan' },
  89: { latin: 'Al-Fajr', arabic: 'الفجر', meaning: 'Fajar' },
  90: { latin: 'Al-Balad', arabic: 'البلد', meaning: 'Negeri' },
  91: { latin: 'Asy-Syams', arabic: 'الشمس', meaning: 'Matahari' },
  92: { latin: 'Al-Lail', arabic: 'الليل', meaning: 'Malam' },
  93: { latin: 'Ad-Duha', arabic: 'الضحى', meaning: 'Duha' },
  94: { latin: 'Al-Insyirah', arabic: 'الشرح', meaning: 'Melapangkan' },
  95: { latin: 'At-Tin', arabic: 'التين', meaning: 'Tin' },
  96: { latin: 'Al-Alaq', arabic: 'العلق', meaning: 'Segumpal Darah' },
  97: { latin: 'Al-Qadr', arabic: 'القدر', meaning: 'Kemuliaan' },
  98: { latin: 'Al-Bayyinah', arabic: 'البينة', meaning: 'Bukti Nyata' },
  99: { latin: 'Az-Zalzalah', arabic: 'الزلزلة', meaning: 'Keguncangan' },
  100: { latin: 'Al-Adiyat', arabic: 'العاديات', meaning: 'Kuda Perang' },
  101: { latin: "Al-Qari'ah", arabic: 'القارعة', meaning: 'Kiamat' },
  102: { latin: 'At-Takasur', arabic: 'التكاثر', meaning: 'Bermegah-megahan' },
  103: { latin: 'Al-Asr', arabic: 'العصر', meaning: 'Masa' },
  104: { latin: 'Al-Humazah', arabic: 'الهمزة', meaning: 'Pengumpat' },
  105: { latin: 'Al-Fil', arabic: 'الفيل', meaning: 'Gajah' },
  106: { latin: 'Quraisy', arabic: 'قريش', meaning: 'Quraisy' },
  107: { latin: "Al-Ma'un", arabic: 'الماعون', meaning: 'Barang Berguna' },
  108: { latin: 'Al-Kausar', arabic: 'الكوثر', meaning: 'Nikmat Berlimpah' },
  109: { latin: 'Al-Kafirun', arabic: 'الكافرون', meaning: 'Orang Kafir' },
  110: { latin: 'An-Nasr', arabic: 'النصر', meaning: 'Pertolongan' },
  111: { latin: 'Al-Lahab', arabic: 'اللهب', meaning: 'Api' },
  112: { latin: 'Al-Ikhlas', arabic: 'الإخلاص', meaning: 'Keesaan' },
  113: { latin: 'Al-Falaq', arabic: 'الفلق', meaning: 'Subuh' },
  114: { latin: 'An-Nas', arabic: 'الناس', meaning: 'Manusia' },
};

// ========== SINONIM ==========
const synonyms: Record<string, string[]> = {
  'shalat': ['solat', 'sembahyang', 'salat', 'sholat'],
  'puasa': ['shaum', 'ramadhan', 'berpuasa'],
  'zakat': ['sedekah wajib', 'infaq', 'fitrah'],
  'haji': ['umrah', 'ibadah haji'],
  'halal': ['boleh', 'diperbolehkan', 'mubah'],
  'haram': ['dilarang', 'terlarang', 'dosa'],
  'wajib': ['harus', 'fardu', 'fardhu'],
  'sunnah': ['anjuran', 'dianjurkan', 'mustahab'],
  'sabar': ['tabah', 'tahan', 'bersabar'],
  'syukur': ['bersyukur', 'terima kasih'],
  'tobat': ['taubat', 'bertobat', 'menyesal'],
  'doa': ['berdoa', 'memohon'],
  'nikah': ['pernikahan', 'menikah', 'kawin'],
  'thalak': ['cerai', 'perceraian'],
  'waris': ['warisan', 'pusaka'],
  'wudhu': ['wudu', 'berwudhu'],
  'mandi': ['junub', 'mandi wajib'],
  'iman': ['percaya', 'keyakinan', 'beriman'],
  'islam': ['muslim', 'berserah diri'],
  'taqwa': ['takwa', 'bertaqwa'],
  'qurban': ['udhiyah', 'aqiqah', 'kurban'],
  'riba': ['bunga', 'rentenir'],
  'jihad': ['perjuangan', 'berjuang'],
  'sedekah': ['shadaqah', 'sodaqoh', 'infaq'],
  'taubat': ['tobat', 'bertobat', 'menyesal'],
  'rezeki': ['rizki', 'rejeki', 'rizq'],
  'hukum': ['aturan', 'ketentuan'],
};

// ========== DETEKSI SURAH ==========
function detectSurah(query: string): { surah: number | null; isSurahSearch: boolean } {
  const normalized = query.toLowerCase().trim();
  
  const patternMatch = normalized.match(/(qs|q.s|surat|surah)\s*(\d+)/i);
  if (patternMatch) {
    const num = parseInt(patternMatch[2]);
    if (num >= 1 && num <= 114) {
      return { surah: num, isSurahSearch: true };
    }
  }
  
  const ayatPattern = normalized.match(/^(\d+):(\d+)$/);
  if (ayatPattern) {
    const num = parseInt(ayatPattern[1]);
    if (num >= 1 && num <= 114) {
      return { surah: num, isSurahSearch: true };
    }
  }
  
  for (let i = 1; i <= 114; i++) {
    const surahName = surahNamesList[i]?.latin.toLowerCase();
    if (surahName && (normalized === surahName || normalized.includes(surahName))) {
      return { surah: i, isSurahSearch: true };
    }
  }
  
  return { surah: null, isSurahSearch: false };
}

// ========== EXPAND QUERY (DENGAN SPLIT KALIMAT) ==========
function expandQuery(query: string): string[] {
  const words = query.toLowerCase().split(' ');
  const expanded = [query];
  
  // Tambahkan sinonim untuk setiap kata
  for (const word of words) {
    if (synonyms[word]) {
      expanded.push(...synonyms[word]);
    }
  }
  
  // Tambahkan kata per kata (untuk kalimat panjang)
  for (const word of words) {
    if (word.length > 2 && !expanded.includes(word)) {
      expanded.push(word);
    }
  }
  
  return [...new Set(expanded)];
}

// ========== MAIN API ==========
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const limit = parseInt(searchParams.get('limit') || '30');
  const useSemantic = searchParams.get('semantic') === 'true' && !isProduction;

  if (!q || q.length < 2) {
    return NextResponse.json({
      keyword: q,
      total: 0,
      results: [],
      counts: { quran: 0, hadith: 0, tafsir: 0 },
      semanticUsed: false,
    });
  }

  try {
    const { surah, isSurahSearch } = detectSurah(q);
    const expandedQueries = expandQuery(q);
    const allTerms = [...new Set([q, ...expandedQueries])];
    const searchPatterns = allTerms.map(t => `%${t}%`);

    console.log('🔍 Query:', q);
    console.log('📖 Surah detection:', isSurahSearch ? `Surah ${surah}` : 'No');
    console.log('📊 Expanded:', expandedQueries);

    let surahInfo = null;
    if (isSurahSearch && surah) {
      const info = surahNamesList[surah];
      surahInfo = {
        number: surah,
        latin: info.latin,
        arabic: info.arabic,
        meaning: info.meaning,
      };
    }

    // ========== SEARCH QURAN ==========
    let quranConditions: string;
    let quranParams: any[];

    if (isSurahSearch && surah) {
      quranConditions = `surah = $1`;
      quranParams = [surah, limit];
    } else {
      // Cari dengan semua kata (OR)
      quranConditions = allTerms.map((_, i) =>
        `(translation ILIKE $${i + 1} OR arabic ILIKE $${i + 1})`
      ).join(' OR ');
      quranParams = [...searchPatterns, limit];
    }

    const quranResult = await pool.query(`
      SELECT 
        'quran' as type,
        id, surah, ayah, arabic, translation,
        CONCAT('QS. ', surah, ':', ayah) as reference,
        'Al-Quran' as category,
        NULL as content
      FROM quran_verses
      WHERE ${quranConditions}
      LIMIT $${quranParams.length}
    `, quranParams);

    // ========== SEARCH HADITS ==========
    const hadithConditions = allTerms.map((_, i) =>
      `(h.arabic ILIKE $${i + 1} OR h.translation ILIKE $${i + 1} OR ht.text ILIKE $${i + 1} OR h.narrator ILIKE $${i + 1})`
    ).join(' OR ');

    const hadithResult = await pool.query(`
      SELECT 
        'hadith' as type,
        h.id, NULL as surah, h.number as ayah, h.arabic,
        COALESCE(ht.text, h.translation) as translation,
        h.narrator,
        COALESCE(hg.reference, h.reference) as reference,
        'Hadits' as category,
        NULL as content,
        COALESCE(hg.grade, h.grade) as grade
      FROM hadiths h
      LEFT JOIN hadith_translations ht ON h.id = ht.hadith_id AND ht.language = 'id'
      LEFT JOIN hadith_gradings hg ON h.id = hg.hadith_id
      WHERE ${hadithConditions}
      LIMIT $${allTerms.length + 1}
    `, [...searchPatterns, limit]);

    // ========== SEARCH TAFSIR ==========
    const tafsirConditions = allTerms.map((_, i) =>
      `t.content ILIKE $${i + 1}`
    ).join(' OR ');

    const tafsirResult = await pool.query(`
      SELECT 
        'tafsir' as type,
        t.id, q.surah, q.ayah, NULL as arabic, NULL as translation,
        t.content, NULL as narrator,
        CONCAT('QS. ', q.surah, ':', q.ayah) as reference,
        CONCAT('Tafsir ', t.source) as category,
        NULL as grade
      FROM tafsir t
      JOIN quran_verses q ON q.id = t.verse_id
      WHERE ${tafsirConditions}
      LIMIT $${allTerms.length + 1}
    `, [...searchPatterns, limit]);

    // ========== SEMANTIC SEARCH ==========
    let semanticResults: any[] = [];
    if (useSemantic && !isSurahSearch) {
      try {
        const embedRes = await fetch(`${EMBEDDING_API_URL}/embed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: q }),
        });
        if (embedRes.ok) {
          const { embedding } = await embedRes.json();
          const vectorStr = `[${embedding.join(',')}]`;
          const semResult = await pool.query(`
            SELECT 
              'quran' as type,
              id, surah, ayah, arabic, translation,
              CONCAT('QS. ', surah, ':', ayah) as reference,
              'Al-Quran' as category,
              NULL as content,
              (1 - (embedding <=> $1::vector)) as similarity
            FROM quran_verses
            WHERE embedding IS NOT NULL
            ORDER BY embedding <=> $1::vector
            LIMIT $2
          `, [vectorStr, limit]);
          semanticResults = semResult.rows;
        }
      } catch (err) {
        console.error('❌ Semantic error:', err);
      }
    }

    // ========== GABUNGKAN ==========
    let allResults = [...quranResult.rows, ...hadithResult.rows, ...tafsirResult.rows];

    if (useSemantic && semanticResults.length > 0 && !isSurahSearch) {
      const existingIds = new Set(quranResult.rows.map(r => r.id));
      for (const sem of semanticResults) {
        if (!existingIds.has(sem.id)) allResults.push(sem);
      }
    }

    // ========== RANKING ==========
    const ranked = allResults.map(item => {
      let score = 0;
      const text = (item.translation || item.content || '').toLowerCase();
      const qLower = q.toLowerCase();

      // Exact match full query
      if (text.includes(qLower)) score += 15;
      
      // Match di awal
      if (text.startsWith(qLower)) score += 8;
      
      // Match per kata
      const words = qLower.split(' ');
      for (const word of words) {
        if (word.length > 2 && text.includes(word)) {
          score += 4;
        }
      }
      
      // Match sinonim
      for (const syn of expandedQueries) {
        if (syn !== q && text.includes(syn.toLowerCase())) {
          score += 2;
        }
      }
      
      // Prioritas Quran
      if (item.type === 'quran') score += 2;
      if (item.similarity) score += item.similarity * 5;

      return { ...item, _score: score };
    });

    ranked.sort((a, b) => (b._score || 0) - (a._score || 0));
    const finalResults = ranked.map(({ _score, ...item }) => item);

    // ========== RESPONSE ==========
    return NextResponse.json({
      keyword: q,
      total: finalResults.length,
      results: finalResults.slice(0, limit * 3),
      counts: {
        quran: quranResult.rows.length + (useSemantic ? semanticResults.filter(r => r.type === 'quran').length : 0),
        hadith: hadithResult.rows.length,
        tafsir: tafsirResult.rows.length,
      },
      expandedQueries: expandedQueries.length > 1 ? expandedQueries : undefined,
      semanticUsed: useSemantic,
      isSurahSearch: isSurahSearch && !!surah,
      surahInfo: surahInfo,
    });

  } catch (error) {
    console.error('❌ Search error:', error);
    return NextResponse.json(
      {
        error: 'Search failed',
        details: String(error),
        keyword: q,
        results: [],
        total: 0,
        counts: { quran: 0, hadith: 0, tafsir: 0 },
      },
      { status: 500 }
    );
  }
}