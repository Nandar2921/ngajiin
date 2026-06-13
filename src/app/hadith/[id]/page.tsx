'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, BookOpen, User, Info } from 'lucide-react';

interface Hadith {
  id: number;
  number: number;
  arabic: string;
  translation: string;
  narrator: string;
  grade: string;
  reference: string;
  book_name: string;
}

export default function HadithDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [hadith, setHadith] = useState<Hadith | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSanad, setShowSanad] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    fetch(`/api/hadith/${id}`)
      .then(res => res.json())
      .then(data => {
        setHadith(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Memuat hadits...</p>
        </div>
      </div>
    );
  }

  if (!hadith) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-gray-500 mb-4">Hadits tidak ditemukan</p>
          <Link href="/hadith" className="text-emerald-500 hover:text-emerald-400">
            ← Kembali ke Daftar Hadits
          </Link>
        </div>
      </div>
    );
  }

  const isSanadAvailable = hadith.arabic && hadith.arabic.length > 100;

  return (
    <div className="min-h-screen bg-[#0b1120] text-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link 
          href="/hadith" 
          className="inline-flex items-center gap-1 text-emerald-500 hover:text-emerald-400 mb-6 transition"
        >
          <ChevronLeft className="w-4 h-4" /> Kembali ke Daftar Hadits
        </Link>
        
        {/* Card Utama */}
        <div className="bg-gray-900/30 border border-white/10 rounded-xl overflow-hidden">
          {/* Header - Gradient */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h1 className="text-2xl font-bold text-white">
                Hadits ke-{hadith.number}
              </h1>
              <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm font-medium">
                {hadith.grade || 'Shahih'}
              </span>
            </div>
            <p className="text-emerald-100 text-sm mt-2 opacity-80">{hadith.book_name}</p>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {/* Teks Arab */}
            <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-6 mb-6">
              <div className="text-right text-2xl md:text-3xl font-arabic leading-loose text-gray-200">
                {hadith.arabic}
              </div>
            </div>
            
            {/* Terjemahan */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-emerald-500 mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5" /> Terjemahan
              </h2>
              <div className="text-gray-300 leading-relaxed">
                {hadith.translation}
              </div>
            </div>
            
            {/* Informasi Tambahan */}
            <div className="border-t border-white/10 pt-5 space-y-3">
              <div className="flex flex-wrap gap-5 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-500">Perawi:</span>
                  <span className="text-gray-300 font-medium">
                    {hadith.narrator || '-'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-500">Referensi:</span>
                  <span className="text-gray-300 font-medium">
                    {hadith.reference || '-'}
                  </span>
                </div>
              </div>

              {/* Sanad - Rantai Perawi */}
              {isSanadAvailable && (
                <div className="mt-4 pt-3 border-t border-white/10">
                  <button
                    onClick={() => setShowSanad(!showSanad)}
                    className="text-emerald-500 hover:text-emerald-400 text-sm flex items-center gap-1 transition"
                  >
                    <span>{showSanad ? '▼' : '▶'}</span>
                    <span>📜 Lihat Sanad (Rantai Perawi)</span>
                  </button>
                  
                  {showSanad && (
                    <div className="mt-3 p-4 bg-gray-900/50 border border-white/10 rounded-lg">
                      <h3 className="text-sm font-semibold text-emerald-500 mb-2">Sanad Hadits:</h3>
                      <div className="text-right font-arabic text-base leading-loose text-gray-300">
                        {hadith.arabic}
                      </div>
                      <p className="text-xs text-gray-500 mt-3 italic">
                        *Sanad adalah rantai periwayat yang menyampaikan hadits ini dari generasi ke generasi
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Navigation */}
          <div className="border-t border-white/10 px-6 py-4 bg-gray-900/20 flex justify-between items-center">
            {hadith.number > 1 ? (
              <Link 
                href={`/hadith/${hadith.id - 1}`}
                className="flex items-center gap-1 text-emerald-500 hover:text-emerald-400 transition"
              >
                <ChevronLeft className="w-4 h-4" /> Hadits Sebelumnya
              </Link>
            ) : (
              <div></div>
            )}
            
            <Link 
              href="/hadith"
              className="text-gray-500 hover:text-gray-400 text-sm transition"
            >
              Daftar
            </Link>
            
            {hadith.number < 42 && (
              <Link 
                href={`/hadith/${hadith.id + 1}`}
                className="flex items-center gap-1 text-emerald-500 hover:text-emerald-400 transition ml-auto"
              >
                Hadits Selanjutnya <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}