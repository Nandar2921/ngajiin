import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { quranVerses } from '@/lib/db/schema';
import { ilike, or, eq, sql } from 'drizzle-orm';

// Daftar nama surah lengkap (1-114)
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
  23: { latin: "Al-Mu'minun", arabic: 'المؤمنون', meaning: 'Orang Mukmin' },
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
  55: { latin: 'Ar-Rahman', arabic: 'الرحمن', meaning: 'Yang Maha Pemurah' },
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

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  let q = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;
  const offset = (page - 1) * limit;

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ results: [], total: 0, page, totalPages: 0 });
  }

  try {
    q = q.trim();
    let isSurahSearch = false;
    let matchedSurah = null;
    
    // Auto-detect: cek apakah keyword adalah nama surah
    const normalizedQ = q.toLowerCase();
    
    // Cek dengan nama latin
    for (let i = 1; i <= 114; i++) {
      const surahName = surahNamesList[i]?.latin.toLowerCase();
      if (surahName && (normalizedQ === surahName || normalizedQ.includes(surahName))) {
        isSurahSearch = true;
        matchedSurah = i;
        break;
      }
    }
    
    // Cek dengan pola "surah 1", "surat 1", "qs 1"
    const surahPattern = /(surah|surat|qs)\s*(\d+)/i;
    const patternMatch = q.match(surahPattern);
    if (patternMatch) {
      isSurahSearch = true;
      matchedSurah = parseInt(patternMatch[2]);
    }
    
    let total = 0;
    let results = [];
    let surahInfo = null;
    
    if (isSurahSearch && matchedSurah && matchedSurah >= 1 && matchedSurah <= 114) {
      const info = surahNamesList[matchedSurah];
      surahInfo = {
        number: matchedSurah,
        latin: info.latin,
        arabic: info.arabic,
        meaning: info.meaning,
        displayName: `${matchedSurah}. ${info.latin} (${info.meaning})`
      };
      
      const totalResult = await db.select({ count: sql<number>`count(*)` })
        .from(quranVerses)
        .where(eq(quranVerses.surah, matchedSurah));
      
      total = Number(totalResult[0]?.count) || 0;
      
      results = await db
        .select()
        .from(quranVerses)
        .where(eq(quranVerses.surah, matchedSurah))
        .limit(limit)
        .offset(offset)
        .orderBy(quranVerses.ayah);
        
    } else {
      const conditions = or(
        ilike(quranVerses.translation, `%${q}%`),
        ilike(quranVerses.arabic, `%${q}%`)
      );
      
      const totalResult = await db.select({ count: sql<number>`count(*)` })
        .from(quranVerses)
        .where(conditions);
      
      total = Number(totalResult[0]?.count) || 0;
      
      results = await db
        .select()
        .from(quranVerses)
        .where(conditions)
        .limit(limit)
        .offset(offset)
        .orderBy(quranVerses.surah, quranVerses.ayah);
    }
    
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      results,
      total,
      page,
      totalPages,
      keyword: q,
      isSurahSearch: isSurahSearch && !!matchedSurah,
      matchedSurah: matchedSurah,
      surahInfo: surahInfo
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}