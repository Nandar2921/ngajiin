'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, BookOpen, Heart } from 'lucide-react';

interface Doa {
  id: number;
  title: string;
  arabic: string;
  latin: string;
  translation: string;
  source?: string;
}

export default function DoaPage() {
  const [doaList, setDoaList] = useState<Doa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch doa dari API atau data statis
    fetch('/api/doa')
      .then(res => res.json())
      .then(data => {
        setDoaList(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  const filteredDoa = doaList.filter(doa =>
    doa.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doa.translation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-500 mb-2">
            🤲 Kumpulan Doa Harian
          </h1>
          <p className="text-muted-foreground">
            Doa-doa ma'tsur dari Al-Qur'an dan Hadits
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari doa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl focus:outline-none focus:border-emerald-500 text-foreground"
          />
        </div>

        {/* Doa List */}
        <div className="space-y-4">
          {filteredDoa.map((doa) => (
            <Link key={doa.id} href={`/doa/${doa.id}`}>
              <div className="bg-card/70 border border-border rounded-xl p-5 hover:bg-card transition cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-emerald-500" />
                  <h3 className="font-semibold text-foreground">{doa.title}</h3>
                </div>
                <div className="text-right text-xl font-arabic text-emerald-400 mb-2">
                  {doa.arabic}
                </div>
                <div className="text-sm text-muted-foreground italic mb-1">
                  {doa.latin}
                </div>
                <div className="text-sm text-muted-foreground">
                  {doa.translation}
                </div>
                {doa.source && (
                  <div className="text-xs text-muted-foreground/60 mt-2">Sumber: {doa.source}</div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {filteredDoa.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Doa tidak ditemukan
          </div>
        )}
      </div>
    </div>
  );
}