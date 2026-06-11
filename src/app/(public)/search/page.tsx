'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import SearchForm from '@/components/SearchForm';
import SkeletonSearch from '@/components/ui/skeleton/SkeletonSearch';
import ErrorAlert from '@/components/ui/ErrorAlert';
import { useSession } from 'next-auth/react';

// Interface untuk hasil Unified Search
interface UnifiedResult {
  id: number;
  type: 'quran' | 'hadith' | 'tafsir';
  category: string;
  surah?: number;
  ayah?: number;
  arabic?: string;
  translation: string;
  narrator?: string;
  source?: string;
  content?: string;
  reference: string;
}

interface UnifiedSearchResponse {
  keyword: string;
  total: number;
  results: UnifiedResult[];
  counts: {
    quran: number;
    hadith: number;
    tafsir: number;
  };
}

// Interface untuk Quran Search (existing)
interface Verse {
  id: number;
  surah: number;
  ayah: number;
  arabic: string;
  translation: string;
}

interface SurahInfo {
  number: number;
  latin: string;
  arabic: string;
  meaning: string;
  displayName: string;
}

interface SearchResult {
  results: Verse[];
  total: number;
  page: number;
  totalPages: number;
  keyword: string;
  isSurahSearch?: boolean;
  matchedSurah?: number;
  surahInfo?: SurahInfo;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q');
  const currentPage = parseInt(searchParams.get('page') || '1');
  
  const [unifiedData, setUnifiedData] = useState<UnifiedSearchResponse | null>(null);
  const [quranData, setQuranData] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const { data: session } = useSession();

