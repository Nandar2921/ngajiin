'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function AdminPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (!session || session.user?.role !== 'admin') {
    return <div className="text-center mt-10 text-red-600">Access Denied. Admin only.</div>;
  }

  const menuItems = [
    {
      title: '📖 Kelola Quran',
      description: 'Tambah, edit, atau hapus ayat Quran',
      link: '/admin/quran',
      icon: '📖',
    },
    {
      title: '📚 Kelola Tafsir',
      description: 'Tambah tafsir untuk setiap ayat',
      link: '/admin/tafsir',
      icon: '📚',
    },
    {
      title: '📜 Kelola Hadits',
      description: 'Tambah, edit, atau hapus hadits',
      link: '/admin/hadith',
      icon: '📜',
    },
    {
      title: '👥 Kelola Users',
      description: 'Lihat dan manage user',
      link: '/admin/users',
      icon: '👥',
    },
    {
      title: '📊 Statistik',
      description: 'Lihat statistik platform',
      link: '/admin/statistics',
      icon: '📊',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Selamat datang, {session.user.name} (Administrator)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            href={item.link}
            className="block p-6 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-3">{item.icon}</div>
            <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
            <p className="text-gray-600 text-sm">{item.description}</p>
            <div className="mt-4 text-emerald-600 text-sm">Akses →</div>
          </Link>
        ))}
      </div>

      {/* Informasi Ringkas */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">ℹ️ Informasi Sistem</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>✅ Versi: SiKAJI v1.0 (Milestone 2)</p>
          <p>✅ Database: PostgreSQL</p>
          <p>✅ Autentikasi: NextAuth.js</p>
        </div>
      </div>
    </div>
  );
}