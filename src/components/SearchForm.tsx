'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface Surah {
  surah: number;
  ayat_count: number;
}

// Daftar nama surah
const surahNames: Record<number, string> = {
  1: 'Al-Fatihah', 2: 'Al-Baqarah', 3: "Ali 'Imran", 4: 'An-Nisa', 5: 'Al-Maidah',
  6: "Al-An'am", 7: "Al-A'raf", 8: 'Al-Anfal', 9: 'At-Taubah', 10: 'Yunus',
  11: 'Hud', 12: 'Yusuf', 13: "Ar-Ra'd", 14: 'Ibrahim', 15: 'Al-Hijr',
  16: 'An-Nahl', 17: 'Al-Isra', 18: 'Al-Kahf', 19: 'Maryam', 20: 'Taha',
  21: 'Al-Anbiya', 22: 'Al-Hajj', 23: "Al-Mu'minun", 24: 'An-Nur', 25: 'Al-Furqan',
  26: "Asy-Syu'ara", 27: 'An-Naml', 28: 'Al-Qasas', 29: 'Al-Ankabut', 30: 'Ar-Rum',
  31: 'Luqman', 32: 'As-Sajdah', 33: 'Al-Ahzab', 34: 'Saba', 35: 'Fatir',
  36: 'Yasin', 37: 'As-Saffat', 38: 'Sad', 39: 'Az-Zumar', 40: 'Ghafir',
  41: 'Fussilat', 42: 'Asy-Syura', 43: 'Az-Zukhruf', 44: 'Ad-Dukhan', 45: 'Al-Jasiyah',
  46: 'Al-Ahqaf', 47: 'Muhammad', 48: 'Al-Fath', 49: 'Al-Hujurat', 50: 'Qaf',
  51: 'Adz-Dzariyat', 52: 'At-Tur', 53: 'An-Najm', 54: 'Al-Qamar', 55: 'Ar-Rahman',
  56: 'Al-Waqiah', 57: 'Al-Hadid', 58: 'Al-Mujadilah', 59: 'Al-Hasyr', 60: 'Al-Mumtahanah',
  61: 'As-Saff', 62: 'Al-Jumuah', 63: 'Al-Munafiqun', 64: 'At-Tagabun', 65: 'At-Talaq',
  66: 'At-Tahrim', 67: 'Al-Mulk', 68: 'Al-Qalam', 69: 'Al-Haqqah', 70: "Al-Ma'arij",
  71: 'Nuh', 72: 'Al-Jinn', 73: 'Al-Muzzammil', 74: 'Al-Muddassir', 75: 'Al-Qiyamah',
  76: 'Al-Insan', 77: 'Al-Mursalat', 78: 'An-Naba', 79: "An-Nazi'at", 80: 'Abasa',
  81: 'At-Takwir', 82: 'Al-Infitar', 83: 'Al-Mutaffifin', 84: 'Al-Insyiqaq', 85: 'Al-Buruj',
  86: 'At-Tariq', 87: "Al-A'la", 88: 'Al-Gasyiyah', 89: 'Al-Fajr', 90: 'Al-Balad',
  91: 'Asy-Syams', 92: 'Al-Lail', 93: 'Ad-Duha', 94: 'Al-Insyirah', 95: 'At-Tin',
  96: 'Al-Alaq', 97: 'Al-Qadr', 98: 'Al-Bayyinah', 99: 'Az-Zalzalah', 100: 'Al-Adiyat',
  101: "Al-Qari'ah", 102: 'At-Takasur', 103: 'Al-Asr', 104: 'Al-Humazah', 105: 'Al-Fil',
  106: 'Quraisy', 107: "Al-Ma'un", 108: 'Al-Kausar', 109: 'Al-Kafirun', 110: 'An-Nasr',
  111: 'Al-Lahab', 112: 'Al-Ikhlas', 113: 'Al-Falaq', 114: 'An-Nas'
};

export default function SearchForm() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedSurah, setSelectedSurah] = useState('');
  const [surahList, setSurahList] = useState<Surah[]>([]);
  const [loadingSurah, setLoadingSurah] = useState(true);

  useEffect(() => {
    const fetchSurahList = async () => {
      try {
        const response = await fetch('/api/surah');
        const data = await response.json();
        if (Array.isArray(data)) {
          setSurahList(data);
        }
      } catch (err) {
        console.error('Failed to load surah list:', err);
      } finally {
        setLoadingSurah(false);
      }
    };
    fetchSurahList();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // PRIORITAS: Jika pilih surah, langsung ke halaman detail surah
    if (selectedSurah) {
      router.push(`/surah/${selectedSurah}`);
    } 
    else if (query.trim()) {
      router.push(`/search?q=${query}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Cari ayat, terjemahan, atau nama surah..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>
        <button 
          type="submit" 
          className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-xl font-semibold text-white"
        >
          🔍 Cari
        </button>
      </div>
      
      <div className="flex flex-wrap gap-3 items-center justify-center">
        <select
          value={selectedSurah}
          onChange={(e) => setSelectedSurah(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white"
        >
          <option value="">📖 Pilih Surah</option>
          {!loadingSurah && surahList.map((s) => {
            const surahName = surahNames[s.surah];
            return (
              <option key={s.surah} value={s.surah}>
                {s.surah}. {surahName || `Surah ${s.surah}`} ({s.ayat_count} ayat)
              </option>
            );
          })}
        </select>
        
        {selectedSurah && (
          <button
            type="button"
            onClick={() => setSelectedSurah('')}
            className="text-red-400 text-sm hover:text-red-600 transition"
          >
            ✕ Hapus filter
          </button>
        )}
      </div>
      
      <div className="text-xs text-gray-500 text-center">
        💡 Tips: Pilih surah dari dropdown → langsung lihat semua ayat surah tersebut
      </div>
    </form>
  );
}