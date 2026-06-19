'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Bookmark, 
  History, 
  Trash2, 
  ChevronRight,
  Clock,
  FolderHeart,
  Calendar,
  X
} from 'lucide-react';

interface BookmarkItem {
  id: number;
  content_type: string;
  content_id: number;
  reference: string;
  title: string;
  created_at: string;
}

interface HistoryItem {
  id: number;
  keyword: string;
  created_at: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'history'>('bookmarks');
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookmarksRes, historyRes] = await Promise.all([
        fetch('/api/bookmarks'),
        fetch('/api/search-history')
      ]);
      const bookmarksData = await bookmarksRes.json();
      const historyData = await historyRes.json();
      setBookmarks(Array.isArray(bookmarksData) ? bookmarksData : []);
      setHistory(Array.isArray(historyData) ? historyData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBookmark = async (content_type: string, content_id: number) => {
    try {
      const res = await fetch(`/api/bookmarks?content_type=${content_type}&content_id=${content_id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setBookmarks(prev => prev.filter(b => !(b.content_type === content_type && b.content_id === content_id)));
      }
    } catch (error) {
      console.error('Error deleting bookmark:', error);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('Hapus semua riwayat pencarian?')) return;
    try {
      const res = await fetch('/api/search-history', { method: 'DELETE' });
      if (res.ok) {
        setHistory([]);
      }
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const getContentUrl = (item: BookmarkItem) => {
    if (item.content_type === 'quran') {
      return `/quran/${item.content_id}`;
    } else if (item.content_type === 'hadith') {
      return `/hadith/${item.content_id}`;
    } else {
      return `/tafsir/${item.content_id}`;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quran': return '📖';
      case 'hadith': return '📜';
      case 'tafsir': return '📚';
      default: return '📄';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0b1120]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Profile */}
        <div className="bg-gradient-to-r from-emerald-950/50 to-teal-950/50 rounded-2xl p-6 mb-8 border border-emerald-500/20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-3xl">
              {session.user?.name?.[0] || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{session.user?.name}</h1>
              <p className="text-gray-500">{session.user?.email}</p>
              <p className="text-xs text-emerald-500 mt-1 capitalize">{session.user?.role}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-white/10 mb-6">
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex items-center gap-2 px-4 py-2 transition ${
              activeTab === 'bookmarks'
                ? 'border-b-2 border-emerald-500 text-emerald-500'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <FolderHeart className="w-4 h-4" />
            Bookmark ({bookmarks.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 transition ${
              activeTab === 'history'
                ? 'border-b-2 border-emerald-500 text-emerald-500'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <History className="w-4 h-4" />
            Riwayat ({history.length})
          </button>
        </div>

        {/* Tab Bookmark */}
        {activeTab === 'bookmarks' && (
          <div className="space-y-3">
            {bookmarks.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🔖</div>
                <p className="text-gray-500 mb-4">Belum ada bookmark</p>
                <Link href="/search" className="text-emerald-500 hover:text-emerald-400">
                  Mulai cari dan simpan favorit →
                </Link>
              </div>
            ) : (
              bookmarks.map((item) => (
                <Link
                  key={item.id}
                  href={getContentUrl(item)}
                  className="block group"
                >
                  <div className="bg-gray-900/30 border border-white/5 rounded-xl p-4 hover:bg-gray-900/50 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getTypeIcon(item.content_type)}</span>
                        <div>
                          <div className="text-white font-medium">{item.title || item.reference}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.created_at).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-emerald-500 transition" />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteBookmark(item.content_type, item.content_id);
                          }}
                          className="p-1 rounded-lg hover:bg-red-500/20 transition"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {/* Tab History */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {history.length > 0 && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleClearHistory}
                  className="text-sm text-red-500 hover:text-red-400 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Hapus semua
                </button>
              </div>
            )}
            {history.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-gray-500">Belum ada riwayat pencarian</p>
                <Link href="/search" className="text-emerald-500 hover:text-emerald-400">
              Mulai mencari →
                </Link>
              </div>
            ) : (
              history.map((item) => (
                <Link
                  key={item.id}
                  href={`/search?q=${encodeURIComponent(item.keyword)}`}
                  className="block"
                >
                  <div className="bg-gray-900/30 border border-white/5 rounded-xl p-4 hover:bg-gray-900/50 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-emerald-500" />
                        <div>
                          <div className="text-white font-medium">{item.keyword}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(item.created_at).toLocaleDateString('id-ID')} • {new Date(item.created_at).toLocaleTimeString('id-ID')}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-emerald-500 transition" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}