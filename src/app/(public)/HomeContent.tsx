'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Play, ChevronRight, BookOpen, ScrollText, LibraryBig, BookHeart } from 'lucide-react';

const surahs = [
  {n:1,name:'Al-Fatihah',arti:'Pembukaan',type:'Mekah',ayat:7,ar:'الفاتحة'},
  {n:2,name:'Al-Baqarah',arti:'Sapi Betina',type:'Madinah',ayat:286,ar:'البقرة'},
  {n:3,name:"Ali 'Imran",arti:'Keluarga Imran',type:'Madinah',ayat:200,ar:'آل عمران'},
  {n:4,name:"An-Nisa'",arti:'Wanita',type:'Madinah',ayat:176,ar:'النساء'},
  {n:5,name:"Al-Ma'idah",arti:'Hidangan',type:'Madinah',ayat:120,ar:'المائدة'},
  {n:6,name:"Al-An'am",arti:'Binatang Ternak',type:'Mekah',ayat:165,ar:'الأنعام'},
  {n:7,name:"Al-A'raf",arti:'Tempat Tertinggi',type:'Mekah',ayat:206,ar:'الأعراف'},
  {n:8,name:'Al-Anfal',arti:'Rampasan Perang',type:'Madinah',ayat:75,ar:'الأنفال'},
  {n:9,name:'At-Taubah',arti:'Pengampunan',type:'Madinah',ayat:129,ar:'التوبة'},
  {n:10,name:'Yunus',arti:'Nabi Yunus',type:'Mekah',ayat:109,ar:'يونس'},
  {n:11,name:'Hud',arti:'Nabi Hud',type:'Mekah',ayat:123,ar:'هود'},
  {n:12,name:'Yusuf',arti:'Nabi Yusuf',type:'Mekah',ayat:111,ar:'يوسف'},
  {n:13,name:"Ar-Ra'd",arti:'Guruh',type:'Madinah',ayat:43,ar:'الرعد'},
  {n:14,name:'Ibrahim',arti:'Nabi Ibrahim',type:'Mekah',ayat:52,ar:'إبراهيم'},
  {n:15,name:'Al-Hijr',arti:'Bukit Hijr',type:'Mekah',ayat:99,ar:'الحجر'},
  {n:16,name:'An-Nahl',arti:'Lebah',type:'Mekah',ayat:128,ar:'النحل'},
  {n:17,name:"Al-Isra'",arti:'Memperjalankan',type:'Mekah',ayat:111,ar:'الإسراء'},
  {n:18,name:'Al-Kahfi',arti:'Gua',type:'Mekah',ayat:110,ar:'الكهف'},
  {n:19,name:'Maryam',arti:'Maryam',type:'Mekah',ayat:98,ar:'مريم'},
  {n:20,name:'Ta Ha',arti:'Ta Ha',type:'Mekah',ayat:135,ar:'طه'},
  {n:21,name:'Al-Anbiya',arti:'Para Nabi',type:'Mekah',ayat:112,ar:'الأنبياء'},
  {n:22,name:'Al-Hajj',arti:'Haji',type:'Madinah',ayat:78,ar:'الحج'},
  {n:23,name:"Al-Mu'minun",arti:'Orang Beriman',type:'Mekah',ayat:118,ar:'المؤمنون'},
  {n:24,name:'An-Nur',arti:'Cahaya',type:'Madinah',ayat:64,ar:'النور'},
  {n:36,name:'Ya-Sin',arti:'Ya Sin',type:'Mekah',ayat:83,ar:'يس'},
  {n:55,name:'Ar-Rahman',arti:'Yang Maha Pengasih',type:'Madinah',ayat:78,ar:'الرحمن'},
  {n:56,name:"Al-Waqi'ah",arti:'Hari Kiamat',type:'Mekah',ayat:96,ar:'الواقعة'},
  {n:67,name:'Al-Mulk',arti:'Kerajaan',type:'Mekah',ayat:30,ar:'الملك'},
  {n:78,name:"An-Naba'",arti:'Berita Besar',type:'Mekah',ayat:40,ar:'النبأ'},
  {n:112,name:'Al-Ikhlas',arti:'Ikhlas',type:'Mekah',ayat:4,ar:'الإخلاص'},
  {n:113,name:'Al-Falaq',arti:'Waktu Subuh',type:'Mekah',ayat:5,ar:'الفلق'},
  {n:114,name:'An-Nas',arti:'Manusia',type:'Mekah',ayat:6,ar:'الناس'},
];

