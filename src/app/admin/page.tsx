'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  BookOpen, 
  FileText, 
  MessageCircle, 
  Users, 
  BarChart3, 
  Settings,
  Shield,
  Database
} from 'lucide-react';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    quran: 0,
    hadith: 0,
    tafsir: 0,
    users: 0,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    // Fetch stats
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
    
    // Fetch user count
    fetch('/api/admin/users/count')
      .then(res => res.json())
      .then(data => setStats(prev => ({ ...prev, users: data.count || 0 })))
      .catch(console.error);
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⛔</div>
          <h1 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h1>
          <p className="text-muted-foreground">Halaman ini hanya untuk administrator.</p>
          <Link href="/" className="mt-4 inline-block text-emerald-500 hover:text-emerald-400">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      title: 'Kelola Quran',
      description: 'Tambah, edit, atau hapus ayat Quran',
      link: '/admin/quran',
      icon: BookOpen,
      color: 'emerald',
    },
    {
      title: 'Kelola Hadits',
      description: 'Tambah, edit, atau hapus hadits',
      link: '/admin/hadith',
      icon: MessageCircle,
      color: 'blue',
    },
    {
      title: 'Kelola Tafsir',
      description: 'Tambah tafsir untuk setiap ayat',
      link: '/admin/tafsir',
      icon: FileText,
      color: 'purple',
    },
    {
      title: 'Kelola Users',
      description: 'Lihat dan manage user',
      link: '/admin/users',
      icon: Users,
      color: 'orange',
    },
    {
      title: 'Statistik',
      description: 'Lihat statistik platform',
      link: '/admin/statistics',
      icon: BarChart3,
      color: 'pink',
    },
    // [FIX] "Database" & "Pengaturan" sebelumnya link ke /admin/database dan
    // /admin/settings — dua halaman itu tidak pernah dibuat sama sekali
    // (404 kalau diklik). Ditandai "Segera Hadir" (non-link) daripada
    // membiarkan link mati di dashboard.
    {
      title: 'Database',
      description: 'Backup & restore data — segera hadir',
      link: null,
      icon: Database,
      color: 'teal',
    },
    {
      title: 'Pengaturan',
      description: 'Konfigurasi sistem — segera hadir',
      link: null,
      icon: Settings,
      color: 'gray',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      emerald: 'bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40',
      blue: 'bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40',
      purple: 'bg-purple-500/10 border-purple-500/20 hover:border-purple-500/40',
      orange: 'bg-orange-500/10 border-orange-500/20 hover:border-orange-500/40',
      pink: 'bg-pink-500/10 border-pink-500/20 hover:border-pink-500/40',
      teal: 'bg-teal-500/10 border-teal-500/20 hover:border-teal-500/40',
      gray: 'bg-muted border-border',
    };
    return colors[color] || colors.gray;
  };

  const getIconColor = (color: string) => {
    const colors: Record<string, string> = {
      emerald: 'text-emerald-500',
      blue: 'text-blue-500',
      purple: 'text-purple-500',
      orange: 'text-orange-500',
      pink: 'text-pink-500',
      teal: 'text-teal-500',
      gray: 'text-muted-foreground',
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-emerald-500" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground">
            Selamat datang, <span className="text-emerald-500 font-medium">{session.user?.name}</span> (Administrator)
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-emerald-500 text-2xl font-bold">{stats.quran.toLocaleString()}</div>
            <div className="text-muted-foreground text-sm">Ayat Quran</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-blue-500 text-2xl font-bold">{stats.hadith.toLocaleString()}</div>
            <div className="text-muted-foreground text-sm">Hadits</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-purple-500 text-2xl font-bold">{stats.tafsir.toLocaleString()}</div>
            <div className="text-muted-foreground text-sm">Tafsir</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-orange-500 text-2xl font-bold">{stats.users}</div>
            <div className="text-muted-foreground text-sm">Pengguna</div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item, index) => {
            const content = (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <item.icon className={`w-5 h-5 ${getIconColor(item.color)}`} />
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                </div>
                <p className="text-muted-foreground text-sm">{item.description}</p>
                {item.link && (
                  <div className={`mt-3 text-xs font-medium ${getIconColor(item.color)}`}>
                    Akses →
                  </div>
                )}
              </>
            );

            return item.link ? (
              <Link
                key={index}
                href={item.link}
                className={`block p-5 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${getColorClasses(item.color)}`}
              >
                {content}
              </Link>
            ) : (
              <div
                key={index}
                className={`block p-5 rounded-xl border opacity-60 cursor-not-allowed ${getColorClasses(item.color)}`}
              >
                {content}
              </div>
            );
          })}
        </div>

        {/* Informasi Sistem */}
        <div className="mt-8 p-4 bg-card border border-border rounded-xl">
          <h3 className="font-semibold text-emerald-500 mb-2 flex items-center gap-2">
            <Database className="w-4 h-4" /> Informasi Sistem
          </h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>✅ Versi: KAJIIN v1.0</p>
            <p>✅ Database: PostgreSQL + pgvector</p>
            <p>✅ Autentikasi: NextAuth.js</p>
            <p>✅ Pencarian: Hybrid (Keyword + Semantic)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
