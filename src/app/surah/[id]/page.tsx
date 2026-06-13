'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, BookOpen } from 'lucide-react';

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

export default function SurahDetailPage() {
  const params = useParams();
  const surahId = params?.id;
  const [verses, setVerses] = useState<Verse[]>([]);
  const [surahInfo, setSurahInfo] = useState<SurahInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!surahId) return;
    
    // Fetch surah info dan ayat-ayatnya
    Promise.all([
      fetch(`/api/search?q=surah ${surahId}`).then(res => res.json()),
      fetch(`/api/quran/surah/${surahId}`).then(res => res.json()).catch(() => ({}))
    ]).then(([searchData, surahData]) => {
      setVerses(searchData.results || []);
      if (searchData.surahInfo) {
        setSurahInfo(searchData.surahInfo);
      }
      setLoading(false);
    }).catch(err => {
      console.error('Error:', err);
      setLoading(false);
    });
  }, [surahId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Memuat surah...</p>
        </div>
      </div>
    );
  }

  if (!surahInfo) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">📖</div>
          <p className="text-gray-500 mb-4">Surah tidak ditemukan</p>
          <Link href="/surah" className="text-emerald-500 hover:text-emerald-400 transition">
            ← Kembali ke Daftar Surah
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1120] text-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link 
          href="/surah" 
          className="inline-flex items-center gap-1 text-emerald-500 hover:text-emerald-400 mb-6 transition"
        >
          <ChevronLeft className="w-4 h-4" /> Kembali ke Daftar Surah
        </Link>
        
        {/* Header Surah */}
        <div className="bg-gradient-to-r from-emerald-950/50 to-teal-950/50 border border-emerald-500/20 rounded-xl p-8 mb-8 text-center">
          <div className="text-6xl font-arabic text-emerald-500 mb-3">
            {surahInfo.arabic}
          </div>
          <h1 className="text-3xl font-bold text-white">
            {surahInfo.displayName}
          </h1>
          <p className="text-gray-400 mt-2">
            Surah ke-{surahInfo.number} | {surahInfo.meaning} | {verses.length} Ayat
          </p>
        </div>
        
        {/* Daftar Ayat */}
        <div className="space-y-4">
          {verses.map((verse) => {
            const showBasmalah = verse.ayah === 1 && verse.surah !== 9;
            
            return (
              <Link href={`/quran/${verse.surah}/${verse.ayah}`} key={verse.id}>
                <div className="group block bg-gray-900/30 border border-white/5 rounded-xl p-5 hover:bg-gray-900/50 hover:border-emerald-500/30 transition-all duration-200 cursor-pointer">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 flex items-center justify-center bg-emerald-500/10 rounded-lg text-emerald-500 font-bold text-sm">
                        {verse.ayah}
                      </div>
                      <span className="text-sm text-gray-500">Ayat</span>
                    </div>
                  </div>
                  
                  {showBasmalah && verse.ayah === 1 && (
                    <div className="text-center mb-4 pb-3 border-b border-white/10">
                      <div className="text-xl font-arabic text-emerald-500 mb-1">
                        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                      </div>
                      <div className="text-xs text-gray-500 italic">
                        "Dengan menyebut nama Allah Yang Maha Pengasih, Maha Penyayang"
                      </div>
                    </div>
                  )}
                  
                  <div className="text-right text-2xl font-arabic mb-4 leading-loose text-gray-200">
                    {verse.arabic}
                  </div>
                  <div className="text-gray-400 leading-relaxed">
                    {verse.translation}
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-600">
                      QS. {verse.surah}:{verse.ayah}
                    </span>
                    <span className="text-xs text-emerald-500 opacity-0 group-hover:opacity-100 transition">
                      Baca →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center">
          <Link 
            href="/surah"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-emerald-500 transition text-sm"
          >
            <BookOpen className="w-4 h-4" /> Lihat semua surah
          </Link>
        </div>
      </div>
    </div>
  );
}