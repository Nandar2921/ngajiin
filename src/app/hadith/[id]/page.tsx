'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Hadith {
  id: number;
  number: number;
  arabic: string;
  translation: string;
  narrator: string;
  grade: string;
  reference: string;
  book_name: string;
  created_at: string;
}

export default function HadithDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [hadith, setHadith] = useState<Hadith | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    fetch(`/api/hadith/${id}`)
      .then(res => {
        if (res.status === 404) throw new Error('Hadits tidak ditemukan');
        if (!res.ok) throw new Error('Gagal memuat data');
        return res.json();
      })
      .then(data => {
        if (data.error) throw new Error(data.error);
        setHadith(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mt-10">Loading...</div>
      </div>
    );
  }

  if (error || !hadith) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mt-10">
          <p className="text-red-600">{error || 'Hadits tidak ditemukan'}</p>
          <Link href="/hadith" className="text-emerald-600 hover:underline mt-4 inline-block">
            ← Kembali ke Daftar Hadits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link href="/hadith" className="text-emerald-600 hover:underline mb-4 inline-flex items-center gap-1">
        <span>←</span> Kembali ke Daftar Hadits
      </Link>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Hadits ke-{hadith.number}</h1>
            <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm">
              {hadith.grade || 'Shahih'}
            </span>
          </div>
          <p className="text-emerald-100 text-sm mt-1">{hadith.book_name}</p>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-lg p-6 mb-6 text-right">
            <div className="text-2xl md:text-3xl font-arabic leading-loose text-gray-800 dark:text-gray-200">
              {hadith.arabic}
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <span>📖</span> Terjemahan
            </h2>
            <div className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {hadith.translation}
            </div>
          </div>
          
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-3">
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-gray-500">📜 Perawi:</span>
                <span className="ml-2 text-gray-700 dark:text-gray-300 font-medium">
                  {hadith.narrator || '-'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">📚 Referensi:</span>
                <span className="ml-2 text-gray-700 dark:text-gray-300 font-medium">
                  {hadith.reference || '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="border-t border-gray-100 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-900 flex justify-between">
          {hadith.id > 1 && (
            <Link 
              href={`/hadith/${hadith.id - 1}`}
              className="text-emerald-600 hover:underline flex items-center gap-1"
            >
              ← Hadits Sebelumnya
            </Link>
          )}
          <Link 
            href="/hadith"
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            Daftar
          </Link>
          {hadith.id < 42 && (
            <Link 
              href={`/hadith/${hadith.id + 1}`}
              className="text-emerald-600 hover:underline flex items-center gap-1 ml-auto"
            >
              Hadits Selanjutnya →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}