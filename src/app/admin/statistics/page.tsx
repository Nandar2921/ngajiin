'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Statistics {
  quran: { total: number; surah: number };
  tafsir: { total: number; sources: Record<string, number> };
  hadith: { total: number; books: number };
  users: { total: number; admins: number };
}

export default function AdminStatisticsPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetch('/api/admin/statistics')
        .then(res => res.json())
        .then(data => {
          setStats(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [session]);

  if (status === 'loading' || loading) return <div className="p-6">Loading...</div>;
  if (session?.user?.role !== 'admin') return <div className="p-6 text-red-600">Access Denied</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📊 Statistik Platform</h1>
        <Link href="/admin" className="text-emerald-600 hover:underline">
          ← Kembali ke Dashboard
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="text-4xl mb-2">📖</div>
          <div className="text-3xl font-bold">{stats?.quran?.total?.toLocaleString() || 0}</div>
          <div className="text-sm opacity-90">Total Ayat Quran</div>
          <div className="text-xs opacity-75 mt-1">{stats?.quran?.surah || 0} Surah</div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="text-4xl mb-2">📚</div>
          <div className="text-3xl font-bold">{stats?.tafsir?.total || 0}</div>
          <div className="text-sm opacity-90">Total Tafsir</div>
          <div className="text-xs opacity-75 mt-1">
            {Object.entries(stats?.tafsir?.sources || {}).map(([key, val]) => `${key}: ${val}`).join(', ')}
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="text-4xl mb-2">📜</div>
          <div className="text-3xl font-bold">{stats?.hadith?.total || 0}</div>
          <div className="text-sm opacity-90">Total Hadits</div>
          <div className="text-xs opacity-75 mt-1">{stats?.hadith?.books || 0} Kitab</div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="text-4xl mb-2">👥</div>
          <div className="text-3xl font-bold">{stats?.users?.total || 0}</div>
          <div className="text-sm opacity-90">Total Users</div>
          <div className="text-xs opacity-75 mt-1">{stats?.users?.admins || 0} Admin</div>
        </div>
      </div>

      {/* Detail Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quran Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <span>📖</span> Al-Quran
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b">
              <span>Total Surah</span>
              <span className="font-bold">{stats?.quran?.surah || 0}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span>Total Ayat</span>
              <span className="font-bold">{stats?.quran?.total?.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>

        {/* Tafsir Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <span>📚</span> Tafsir
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b">
              <span>Total Entri Tafsir</span>
              <span className="font-bold">{stats?.tafsir?.total || 0}</span>
            </div>
            {Object.entries(stats?.tafsir?.sources || {}).map(([source, count]) => (
              <div key={source} className="flex justify-between py-2 border-b text-sm">
                <span>{source}</span>
                <span>{count} entri</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hadith Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <span>📜</span> Hadits
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b">
              <span>Total Hadits</span>
              <span className="font-bold">{stats?.hadith?.total || 0}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span>Kitab Hadits</span>
              <span className="font-bold">{stats?.hadith?.books || 0}</span>
            </div>
          </div>
        </div>

        {/* Users Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <span>👥</span> Users
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b">
              <span>Total Users</span>
              <span className="font-bold">{stats?.users?.total || 0}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span>Admin</span>
              <span className="font-bold">{stats?.users?.admins || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}