'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  BookOpen, 
  Heart, 
  Star, 
  Users, 
  Home, 
  HandHeart,
  Church,
  Moon,
  Sun,
  Droplet,
  Briefcase,
  GraduationCap,
  UsersRound,
  Utensils,
  Gem,
  Shield,
  Flower2,
  Sparkles,
  ChevronRight
} from 'lucide-react';

// Data topik explore
const exploreTopics = [
  { 
    id: 1, 
    name: 'Akhlak', 
    icon: Heart, 
    color: '#f43f5e', 
    bg: 'rgba(244,63,94,0.1)',
    query: 'akhlak mulia',
    description: 'Akhlak terpuji, budi pekerti, etika Islam',
    count: 45
  },
  { 
    id: 2, 
    name: 'Tauhid', 
    icon: Star, 
    color: '#fbbf24', 
    bg: 'rgba(251,191,36,0.1)',
    query: 'tauhid keesaan allah',
    description: 'Keesaan Allah, iman, rukun iman',
    count: 32
  },
  { 
    id: 3, 
    name: 'Sholat', 
    icon: Church, 
    color: '#10b981', 
    bg: 'rgba(16,185,129,0.1)',
    query: 'tata cara sholat',
    description: 'Sholat wajib, sunnah, tata cara',
    count: 67
  },
  { 
    id: 4, 
    name: 'Puasa', 
    icon: Moon, 
    color: '#8b5cf6', 
    bg: 'rgba(139,92,246,0.1)',
    query: 'keutamaan puasa',
    description: 'Puasa Ramadhan, puasa sunnah',
    count: 41
  },
  { 
    id: 5, 
    name: 'Zakat', 
    icon: HandHeart, 
    color: '#f59e0b', 
    bg: 'rgba(245,158,11,0.1)',
    query: 'hukum zakat',
    description: 'Zakat fitrah, zakat mal, infak',
    count: 28
  },
  { 
    id: 6, 
    name: 'Haji & Umrah', 
    icon: Home, 
    color: '#06b6d4', 
    bg: 'rgba(6,182,212,0.1)',
    query: 'tata cara haji',
    description: 'Ibadah haji, umrah, manasik',
    count: 23
  },
  { 
    id: 7, 
    name: 'Pernikahan', 
    icon: Users, 
    color: '#ec4899', 
    bg: 'rgba(236,72,153,0.1)',
    query: 'hukum nikah',
    description: 'Nikah, keluarga, rumah tangga',
    count: 35
  },
  { 
    id: 8, 
    name: 'Muamalah', 
    icon: Briefcase, 
    color: '#14b8a6', 
    bg: 'rgba(20,184,166,0.1)',
    query: 'jual beli dalam islam',
    description: 'Bisnis, jual beli, riba, hutang',
    count: 29
  },
  { 
    id: 9, 
    name: 'Pendidikan', 
    icon: GraduationCap, 
    color: '#6366f1', 
    bg: 'rgba(99,102,241,0.1)',
    query: 'menuntut ilmu',
    description: 'Menuntut ilmu, guru, murid',
    count: 18
  },
  { 
    id: 10, 
    name: 'Keluarga', 
    icon: UsersRound, 
    color: '#fb923c', 
    bg: 'rgba(251,146,60,0.1)',
    query: 'birrul walidain',
    description: 'Berbakti kepada orang tua, silaturahmi',
    count: 31
  },
  { 
    id: 11, 
    name: 'Makanan & Minuman', 
    icon: Utensils, 
    color: '#ef4444', 
    bg: 'rgba(239,68,68,0.1)',
    query: 'makanan halal',
    description: 'Halal haram, makanan, minuman',
    count: 15
  },
  { 
    id: 12, 
    name: 'Jihad & Perjuangan', 
    icon: Shield, 
    color: '#dc2626', 
    bg: 'rgba(220,38,38,0.1)',
    query: 'jihad fisabilillah',
    description: 'Jihad, perjuangan, membela agama',
    count: 22
  },
  { 
    id: 13, 
    name: 'Sabar & Syukur', 
    icon: Flower2, 
    color: '#a855f7', 
    bg: 'rgba(168,85,247,0.1)',
    query: 'keutamaan sabar',
    description: 'Sabar, syukur, tawakal',
    count: 27
  },
  { 
    id: 14, 
    name: 'Doa & Dzikir', 
    icon: Sparkles, 
    color: '#fbbf24', 
    bg: 'rgba(251,191,36,0.1)',
    query: 'doa sehari hari',
    description: 'Doa harian, dzikir, wirid',
    count: 42
  },
  { 
    id: 15, 
    name: 'Surga & Neraka', 
    icon: Sun, 
    color: '#f97316', 
    bg: 'rgba(249,115,22,0.1)',
    query: 'gambaran surga',
    description: 'Surga, neraka, akhirat, hisab',
    count: 33
  },
  { 
    id: 16, 
    name: 'Kisah Nabi', 
    icon: BookOpen, 
    color: '#3b82f6', 
    bg: 'rgba(59,130,246,0.1)',
    query: 'kisah nabi',
    description: 'Kisah para nabi dan rasul',
    count: 56
  },
];

export default function ExplorePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ quran: 0, hadith: 0, tafsir: 0 });

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {});
  }, []);

  const handleTopicClick = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const filteredTopics = exploreTopics.filter(topic =>
    topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0b1120]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-semibold text-emerald-400 tracking-wide">Explore</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Jelajahi Topik Islam
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Temukan ayat, hadits, dan tafsir berdasarkan topik yang kamu minati
          </p>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-12">
          <div className="text-center p-4 bg-gray-900/30 rounded-xl border border-white/5">
            <div className="text-2xl font-bold text-emerald-500">{stats.quran.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Ayat Quran</div>
          </div>
          <div className="text-center p-4 bg-gray-900/30 rounded-xl border border-white/5">
            <div className="text-2xl font-bold text-blue-500">{stats.hadith.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Hadits</div>
          </div>
          <div className="text-center p-4 bg-gray-900/30 rounded-xl border border-white/5">
            <div className="text-2xl font-bold text-purple-500">{stats.tafsir.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Tafsir</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Cari topik..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl focus:outline-none focus:border-emerald-500 text-white placeholder:text-gray-600"
            />
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredTopics.map((topic) => {
            const Icon = topic.icon;
            return (
              <button
                key={topic.id}
                onClick={() => handleTopicClick(topic.query)}
                className="group text-left p-5 bg-gray-900/30 border border-white/5 rounded-xl hover:border-white/10 transition-all duration-200 hover:transform hover:scale-[1.02]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: topic.bg }}
                  >
                    <Icon className="w-6 h-6" style={{ color: topic.color }} />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-emerald-500 transition" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{topic.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{topic.description}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-emerald-500">{topic.count} referensi</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredTopics.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-400">Tidak ditemukan topik "{searchTerm}"</p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 mb-4">Tidak menemukan topik yang dicari?</p>
          <Link 
            href="/search"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition"
          >
            <Search className="w-4 h-4" />
            Cari Topik Lain
          </Link>
        </div>
      </div>
    </div>
  );
}