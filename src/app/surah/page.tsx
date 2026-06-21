'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SkeletonSurah from '@/components/ui/skeleton/SkeletonSurah';
import { Search } from 'lucide-react';

interface Surah {
  surah: number;
  ayat_count: string;
}

// Daftar nama surah lengkap
const surahNames: Record<number, { latin: string; arabic: string; meaning: string }> = {
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

export default function SurahListPage() {
  const [surahList, setSurahList] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/surah')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSurahList(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  // Filter surah berdasarkan search
  const filteredSurah = surahList.filter(surah => {
    const name = surahNames[surah.surah]?.latin.toLowerCase() || '';
    const term = searchTerm.toLowerCase();
    return name.includes(term) || surah.surah.toString().includes(term);
  });

  const totalAyat = surahList.reduce((acc, s) => acc + parseInt(s.ayat_count as string), 0);

  if (loading) return <SkeletonSurah />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-500 mb-2">
            📖 Al-Qur'an
          </h1>
          <p className="text-muted-foreground">
            {surahList.length} surah • {totalAyat.toLocaleString()} ayat
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari surah... (contoh: Al-Fatihah, Yasin, 36)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl focus:outline-none focus:border-emerald-500 text-foreground placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {/* Grid Surah */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredSurah.map((surah) => {
            const surahName = surahNames[surah.surah];
            const ayatCount = parseInt(surah.ayat_count as string);
            
            return (
              <Link
                key={surah.surah}
                href={`/surah/${surah.surah}`}
                className="group block bg-card/60 border border-border/60 rounded-xl p-4 hover:bg-card hover:border-emerald-500/30 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Nomor Surah */}
                    <div className="w-10 h-10 flex items-center justify-center bg-emerald-500/10 rounded-xl text-emerald-500 font-bold text-sm group-hover:bg-emerald-500 group-hover:text-white transition">
                      {surah.surah}
                    </div>
                    
                    {/* Nama Surah */}
                    <div>
                      <div className="font-semibold text-foreground group-hover:text-emerald-400 transition">
                        {surah.surah}. {surahName?.latin || `Surah ${surah.surah}`}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{ayatCount} ayat</span>
                        <span className="text-xs text-muted-foreground/60">•</span>
                        <span className="text-xs text-emerald-500 font-arabic">
                          {surahName?.arabic || '۞'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Arrow Icon */}
                  <div className="text-emerald-500 opacity-0 group-hover:opacity-100 transition transform group-hover:translate-x-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredSurah.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Tidak ditemukan surah dengan kata kunci "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
}