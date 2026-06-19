'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

interface BookmarkButtonProps {
  verseId: number;
}

export default function BookmarkButton({ verseId }: BookmarkButtonProps) {
  const { data: session, status } = useSession();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Cek status bookmark saat komponen dimuat
  useEffect(() => {
    if (status === 'authenticated') {
      checkBookmarkStatus();
    }
  }, [status, verseId]);

  const checkBookmarkStatus = async () => {
    try {
      const res = await fetch('/api/bookmarks');
      const bookmarks = await res.json();
      if (Array.isArray(bookmarks)) {
        setIsBookmarked(bookmarks.some((b: any) => b.verseId === verseId));
      }
    } catch (error) {
      console.error('Error checking bookmark:', error);
    }
  };

  const showMessage = (msg: string, isError: boolean = false) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 2000);
  };

  const toggleBookmark = async () => {
    if (status !== 'authenticated') {
      showMessage('Silakan login terlebih dahulu', true);
      return;
    }

    setLoading(true);
    try {
      if (isBookmarked) {
        const res = await fetch('/api/bookmarks', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ verseId }),
        });
        
        if (res.ok) {
          setIsBookmarked(false);
          showMessage('✅ Bookmark dihapus');
        } else {
          showMessage('❌ Gagal menghapus bookmark', true);
        }
      } else {
        const res = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ verseId }),
        });
        
        if (res.ok) {
          setIsBookmarked(true);
          showMessage('✅ Bookmark ditambahkan');
        } else {
          const error = await res.json();
          showMessage(error.error || '❌ Gagal menambah bookmark', true);
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      showMessage('❌ Terjadi kesalahan', true);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <button className="p-2 rounded-full text-gray-300" disabled>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={toggleBookmark}
        disabled={loading}
        className={`p-2 rounded-full transition-all duration-200 ${
          isBookmarked 
            ? 'text-yellow-500 hover:text-yellow-600' 
            : 'text-gray-400 hover:text-yellow-500'
        } ${loading ? 'opacity-50 cursor-wait' : ''}`}
        title={isBookmarked ? 'Hapus bookmark' : 'Tambah bookmark'}
      >
        <svg 
          className="w-5 h-5" 
          fill={isBookmarked ? 'currentColor' : 'none'} 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
          />
        </svg>
      </button>
      
      {/* Toast Message */}
      {message && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50">
          {message}
        </div>
      )}
    </div>
  );
}