  useEffect(() => {
    if (!q || q.length < 2) {
      setUnifiedData(null);
      setQuranData(null);
      setLoading(false);
      setError(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    // Fetch unified search (Quran + Hadith + Tafsir)
    const unifiedParams = new URLSearchParams();
    unifiedParams.set('q', q);
    
    // Fetch quran search (untuk pagination dan surah info)
    const quranParams = new URLSearchParams();
    quranParams.set('q', q);
    quranParams.set('page', currentPage.toString());
    
    Promise.all([
      fetch(`/api/search/unified?${unifiedParams.toString()}`).then(res => res.json()),
      fetch(`/api/search?${quranParams.toString()}`).then(res => res.json())
    ])
      .then(([unified, quran]) => {
        setUnifiedData(unified);
        setQuranData(quran);
      })
      .catch((err) => {
        console.error('Search error:', err);
        setError(err.message || 'Terjadi kesalahan saat mencari. Silakan coba lagi.');
      })
      .finally(() => setLoading(false));
  }, [q, currentPage]);

  // Save search history
  useEffect(() => {
    if (q && !loading && unifiedData && session) {
      fetch('/api/search-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: q }),
      }).catch(console.error);
    }
  }, [q, loading, unifiedData, session]);

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <ErrorAlert 
          message={error} 
          onRetry={() => {
            setError(null);
            setLoading(true);
            window.location.reload();
          }}
        />
      </div>
    );
  }

  if (!q || q.length < 2) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">🔍 Pencarian Universal</h1>
        <SearchForm />
        
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h2 className="font-semibold mb-2 text-gray-900 dark:text-white">💡 Cari Semua Konten:</h2>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <li>📖 <strong>Quran</strong> - Ayat dan terjemahan</li>
            <li>📜 <strong>Hadits</strong> - Hadits pilihan</li>
            <li>📚 <strong>Tafsir</strong> - Penjelasan ayat</li>
          </ul>
        </div>
      </div>
    );
  }

  if (loading) return <SkeletonSearch />;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quran': return '📖';
      case 'hadith': return '📜';
      case 'tafsir': return '📚';
      default: return '📄';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'quran': return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30';
      case 'hadith': return 'border-blue-500 bg-blue-50 dark:bg-blue-950/30';
      case 'tafsir': return 'border-purple-500 bg-purple-50 dark:bg-purple-950/30';
      default: return 'border-gray-500 bg-gray-50 dark:bg-gray-800';
    }
  };

  const filteredResults = activeTab === 'all' 
    ? unifiedData?.results || [] 
    : unifiedData?.results.filter(r => r.type === activeTab) || [];

  // Tampilkan hasil Quran biasa jika tidak ada unified data
  if (!unifiedData || unifiedData.total === 0) {
    if (!quranData || quranData.results.length === 0) {
      return (
        <div className="text-center mt-10">
          <p className="text-gray-900 dark:text-white">Tidak ditemukan konten yang cocok dengan kata kunci "{q}".</p>
          <Link href="/search" className="text-emerald-600 hover:underline mt-4 inline-block">
            ← Kembali ke Pencarian
          </Link>
        </div>
      );
    }

    // Tampilkan hasil Quran biasa
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/search" className="text-emerald-600 dark:text-emerald-400 hover:underline text-sm mb-4 inline-block">
            ← Pencarian Baru
          </Link>
          
          <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Hasil pencarian: "{q}"</h1>
          
          {quranData.isSurahSearch && quranData.matchedSurah && quranData.surahInfo && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border border-emerald-200 dark:border-emerald-800 p-4 rounded-lg mb-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-arabic text-emerald-800 dark:text-emerald-300">
                  {quranData.surahInfo.arabic}
                </div>
                <div>
                  <div className="font-bold text-xl text-emerald-800 dark:text-emerald-300">
                    {quranData.surahInfo.displayName}
                  </div>
                  <div className="text-sm text-emerald-600 dark:text-emerald-400">
                    Surah ke-{quranData.surahInfo.number} | {quranData.total} ayat
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <p className="text-sm text-gray-500 dark:text-gray-400">Ditemukan {quranData.total} ayat</p>
        </div>
        
        <div className="space-y-4">
          {quranData.results.map((verse: Verse) => {
            const isFirstAyah = verse.ayah === 1;
            const showBasmalah = isFirstAyah && verse.surah !== 9;
            
            return (
              <Link href={`/quran/${verse.surah}/${verse.ayah}`} key={verse.id}>
                <div className="p-5 border rounded-xl hover:shadow-lg transition cursor-pointer 
                              bg-white dark:bg-gray-800 
                              border-gray-100 dark:border-gray-700
                              hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      Ayat {verse.ayah}
                    </span>
                  </div>
                  
                  {showBasmalah && (
                    <div className="text-center mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
                      <div className="text-2xl font-arabic text-emerald-600 dark:text-emerald-400 mb-1">
                        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 italic">
                        "Dengan menyebut nama Allah Yang Maha Pengasih, Maha Penyayang"
                      </div>
                    </div>
                  )}
                  
                  <div className="text-right text-2xl font-arabic mb-4 leading-loose text-gray-800 dark:text-gray-200">
                    {verse.arabic}
                  </div>
                  <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {verse.translation}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                    QS. {verse.surah}:{verse.ayah}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {quranData.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <Link
              href={`/search?q=${q}&page=${currentPage - 1}`}
              className={`px-4 py-2 border rounded-md transition
                ${currentPage === 1 
                  ? 'opacity-50 pointer-events-none border-gray-200 dark:border-gray-700 text-gray-400' 
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              ← Sebelumnya
            </Link>
            <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
              Halaman {quranData.page} dari {quranData.totalPages}
            </span>
            <Link
              href={`/search?q=${q}&page=${currentPage + 1}`}
              className={`px-4 py-2 border rounded-md transition
                ${currentPage === quranData.totalPages 
                  ? 'opacity-50 pointer-events-none border-gray-200 dark:border-gray-700 text-gray-400' 
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              Selanjutnya →
            </Link>
          </div>
        )}
      </div>
    );
  }

  // Tampilkan Unified Search Results (Quran + Hadith + Tafsir)
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/search" className="text-emerald-600 dark:text-emerald-400 hover:underline text-sm mb-4 inline-block">
          ← Pencarian Baru
        </Link>
        
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">🔍 Hasil pencarian: "{q}"</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Ditemukan {unifiedData.total} hasil dari Quran, Hadits, dan Tafsir</p>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 ${activeTab === 'all' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-500'}`}
          >
            Semua ({unifiedData.total})
          </button>
          <button
            onClick={() => setActiveTab('quran')}
            className={`px-4 py-2 ${activeTab === 'quran' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-500'}`}
          >
            📖 Quran ({unifiedData.counts.quran})
          </button>
          <button
            onClick={() => setActiveTab('hadith')}
            className={`px-4 py-2 ${activeTab === 'hadith' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-500'}`}
          >
            📜 Hadits ({unifiedData.counts.hadith})
          </button>
          <button
            onClick={() => setActiveTab('tafsir')}
            className={`px-4 py-2 ${activeTab === 'tafsir' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-500'}`}
          >
            📚 Tafsir ({unifiedData.counts.tafsir})
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredResults.map((result, idx) => (
          <Link
            key={`${result.type}-${result.id}-${idx}`}
            href={result.type === 'quran' 
              ? `/quran/${result.surah}/${result.ayah}` 
              : result.type === 'hadith' 
                ? `/hadith/${result.id}`
                : `/quran/${result.surah}/${result.ayah}`}
          >
            <div className={`p-5 border-l-4 rounded-xl hover:shadow-lg transition cursor-pointer bg-white dark:bg-gray-800 ${getTypeColor(result.type)}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{getTypeIcon(result.type)}</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700">
                  {result.category}
                </span>
                <span className="text-xs text-gray-400">{result.reference}</span>
              </div>
              
              {result.arabic && (
                <div className="text-right text-lg font-arabic mb-2 text-gray-800 dark:text-gray-200">
                  {result.arabic}
                </div>
              )}
              
              <div className="text-gray-700 dark:text-gray-300">
                {result.type === 'tafsir' ? result.content : result.translation}
              </div>
              
              {result.narrator && (
                <div className="text-xs text-gray-400 mt-2">
                  Perawi: {result.narrator}
                </div>
              )}
              {result.source && (
                <div className="text-xs text-gray-400 mt-1">
                  Sumber: {result.source}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {filteredResults.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          Tidak ditemukan hasil untuk "{q}" di kategori ini
        </div>
      )}
    </div>
  );
}