import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Pool } from 'pg';
import { ChevronLeft, BookOpen, Search } from 'lucide-react';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
});
async function getTafsir(id: string) {
  try {
    const result = await pool.query(
      `SELECT 
        t.id, 
        t.content, 
        t.source,
        q.surah, 
        q.ayah, 
        q.arabic, 
        q.translation
      FROM tafsir t
      JOIN quran_verses q ON q.id = t.verse_id
      WHERE t.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) return null;
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching tafsir:', error);
    return null;
  }
}

export default async function TafsirDetailPage({ params }: { params: { id: string } }) {
  const tafsir = await getTafsir(params.id);
  
  if (!tafsir) {
    return notFound();
  }
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Tombol kembali */}
        <Link 
          href="/search" 
          className="inline-flex items-center gap-1 text-emerald-500 hover:text-emerald-400 text-sm mb-6 transition"
        >
          <ChevronLeft className="w-4 h-4" /> Kembali ke Pencarian
        </Link>
        
        {/* Card Utama */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Header - Gradient */}
          <div className="bg-gradient-to-r from-purple-700 to-indigo-700 px-6 py-5">
            <h1 className="text-2xl font-bold text-white mb-1">
              📚 Tafsir {tafsir.source}
            </h1>
            <div className="flex items-center gap-3 text-sm text-purple-200">
              <span>QS. {tafsir.surah}:{tafsir.ayah}</span>
              <span>•</span>
              <Link 
                href={`/quran/${tafsir.surah}/${tafsir.ayah}`} 
                className="hover:text-white transition"
              >
                Lihat Ayat →
              </Link>
            </div>
          </div>
          
          {/* Teks Arab & Terjemahan */}
          <div className="bg-emerald-950/30 border-b border-border px-6 py-5">
            <div className="text-right text-2xl font-arabic leading-loose text-foreground">
              {tafsir.arabic}
            </div>
            <div className="text-muted-foreground mt-3 text-sm italic">
              {tafsir.translation}
            </div>
          </div>
          
          {/* Isi Tafsir */}
          <div className="px-6 py-6">
            <h2 className="font-semibold text-lg text-purple-400 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" /> Penjelasan Tafsir
            </h2>
            <div className="text-foreground/80 leading-relaxed whitespace-pre-line">
              {tafsir.content}
            </div>
          </div>
          
          {/* Footer Navigasi */}
          <div className="bg-card border-t border-border px-6 py-4 flex justify-between items-center">
            <Link 
              href="/search" 
              className="inline-flex items-center gap-1 text-emerald-500 hover:text-emerald-400 text-sm transition"
            >
              <Search className="w-4 h-4" /> Cari Lagi
            </Link>
            <Link 
              href={`/quran/${tafsir.surah}/${tafsir.ayah}`} 
              className="text-emerald-500 hover:text-emerald-400 text-sm transition"
            >
              📖 Baca Ayat Selengkapnya →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}