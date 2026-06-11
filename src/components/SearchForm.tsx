'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface Surah {
  surah: number;
  ayat_count: number;
}

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
    
    if (selectedSurah) {
      router.push(`/search?q=surah ${selectedSurah}`);
    } 
    else if (query.trim()) {
      router.push(`/search?q=${query}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Cari apa saja... Quran, Hadits, Tafsir, atau Topik Islami..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-3 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        <Button 
          type="submit" 
          className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-xl font-semibold"
        >
          <span className="hidden sm:inline">🔍 Cari</span>
          <span className="sm:hidden">🔍</span>
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-3 items-center justify-center">
        <select
          value={selectedSurah}
          onChange={(e) => setSelectedSurah(e.target.value)}
          className="border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="">Semua Surah</option>
          {!loadingSurah && surahList.map((s) => (
            <option key={s.surah} value={s.surah}>
              {s.surah}. Surah {s.surah} ({s.ayat_count} ayat)
            </option>
          ))}
        </select>
        
        {selectedSurah && (
          <button
            type="button"
            onClick={() => setSelectedSurah('')}
            className="text-red-400 text-sm hover:text-red-600 transition"
          >
            ✕ Hapus
          </button>
        )}
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        💡 Cari: "Allah", "Yasin", "niat", "iman", "shahih" - Hasil dari Quran, Hadits, dan Tafsir
      </div>
    </form>
  );
}