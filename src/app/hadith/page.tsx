'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface Hadith {
  id: number;
  number: number;
  arabic: string;
  translation: string;
  narrator: string;
  grade: string;
  book_name: string;
  book_id: number;
}

interface Book {
  id: number;
  name: string;
  name_indonesian: string;
  slug: string;
}

export default function HadithPage() {
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [books, setBooks] = useState<Book[]>([]);
  const limit = 20;

  // Fetch books
  useEffect(() => {
    fetch('/api/hadith/books')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch books');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setBooks(data);
        }
      })
      .catch(err => console.error('Error fetching books:', err));
  }, []);

  // Fetch hadiths
  const fetchHadiths = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedBook) params.set('bookId', selectedBook);
    params.set('page', currentPage.toString());
    params.set('limit', limit.toString());
    
    try {
      const res = await fetch(`/api/hadith?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch hadiths');
      
      const data = await res.json();
      
      if (data.data && Array.isArray(data.data)) {
        setHadiths(data.data);
        setTotal(data.pagination?.total || data.data.length);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        setHadiths([]);
        setTotal(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching hadiths:', err);
      setHadiths([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHadiths();
  }, [search, selectedBook, currentPage]);

  const handleSearch = () => {
    setSearch(inputValue);
    setCurrentPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleReset = () => {
    setInputValue('');
    setSearch('');
    setSelectedBook('');
    setCurrentPage(1);
  };

  const handleBookFilter = (bookId: string) => {
    setSelectedBook(bookId === selectedBook ? '' : bookId);
    setCurrentPage(1);
  };

  if (loading && currentPage === 1 && hadiths.length === 0) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Memuat hadits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1120] text-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-emerald-500 hover:text-emerald-400 text-sm inline-flex items-center gap-1 mb-2 transition">
            ← Beranda
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-500 mb-2">
            📜 Kumpulan Hadits
          </h1>
          <p className="text-gray-500">
            {total > 0 ? `${total.toLocaleString()} hadits dari berbagai kitab` : 'Memuat data...'}
          </p>
        </div>
        
        {/* Filter Section */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex-1 flex gap-2 min-w-[200px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Cari hadits..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500 text-white placeholder:text-gray-600"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition font-medium whitespace-nowrap"
            >
              Cari
            </button>
          </div>
          
          <select
            value={selectedBook}
            onChange={(e) => handleBookFilter(e.target.value)}
            className="px-4 py-2.5 bg-gray-900/50 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500 text-white min-w-[180px]"
          >
            <option value="">📚 Semua Kitab</option>
            {books.map((book) => (
              <option key={book.id} value={book.id}>
                {book.name_indonesian || book.name}
              </option>
            ))}
          </select>
          
          {(search || selectedBook) && (
            <button
              onClick={handleReset}
              className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition"
              title="Reset filter"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Info Filter */}
        {selectedBook && (
          <div className="bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl mb-4 text-sm">
            📖 Menampilkan hadits dari kitab: {books.find(b => b.id.toString() === selectedBook)?.name_indonesian || selectedBook}
          </div>
        )}
        
        {/* Pagination Top */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mb-6">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-gray-800 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-400">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-gray-800 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
        
        {/* Hadith List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
          </div>
        ) : hadiths.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-500">Tidak ada hadits ditemukan</p>
            {(search || selectedBook) && (
              <button
                onClick={handleReset}
                className="mt-4 text-emerald-500 hover:text-emerald-400"
              >
                Reset filter →
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {hadiths.map((hadith) => (
              <Link href={`/hadith/${hadith.id}`} key={hadith.id}>
                <div className="group block bg-gray-900/30 border border-white/5 rounded-xl p-5 hover:bg-gray-900/50 hover:border-emerald-500/30 transition-all duration-200 cursor-pointer">
                  <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-500 font-semibold">Hadits ke-{hadith.number}</span>
                      <span className="text-xs text-gray-500">{hadith.book_name}</span>
                    </div>
                    {hadith.grade && (
                      <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                        {hadith.grade}
                      </span>
                    )}
                  </div>
                  {hadith.arabic && (
                    <div className="text-right text-xl font-arabic mb-3 leading-relaxed text-gray-200">
                      {hadith.arabic.length > 150 ? hadith.arabic.substring(0, 150) + '...' : hadith.arabic}
                    </div>
                  )}
                  <div className="text-gray-400 leading-relaxed">
                    {hadith.translation?.length > 200 ? hadith.translation.substring(0, 200) + '...' : hadith.translation}
                  </div>
                  {hadith.narrator && (
                    <div className="text-xs text-gray-600 mt-3">
                      Perawi: {hadith.narrator}
                    </div>
                  )}
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
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-gray-800 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-400">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-gray-800 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}