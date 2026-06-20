'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Heart, Share2, Copy, Check, Bookmark } from 'lucide-react';

interface Doa {
  id: number;
  title: string;
  arabic: string;
  latin: string;
  translation: string;
  source?: string;
  description?: string;
}

export default function DoaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  
  const [doa, setDoa] = useState<Doa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    fetch(`/api/doa/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Doa tidak ditemukan');
        return res.json();
      })
      .then(data => {
        setDoa(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const copyToClipboard = async () => {
    if (!doa) return;
    const text = `${doa.arabic}\n\n${doa.latin}\n\n${doa.translation}\n\n${doa.source ? `Sumber: ${doa.source}` : ''}\n\n🤲 Kajiin - Doa Harian`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const shareContent = async () => {
    if (!doa) return;
    const text = `${doa.title}\n\n${doa.translation.substring(0, 200)}...\n\nBaca selengkapnya di Kajiin`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: doa.title,
          text: text,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      copyToClipboard();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Memuat doa...</p>
        </div>
      </div>
    );
  }

  if (error || !doa) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <p className="text-red-500 mb-4">{error || 'Doa tidak ditemukan'}</p>
          <Link href="/doa" className="text-emerald-500 hover:text-emerald-400 transition">
            ← Kembali ke Daftar Doa
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1120] text-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Navigation */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/doa" className="text-emerald-500 hover:text-emerald-400 text-sm inline-flex items-center gap-1 transition">
            <ChevronLeft className="w-4 h-4" /> Kembali ke Daftar Doa
          </Link>
          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className="p-2 rounded-full hover:bg-gray-800 transition"
              title="Salin doa"
            >
              {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
            </button>
            <button
              onClick={shareContent}
              className="p-2 rounded-full hover:bg-gray-800 transition"
              title="Bagikan"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              className="p-2 rounded-full hover:bg-gray-800 transition"
              title="Simpan"
            >
              <Bookmark className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Doa Card */}
        <div className="bg-gray-900/30 border border-white/10 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-white/80" />
              <h1 className="text-xl font-bold text-white">
                {doa.title}
              </h1>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Arabic Text */}
            <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-6">
              <div className="text-right text-3xl font-arabic leading-loose text-gray-200">
                {doa.arabic}
              </div>
            </div>

            {/* Latin */}
            <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-emerald-500 mb-2">📖 Latin</h3>
              <p className="text-gray-300 italic">
                {doa.latin}
              </p>
            </div>

            {/* Translation */}
            <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-emerald-500 mb-2">🌙 Artinya</h3>
              <p className="text-gray-300 leading-relaxed">
                {doa.translation}
              </p>
            </div>

            {/* Source */}
            {doa.source && (
              <div className="text-sm text-gray-500 pt-2 border-t border-gray-800">
                <span className="font-medium">📚 Sumber:</span> {doa.source}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-900/50 border-t border-white/10 px-6 py-4">
            <p className="text-xs text-gray-500 text-center">
              🤲 Semoga Allah menerima doa dan amal ibadah kita
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}