const topics = [
  { label: 'Qurban', icon: '🐑', q: 'hukum qurban' },
  { label: 'Riba', icon: '💰', q: 'bahaya riba dalam islam' },
  { label: 'Shalat', icon: '🕌', q: 'tata cara shalat yang benar' },
  { label: 'Puasa', icon: '🌙', q: 'keutamaan puasa ramadan' },
  { label: 'Zakat', icon: '💝', q: 'cara menghitung zakat' },
  { label: 'Haji', icon: '🕋', q: 'syarat wajib haji' },
  { label: 'Sabar', icon: '🌿', q: 'ayat tentang sabar' },
  { label: 'Sedekah', icon: '🌟', q: 'keutamaan sedekah' },
  { label: 'Doa Rezeki', icon: '🙏', q: 'doa memohon rezeki' },
  { label: 'Taubat', icon: '✨', q: 'cara bertobat dari dosa' },
];

const pillars = [
  { title: "Al-Qur'an", key: 'home.quranDesc', icon: BookOpen, href: '/surah' },
  { title: 'Hadits', key: 'home.hadithDesc', icon: LibraryBig, href: '/hadith' },
  { title: 'Tafsir', key: 'home.tafsirDesc', icon: ScrollText, href: '/tafsir' },
  { title: 'Doa Harian', key: 'home.doaDesc', icon: BookHeart, href: '/doa' },
] as const;

const hints = [
  'bagaimana cara bersabar menghadapi ujian',
  'hukum zakat fitrah',
  'ayat tentang rezeki',
  'doa sebelum tidur',
];

interface ReadingProgress {
  hasProgress: boolean;
  surah?: number;
  ayah?: number;
  surahName?: string;
  position?: number;
  totalAyat?: number;
  percentage?: number;
}

