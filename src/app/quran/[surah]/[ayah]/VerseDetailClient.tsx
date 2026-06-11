'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useFontSize } from '@/contexts/FontSizeContext';
import SkeletonDetail from '@/components/ui/skeleton/SkeletonDetail';
import ErrorAlert from '@/components/ui/ErrorAlert';
import BookmarkButton from '@/components/BookmarkButton';
import AudioPlayer from '@/components/AudioPlayer';
import ExportPDF from '@/components/ExportPDF';
import AudioPlayerSurah from '@/components/AudioPlayerSurah';

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

interface Tafsir {
  id: number;
  source: string;
  content: string;
}

interface Navigation {
  next: { surah: number; ayah: number } | null;
  prev: { surah: number; ayah: number } | null;
}

interface Props {
  surah: string;
  ayah: string;
}

export default function VerseDetailClient({ surah, ayah }: Props) {
  const { data: session } = useSession();
  const { theme } = useTheme();
  const { fontSize, arabicFontSize, setArabicFontSize } = useFontSize();
  const [verse, setVerse] = useState<Verse | null>(null);
  const [surahInfo, setSurahInfo] = useState<SurahInfo | null>(null);
  const [tafsirList, setTafsirList] = useState<Tafsir[]>([]);
  const [navigation, setNavigation] = useState<Navigation>({ next: null, prev: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (surah && ayah) {
        setLoading(true);
        setError(null);
        
        try {
          // Fetch detail ayat
          const response = await fetch(`/api/quran/${surah}/${ayah}`);
          if (!response.ok) throw new Error('Gagal memuat ayat');
          const data = await response.json();
          setVerse(data.verse);
          setTafsirList(data.tafsir || []);
          setNavigation(data.navigation || { next: null, prev: null });
          
          // Fetch info surah
          const surahResponse = await fetch(`/api/search?q=surah ${surah}`);
          if (!surahResponse.ok) throw new Error('Gagal memuat info surah');
          const surahData = await surahResponse.json();
          if (surahData.isSurahSearch && surahData.surahInfo) {
            setSurahInfo(surahData.surahInfo);
          }
        } catch (error) {
          console.error('Error fetching verse:', error);
          setError(error instanceof Error ? error.message : 'Terjadi kesalahan');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [surah, ayah]);

  if (loading) return <SkeletonDetail />;
  
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <ErrorAlert 
          message={error} 
          onRetry={() => window.location.reload()} 
        />
      </div>
    );
  }

  if (!verse) {
    return <div className="text-center mt-10">Ayat tidak ditemukan</div>;
  }

  const isFirstAyah = verse.ayah === 1;
  const showBasmalah = isFirstAyah && verse.surah !== 9;

  return (
    <div id="verse-content" className="max-w-4xl mx-auto p-6">
      {/* Navigation with Font Size Controls & Export PDF */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <Link href="/search" className="text-emerald-600 dark:text-emerald-400 hover:underline">
          ← Kembali
        </Link>
        
        <div className="flex items-center gap-4">
          {/* Export PDF Button */}
          {verse && (
            <ExportPDF 
              elementId="verse-content" 
              fileName={`QS_${verse.surah}_${verse.ayah}`} 
            />
          )}
          
          {/* Font Size Controls */}
          {mounted && (
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setArabicFontSize('text-xl')}
                className={`px-3 py-1 rounded-md text-sm transition ${
                  arabicFontSize === 'text-xl' 
                    ? 'bg-emerald-600 text-white' 
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                A-
              </button>
              <button
                onClick={() => setArabicFontSize('text-2xl')}
                className={`px-3 py-1 rounded-md text-sm transition ${
                  arabicFontSize === 'text-2xl' 
                    ? 'bg-emerald-600 text-white' 
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                A
              </button>
              <button
                onClick={() => setArabicFontSize('text-3xl')}
                className={`px-3 py-1 rounded-md text-sm transition ${
                  arabicFontSize === 'text-3xl' 
                    ? 'bg-emerald-600 text-white' 
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                A+
              </button>
            </div>
          )}
          
          {/* Navigation Links */}
          <div className="flex gap-4">
            {navigation.prev && (
              <Link
                href={`/quran/${navigation.prev.surah}/${navigation.prev.ayah}`}
                className="text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                ← Sebelumnya
              </Link>
            )}
            {navigation.next && (
              <Link
                href={`/quran/${navigation.next.surah}/${navigation.next.ayah}`}
                className="text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Selanjutnya →
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* Header Surah untuk ayat pertama */}
   {isFirstAyah && surahInfo && (
  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl p-5 mb-6 text-center">
    <div className="text-5xl font-arabic text-emerald-700 dark:text-emerald-400 mb-2">
      {surahInfo.arabic}
    </div>
    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
      {surahInfo.displayName}
    </h1>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
      Surah ke-{surahInfo.number} | {surahInfo.meaning}
    </p>
    
    {/* TAMBAHKAN PLAY FULL SURAH - HANYA DI AYAT 1 */}
    <div className="mt-4 flex justify-center">
      <AudioPlayerSurah 
        surah={verse.surah} 
        surahName={surahInfo.latin} 
        totalAyah={verse.surah === 1 ? 7 : verse.surah === 2 ? 286 : 100} 
      />
    </div>
  </div>
)}
      
      {/* Basmalah (hanya untuk ayat 1, kecuali surah 9) */}
      {showBasmalah && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 text-center border border-gray-100 dark:border-gray-700">
          <div className="text-3xl font-arabic text-emerald-700 dark:text-emerald-400 mb-2">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 italic">
            "Dengan menyebut nama Allah Yang Maha Pengasih, Maha Penyayang"
          </div>
        </div>
      )}
      
      {/* Ayat dengan Bookmark Button dan Audio Player */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-semibold text-sm">
              {verse.ayah}
            </div>
            <BookmarkButton verseId={verse.id} />
          </div>
          <AudioPlayer surah={verse.surah} ayah={verse.ayah} />
        </div>
        
        {/* Teks Arab dengan ukuran yang bisa diubah */}
        <div className={`text-right ${arabicFontSize} font-arabic mb-6 leading-loose text-gray-800 dark:text-gray-200`}>
          {verse.arabic}
        </div>
        
        {/* Terjemahan dengan ukuran yang bisa diubah */}
        <div className={`text-gray-700 dark:text-gray-300 ${fontSize} leading-relaxed`}>
          {verse.translation}
        </div>
        <div className="text-sm text-gray-400 dark:text-gray-500 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
          QS. {verse.surah}:{verse.ayah}
        </div>
      </div>

      {/* Tafsir */}
      {tafsirList.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
            <span>📖</span> Tafsir
          </h2>
          {tafsirList.map((tafsir) => (
            <div key={tafsir.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-5 mb-4 border-l-4 border-emerald-500">
              <h3 className="font-semibold text-emerald-700 dark:text-emerald-400 mb-2">{tafsir.source}</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{tafsir.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}