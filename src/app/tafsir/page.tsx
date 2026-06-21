'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight, BookOpen, Filter } from 'lucide-react';

interface TafsirItem {
  id: number;
  surah: number;
  ayah: number;
  source: string;
  content: string;
  arabic: string;
  translation: string;
}

// Daftar sumber tafsir (nanti bisa ditambah)
const sources = [
  { id: 'all', name: 'Semua Sumber', color: 'emerald' },
  { id: 'Kemenag', name: 'Tafsir Kemenag', color: 'purple' },
  { id: 'Ibnu Katsir', name: 'Tafsir Ibnu Katsir', color: 'blue' },
  { id: 'Jalalain', name: 'Tafsir Jalalain', color: 'teal' },
  { id: 'Al-Misbah', name: 'Tafsir Al-Misbah', color: 'orange' },
  { id: 'Al-Azhar', name: 'Tafsir Al-Azhar', color: 'pink' },
];

export default function TafsirListPage() {
  const [tafsirList, setTafsirList] = useState<TafsirItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetchTafsir = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedSource !== 'all') params.set('source', selectedSource);
    params.set('page', currentPage.toString());
    params.set('limit', limit.toString());
    
    try {
      const res = await fetch(`/api/tafsir?${params.toString()}`);
      const data = await res.json();
      
      if (data.data && Array.isArray(data.data)) {
        setTafsirList(data.data);
        setTotal(data.pagination?.total || 0);
        setTotalPages(data.pagination?.totalPages || 1);
      } else if (Array.isArray(data)) {
        setTafsirList(data);
        setTotal(data.length);
        setTotalPages(Math.ceil(data.length / limit));
      } else {
        setTafsirList([]);
        setTotal(0);
      }
    } catch (err) {
      console.error('Error fetching tafsir:', err);
      setTafsirList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTafsir();
  }, [searchTerm, selectedSource, currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchTafsir();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedSource('all');
    setCurrentPage(1);
  };

  const getSourceColor = (sourceName: string) => {
    const source = sources.find(s => s.name === sourceName);
    const colorMap: Record<string, string> = {
      'Kemenag': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      'Ibnu Katsir': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      'Jalalain': 'text-teal-400 bg-teal-500/10 border-teal-500/20',
      'Al-Misbah': 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      'Al-Azhar': 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    };
    return colorMap[sourceName] || 'text-muted-foreground bg-muted border-border';
  };

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat tafsir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-500 mb-2">
            📚 Kumpulan Tafsir
          </h1>
          <p className="text-muted-foreground">
            {total.toLocaleString()} tafsir dari berbagai sumber
          </p>
        </div>

        {/* Filter & Search Section */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari tafsir (contoh: surat, kata kunci)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl focus:outline-none focus:border-emerald-500 text-foreground placeholder:text-muted-foreground/60"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition font-medium"
            >
              Cari
            </button>
          </div>
        </div>

        {/* Filter Sumber Tafsir */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter Sumber Tafsir:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sources.map((source) => (
              <button
                key={source.id}
                onClick={() => setSelectedSource(source.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedSource === source.id
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-muted text-muted-foreground hover:bg-muted/70'
                }`}
              >
                {source.name}
              </button>
            ))}
          </div>
        </div>

        {/* Reset Button */}
        {(searchTerm || selectedSource !== 'all') && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={handleReset}
              className="text-sm text-emerald-500 hover:text-emerald-400 transition flex items-center gap-1"
            >
              <span>✕</span> Reset filter
            </button>
          </div>
        )}

        {/* Pagination Top */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mb-6">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-muted hover:bg-muted/70 disabled:opacity-50 disabled:hover:bg-muted transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-muted-foreground">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-muted hover:bg-muted/70 disabled:opacity-50 disabled:hover:bg-muted transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Tafsir List */}
        {tafsirList.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-muted-foreground">Tidak ada tafsir ditemukan</p>
            {(searchTerm || selectedSource !== 'all') && (
              <button
                onClick={handleReset}
                className="mt-4 text-emerald-500 hover:text-emerald-400 transition"
              >
                Reset filter →
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {tafsirList.map((tafsir) => (
              <Link href={`/tafsir/${tafsir.id}`} key={tafsir.id}>
                <div className="group block bg-card/70 border border-border/60 rounded-xl p-5 hover:bg-card hover:border-emerald-500/30 transition-all duration-200 cursor-pointer">
                  <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-500" />
                      <span className="text-emerald-500 font-semibold">
                        QS. {tafsir.surah}:{tafsir.ayah}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full border ${getSourceColor(tafsir.source)}`}>
                      {tafsir.source}
                    </span>
                  </div>
                  <div className="text-right text-sm font-arabic mb-2 text-muted-foreground">
                    {tafsir.arabic?.substring(0, 100)}...
                  </div>
                  <div className="text-muted-foreground leading-relaxed text-sm line-clamp-3">
                    {tafsir.content.substring(0, 200)}...
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground/60">
                    {tafsir.translation?.substring(0, 80)}...
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination Bottom */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-6">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-muted hover:bg-muted/70 disabled:opacity-50 disabled:hover:bg-muted transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-muted-foreground">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-muted hover:bg-muted/70 disabled:opacity-50 disabled:hover:bg-muted transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}