export default function HomeContent() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ quran: 6236, hadith: 11400, tafsir: 0 });
  const [randomAyah, setRandomAyah] = useState({ surah: 94, ayah: 6, text: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', translation: 'Sesungguhnya bersama kesulitan ada kemudahan.' });
  const [surahQuery, setSurahQuery] = useState('');
  const [progress, setProgress] = useState<ReadingProgress | null>(null);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {});
    fetch('/api/quran/random').then(r => r.json()).then(setRandomAyah).catch(() => {});
  }, []);

  // [FITUR BARU] Widget progress baca Qur'an — hanya untuk user yang login.
  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/user/reading-progress')
        .then(r => r.json())
        .then(setProgress)
        .catch(() => setProgress(null));
    }
  }, [status]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const fillSearch = (text: string) => {
    setSearchQuery(text);
    searchRef.current?.focus();
  };

  const filteredSurahs = surahs.filter(s =>
    s.name.toLowerCase().includes(surahQuery.toLowerCase()) ||
    s.arti.toLowerCase().includes(surahQuery.toLowerCase()) ||
    String(s.n).includes(surahQuery)
  );

  return (
    <div className="max-w-5xl mx-auto">
      {/* HERO */}
      <section className="text-center py-8 md:py-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-xs uppercase tracking-wider mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          {t('home.heroEyebrow')}
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-5 text-foreground leading-tight">
          {t('home.heroTitle').split('\\n').map((line, i) => (
            <span key={i}>
              {line}
              {i < 2 && <br />}
            </span>
          ))}
        </h1>

        <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
          {t('home.heroSubtitle')}
        </p>

        {/* Search bar */}
        <div className="max-w-2xl mx-auto relative group z-10 w-full mb-4">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-emerald-500/30 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
          <form onSubmit={handleSearch} className="relative flex items-center bg-card border border-border hover:border-primary/50 transition-all rounded-2xl shadow-xl overflow-hidden p-1.5 pl-4">
            <Search className="w-5 h-5 text-muted-foreground ml-1 flex-shrink-0" />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              className="w-full pl-3 pr-3 py-3.5 bg-transparent border-none focus:outline-none focus:ring-0 text-sm md:text-base text-foreground placeholder:text-muted-foreground"
            />
            <button type="submit" className="px-5 py-3 bg-primary text-white hover:bg-brand-emerald-dark transition-colors font-bold text-sm rounded-xl flex-shrink-0">
              {t('common.search')}
            </button>
          </form>
        </div>

        {/* Hints */}
        <div className="flex justify-center gap-2 flex-wrap mb-10">
          {hints.map((hint, i) => (
            <button
              key={i}
              onClick={() => fillSearch(hint)}
              className="px-3 py-1.5 rounded-full bg-muted/60 border border-border text-xs text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
            >
              {hint.length > 28 ? hint.slice(0, 28) + '...' : hint}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 flex-wrap pt-6 border-t border-border max-w-xl mx-auto">
          {[
            { val: stats.quran > 0 ? stats.quran.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '6.236', lbl: t('quran.verses') },
            { val: stats.hadith > 0 ? stats.hadith.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '11.400', lbl: t('hadith.hadiths') },
            { val: '114', lbl: t('quran.surahs') },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-xl font-extrabold text-primary tracking-tight">{s.val}</div>
              <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mt-0.5">{s.lbl}</div>
            </div>
          ))}
        </div>
      </section>

      {/* [FITUR BARU] WIDGET PROGRESS MEMBACA QUR'AN — hanya tampil kalau login */}
      {status === 'authenticated' && (
        <section className="mb-12">
          {progress?.hasProgress ? (
            <Link href={`/surah/${progress.surah}`} className="block group">
              <div className="bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 hover:border-primary/50 p-6 md:p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all" />
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 relative z-10">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-xs font-bold text-primary uppercase tracking-widest">Terakhir Dibaca</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-1 text-foreground">{progress.surahName || `Surah ${progress.surah}`}</h3>
                    <p className="text-muted-foreground mb-5">Ayat {progress.ayah}</p>
                    <div className="max-w-md">
                      <div className="flex justify-between text-sm mb-2 font-medium">
                        <span className="text-foreground">
                          {progress.percentage}%<span className="text-muted-foreground font-normal"> dari Al-Qur'an</span>
                        </span>
                        <span className="text-muted-foreground">{progress.position} / {progress.totalAyat} Ayat</span>
                      </div>
                      <div className="h-2.5 w-full bg-muted/60 rounded-full overflow-hidden border border-border/50">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-brand-emerald-dark rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${Math.min(progress.percentage || 0, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center justify-center gap-2 px-7 py-3.5 bg-foreground text-background group-hover:bg-primary group-hover:text-white rounded-2xl transition-all font-semibold shadow-lg">
                    <Play className="w-4 h-4 fill-current" /> Lanjutkan
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <Link href="/surah/1" className="block group">
              <div className="bg-card border border-border hover:border-primary/40 p-6 rounded-[2rem] transition-all flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">Belum ada riwayat baca</p>
                  <p className="text-sm text-muted-foreground">Mulai membaca dari Al-Fatihah, kami akan ingat posisi terakhirmu.</p>
                </div>
                <div className="flex-shrink-0 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm group-hover:bg-brand-emerald-dark transition-colors">
                  Mulai
                </div>
              </div>
            </Link>
          )}
        </section>
      )}

      {/* 4 PILLAR CARDS */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        {pillars.map((item, i) => (
          <Link
            href={item.href}
            key={i}
            className="group bg-card border border-border hover:border-primary/40 p-6 rounded-[1.75rem] transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col items-center justify-center text-center"
          >
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:rotate-6">
              <item.icon className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-base font-bold mb-1 text-foreground">{item.title}</h3>
            <p className="text-xs text-muted-foreground">{t(item.key)}</p>
          </Link>
        ))}
      </section>

      {/* HOW IT WORKS */}
      <section className="mb-16">
        <div className="text-xs font-bold text-primary uppercase tracking-widest mb-2">{t('home.howItWorks')}</div>
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">{t('home.howItWorksTitle')}</h2>
        <p className="text-sm text-muted-foreground mb-6">{t('home.howItWorksDesc')}</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { num: '1', icon: '✍️', name: t('home.step1'), desc: t('home.step1Desc') },
            { num: '2', icon: '🔍', name: t('home.step2'), desc: t('home.step2Desc') },
            { num: '3', icon: '📖', name: t('home.step3'), desc: t('home.step3Desc') },
          ].map((s, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute -top-1 right-3 text-5xl font-black text-primary/5 pointer-events-none">{s.num}</div>
              <div className="text-2xl mb-3 relative z-10">{s.icon}</div>
              <div className="text-sm font-bold text-foreground mb-1 relative z-10">{s.name}</div>
              <div className="text-xs text-muted-foreground leading-relaxed relative z-10">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* POPULAR TOPICS */}
      <section className="mb-16">
        <div className="text-xs font-bold text-primary uppercase tracking-widest mb-2">{t('home.popular')}</div>
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">{t('home.popularTitle')}</h2>
        <p className="text-sm text-muted-foreground mb-5">{t('home.popularDesc')}</p>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic, i) => (
            <button
              key={i}
              onClick={() => router.push(`/search?q=${encodeURIComponent(topic.q)}`)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-muted/60 border border-border text-foreground/90 text-sm font-semibold hover:text-primary hover:border-primary/40 hover:bg-primary/10 transition-all"
            >
              {topic.icon} {topic.label}
            </button>
          ))}
        </div>
      </section>

      {/* AYAT HARI INI */}
      <section className="mb-16">
        <h2 className="text-xl font-bold flex items-center gap-3 mb-6 text-foreground">
          <span className="w-2 h-7 bg-primary rounded-full" />
          {t('home.ayahOfDayTitle')}
        </h2>
        <div className="bg-card border border-border hover:border-primary/30 p-7 md:p-10 rounded-[2rem] shadow-sm hover:shadow-lg transition-all relative overflow-hidden">
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex justify-between items-start mb-7 relative z-10">
            <Link
              href={`/quran/${randomAyah.surah}/${randomAyah.ayah}`}
              className="text-sm font-semibold px-4 py-2 bg-muted text-foreground hover:bg-primary hover:text-white transition-colors rounded-full inline-flex items-center gap-1"
            >
              QS. {randomAyah.surah}:{randomAyah.ayah} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {randomAyah.text && (
            <p className="font-arabic text-3xl md:text-5xl text-right leading-[1.9] mb-7 text-foreground relative z-10" dir="rtl">
              {randomAyah.text}
            </p>
          )}
          <div className="relative z-10 pt-5 border-t border-border">
            <p className="text-lg text-foreground/80 leading-relaxed font-medium">
              &quot;{randomAyah.translation}&quot;
            </p>
          </div>
        </div>
      </section>

      {/* SURAH LIST */}
      <section className="mb-16">
        <div className="text-xs font-bold text-primary uppercase tracking-widest mb-2">{t('quran.title')}</div>
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">{t('quran.surahs')}</h2>
        <p className="text-sm text-muted-foreground mb-4">Cari berdasarkan nama, arti, atau nomor</p>
        <input
          type="text"
          value={surahQuery}
          onChange={e => setSurahQuery(e.target.value)}
          placeholder="Ketik nama surah, arti, atau nomor..."
          className="w-full px-4 py-3 text-sm bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors mb-4"
        />
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))' }}>
          {filteredSurahs.map(s => (
            <Link
              key={s.n}
              href={`/surah/${s.n}`}
              className="flex items-center gap-3 bg-card border border-border hover:border-primary/40 hover:bg-primary/5 rounded-xl px-3.5 py-3 transition-all"
            >
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">{s.n}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">{s.name}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{s.arti} · {s.type} · {s.ayat} {t('quran.verses')}</div>
              </div>
              <div className="font-arabic text-base text-primary flex-shrink-0">{s.ar}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mb-12">
        <div className="border border-primary/15 bg-primary/5 rounded-[1.75rem] py-12 px-6 text-center">
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight mb-2">{t('home.ctaTitle')}</h2>
          <p className="text-muted-foreground text-sm mb-7">{t('home.ctaDesc')}</p>
          <div className="flex gap-2.5 justify-center flex-wrap">
            <button
              onClick={() => router.push('/search')}
              className="px-6 py-3 rounded-xl text-sm font-bold bg-primary text-white hover:bg-brand-emerald-dark transition-colors flex items-center gap-2"
            >
              🚀 {t('home.ctaButton')}
            </button>
            <Link
              href="/surah"
              className="px-6 py-3 rounded-xl text-sm font-semibold bg-muted text-foreground/80 hover:text-foreground border border-border transition-colors flex items-center gap-2"
            >
              📖 {t('home.bacaAlquran')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
