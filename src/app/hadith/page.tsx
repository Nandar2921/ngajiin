'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Hadith {
  id: number;
  number: number;
  arabic: string;
  translation: string;
  narrator: string;
  grade: string;
  book_name: string;
}

export default function HadithListPage() {
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [books, setBooks] = useState<{id: number, name_indonesian: string}[]>([]);

  useEffect(() => {
    // Fetch books
    fetch('/api/hadith/books')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBooks(data);
      })
      .catch(console.error);

    // Fetch hadiths
    fetch('/api/hadith')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setHadiths(data);
        } else {
          setHadiths([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setHadiths([]);
        setLoading(false);
      });
  }, []);

  const filteredHadiths = hadiths.filter(h => {
    if (!h) return false;
    const matchSearch = search === '' || 
      (h.translation && h.translation.toLowerCase().includes(search.toLowerCase())) ||
      (h.arabic && h.arabic.toLowerCase().includes(search.toLowerCase()));
    const matchBook = selectedBook === '' || h.book_name === selectedBook;
    return matchSearch && matchBook;
  });

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mt-10">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">📜 Kumpulan Hadits</h1>
      <p className="text-gray-500 mb-6">Hadits pilihan dari kitab Arbain Nawawi</p>
      
      {/* Filter Section */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Cari hadits..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        
        <select
          value={selectedBook}
          onChange={(e) => setSelectedBook(e.target.value)}
          className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Semua Kitab</option>
          {books.map((book) => (
            <option key={book.id} value={book.name_indonesian}>
              {book.name_indonesian}
            </option>
          ))}
        </select>
      </div>
      
      {/* Hadith List */}
      {filteredHadiths.length === 0 ? (
        <div className="text-center mt-10">
          <p className="text-gray-500">Tidak ditemukan hadits</p>
          {search && <p className="text-sm mt-2">Coba kata kunci lain</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHadiths.map((hadith) => (
            <Link href={`/hadith/${hadith.id}`} key={hadith.id}>
              <div className="p-5 border rounded-xl hover:shadow-lg transition cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-emerald-600 font-semibold">Hadits ke-{hadith.number}</span>
                    <span className="ml-2 text-xs text-gray-400">{hadith.book_name}</span>
                  </div>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                    {hadith.grade || 'Shahih'}
                  </span>
                </div>
                <div className="text-right text-xl font-arabic mb-3 leading-relaxed">
                  {hadith.arabic?.substring(0, 150)}...
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  {hadith.translation?.substring(0, 200)}...
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Perawi: {hadith.narrator || '-'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {/* Stats */}
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center text-sm text-gray-500">
        Total {filteredHadiths.length} hadits dari {hadiths.length} hadits
      </div>
    </div>
  );
}