'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  { label: 'Qurban', icon: '🐑', q: 'hukum qurban', color: '#22d3a0', bg: 'rgba(34,211,160,0.08)', border: 'rgba(34,211,160,0.2)' },
  { label: 'Riba', icon: '💰', q: 'bahaya riba dalam islam', color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' },
  { label: 'Shalat', icon: '🕌', q: 'tata cara shalat yang benar', color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)' },
  { label: 'Puasa', icon: '🌙', q: 'keutamaan puasa ramadan', color: '#c084fc', bg: 'rgba(192,132,252,0.08)', border: 'rgba(192,132,252,0.2)' },
  { label: 'Zakat', icon: '💝', q: 'cara menghitung zakat', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)' },
  { label: 'Haji', icon: '🕋', q: 'syarat wajib haji', color: '#22d3a0', bg: 'rgba(34,211,160,0.08)', border: 'rgba(34,211,160,0.2)' },
  { label: 'Sabar', icon: '🌿', q: 'ayat tentang sabar', color: '#2dd4bf', bg: 'rgba(45,212,191,0.08)', border: 'rgba(45,212,191,0.2)' },
  { label: 'Sedekah', icon: '🌟', q: 'keutamaan sedekah', color: '#fb923c', bg: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.2)' },
  { label: 'Doa Rezeki', icon: '🙏', q: 'doa memohon rezeki', color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)' },
  { label: 'Taubat', icon: '✨', q: 'cara bertobat dari dosa', color: '#34d399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.2)' },
];

const features = [
  { icon: '📖', name: "Al-Qur'an", desc: 'Teks Arab, transliterasi, terjemahan 6.236 ayat', color: '#22d3a0', bg: 'rgba(34,211,160,0.1)', href: '/surah' },
  { icon: '📜', name: 'Hadits', desc: 'Bukhari, Muslim, Abu Dawud, Tirmidzi & lainnya', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', href: '/hadith' },
  { icon: '📚', name: 'Tafsir', desc: 'Penjelasan mendalam setiap ayat dari ulama', color: '#c084fc', bg: 'rgba(192,132,252,0.1)', href: '/tafsir' },
  { icon: '🤲', name: 'Doa Harian', desc: "Kumpulan doa ma'tsur lengkap beserta artinya", color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', href: '/doa' },
];

const hints = [
  'bagaimana cara bersabar menghadapi ujian',
  'hukum zakat fitrah',
  'ayat tentang rezeki',
  'doa sebelum tidur',
];

// SVG Logo Component
function SikajiLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="36" rx="9" fill="#0f1f14" />
      <path d="M18 10 C14 10 9 12 9 14 L9 26 C9 26 13 24 18 24" stroke="#22d3a0" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M18 10 C22 10 27 12 27 14 L27 26 C27 26 23 24 18 24" stroke="#22d3a0" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <line x1="18" y1="10" x2="18" y2="24" stroke="#22d3a0" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="26" cy="11" r="4.5" fill="#0f1f14" />
      <circle cx="26" cy="11" r="3" fill="#22d3a0" />
      <line x1="26" y1="8" x2="26" y2="7" stroke="#22d3a0" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="26" y1="14" x2="26" y2="15" stroke="#22d3a0" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="23" y1="11" x2="22" y2="11" stroke="#22d3a0" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="29" y1="11" x2="30" y2="11" stroke="#22d3a0" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export default function HomePage() {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ quran: 6236, hadith: 11400, tafsir: 0 });
  const [randomAyah, setRandomAyah] = useState({ surah: 94, ayah: 6, text: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', translation: 'Sesungguhnya bersama kesulitan ada kemudahan.' });
  const [surahQuery, setSurahQuery] = useState('');
  const [activeNav, setActiveNav] = useState('Beranda');

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {});
    fetch('/api/quran/random').then(r => r.json()).then(setRandomAyah).catch(() => {});
  }, []);

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

  const navLinks = ['Beranda', "Al-Qur'an", 'Hadits', 'Tafsir', 'Doa'];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0b1120', color: '#f1f5f9', fontFamily: "'Inter', system-ui, sans-serif" }}>
{/* Navbar akan di-render dari layout */}
<div style={{ height: '62px' }}></div> {/* Spacer untuk navbar sticky */}
      {/* HERO */}
      <section style={{ maxWidth: '820px', margin: '0 auto', padding: '72px 32px 56px', textAlign: 'center' }}>
        {/* Eyebrow */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(34,211,160,0.08)', border: '1px solid rgba(34,211,160,0.2)',
          borderRadius: '100px', padding: '6px 16px',
          fontSize: '12px', fontWeight: 600, color: '#22d3a0',
          letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '28px',
        }}>
          <span style={{ width: '6px', height: '6px', background: '#22d3a0', borderRadius: '50%', animation: 'blink 1.8s infinite' }} />
          AI-Powered Islamic Search
        </div>

        <h1 style={{
          fontSize: 'clamp(38px, 6vw, 64px)', fontWeight: 900,
          lineHeight: 1.04, letterSpacing: '-0.04em',
          color: '#f8fafc', marginBottom: '20px',
        }}>
          Tanya apa saja,<br />
          temukan jawabannya<br />
          <span style={{ color: '#22d3a0' }}>dari Al-Qur'an & Hadits</span>
        </h1>

        <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.7, maxWidth: '480px', margin: '0 auto 40px', fontWeight: 400 }}>
          Ketik pertanyaan atau topik bebas —{' '}
          <span style={{ color: '#94a3b8', fontWeight: 500 }}>SiKAJI otomatis membaca database</span>{' '}
          dan mencarikan ayat, hadits, serta tafsir yang paling relevan.
        </p>

        {/* SEARCH */}
        <div style={{ maxWidth: '620px', margin: '0 auto 14px' }}>
          <form onSubmit={handleSearch}>
            <div style={{
              display: 'flex', background: 'rgba(255,255,255,0.05)',
              border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: '16px',
              overflow: 'hidden', transition: 'border-color 0.2s',
            }}
              onFocus={e => (e.currentTarget.style.borderColor = '#22d3a0')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px 0 20px', fontSize: '18px', color: '#22d3a0', flexShrink: 0 }}>
                ✦
              </div>
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Contoh: apa hukum riba dalam islam?"
                style={{
                  flex: 1, padding: '17px 0', fontSize: '15px', fontFamily: 'inherit',
                  background: 'none', border: 'none', color: '#f1f5f9', outline: 'none', minWidth: 0,
                }}
              />
              <button
                type="submit"
                style={{
                  margin: '6px', padding: '0 22px',
                  background: '#22d3a0', color: '#0b1120',
                  border: 'none', borderRadius: '11px',
                  fontWeight: 800, fontSize: '14px', fontFamily: 'inherit',
                  cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '-0.01em',
                  transition: 'background 0.15s',
                }}
              >
                Cari →
              </button>
            </div>
          </form>
        </div>

        {/* HINTS */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {hints.map((hint, i) => (
            <button
              key={i}
              onClick={() => fillSearch(hint)}
              style={{
                padding: '6px 14px', borderRadius: '100px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                fontSize: '12px', color: '#475569', cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              {hint.length > 28 ? hint.slice(0, 28) + '...' : hint}
            </button>
          ))}
        </div>

        {/* STATS */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap',
          marginTop: '48px', paddingTop: '32px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          {[
  { val: stats.quran > 0 ? stats.quran.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '6.236', lbl: 'Ayat Al-Qur\'an' },
  { val: stats.hadith > 0 ? stats.hadith.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '11.400', lbl: 'Hadits' },
  { val: '114', lbl: 'Surah' },
  { val: 'AI', lbl: 'Powered Search' },
].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#22d3a0', letterSpacing: '-0.02em' }}>{s.val}</div>
              <div style={{ fontSize: '11px', color: '#334155', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '2px' }}>{s.lbl}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ maxWidth: '820px', margin: '0 auto', padding: '0 32px 64px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#22d3a0', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>Cara Kerja</div>
        <div style={{ fontSize: '24px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', marginBottom: '6px' }}>Cukup ketik, sisanya biar sistem</div>
        <div style={{ fontSize: '14px', color: '#334155', marginBottom: '28px' }}>Tidak perlu tahu nomor surah atau bab hadits</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {[
            { num: '1', icon: '✍️', name: 'Ketik bebas', desc: 'Tulis pertanyaan dalam Bahasa Indonesia sehari-hari' },
            { num: '2', icon: '🔍', name: 'Sistem membaca', desc: 'AI memindai seluruh database Al-Qur\'an, hadits, dan tafsir' },
            { num: '3', icon: '📖', name: 'Hasil relevan', desc: 'Ayat, hadits, dan tafsir terpilih disajikan lengkap' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '14px', padding: '22px 20px', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ fontSize: '56px', fontWeight: 900, color: 'rgba(34,211,160,0.06)', position: 'absolute', top: '-4px', right: '12px', letterSpacing: '-0.04em', lineHeight: 1, pointerEvents: 'none' }}>{s.num}</div>
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>{s.icon}</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>{s.name}</div>
              <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.55 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '0 32px 64px', maxWidth: '756px', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />

      {/* TOPICS */}
      <section style={{ maxWidth: '820px', margin: '0 auto', padding: '0 32px 64px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#22d3a0', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>Populer</div>
        <div style={{ fontSize: '24px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', marginBottom: '6px' }}>Topik yang Sering Dicari</div>
        <div style={{ fontSize: '14px', color: '#334155', marginBottom: '20px' }}>Klik untuk langsung mencari</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {topics.map((t, i) => (
            <button
              key={i}
              onClick={() => router.push(`/search?q=${encodeURIComponent(t.q)}`)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 18px', borderRadius: '100px',
                background: t.bg, border: `1px solid ${t.border}`,
                color: t.color, fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '0 32px 64px', maxWidth: '756px', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />

      {/* FEATURES */}
      <section style={{ maxWidth: '820px', margin: '0 auto', padding: '0 32px 64px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#22d3a0', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>Fitur</div>
        <div style={{ fontSize: '24px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', marginBottom: '6px' }}>Semua sumber dalam satu tempat</div>
        <div style={{ fontSize: '14px', color: '#334155', marginBottom: '20px' }}>Database lengkap, pencarian cerdas</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))', gap: '10px' }}>
          {features.map((f, i) => (
            <Link key={i} href={f.href} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '14px', padding: '20px 18px', cursor: 'pointer', transition: 'all 0.18s', height: '100%',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = f.color + '4D';
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.05)';
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)';
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)';
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                }}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '19px', marginBottom: '12px' }}>{f.icon}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0', marginBottom: '5px' }}>{f.name}</div>
                <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5, marginBottom: '12px' }}>{f.desc}</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: f.color }}>Buka →</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '0 32px 64px', maxWidth: '756px', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />

      {/* AYAT OF THE DAY */}
      <section style={{ maxWidth: '820px', margin: '0 auto', padding: '0 32px 64px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#22d3a0', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>Renungan Harian</div>
        <div style={{ fontSize: '24px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', marginBottom: '6px' }}>Ayat Hari Ini</div>
        <div style={{ fontSize: '14px', color: '#334155', marginBottom: '20px' }}>Ambil waktu sejenak untuk merenungkan firman Allah</div>
        <div style={{ border: '1px solid rgba(34,211,160,0.15)', background: 'rgba(34,211,160,0.04)', borderRadius: '20px', padding: '40px 36px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#22d3a0', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '24px' }}>✦ Ayat Pilihan ✦</div>
          {randomAyah.text && (
            <div style={{ fontFamily: "'Traditional Arabic', 'Scheherazade New', serif", fontSize: 'clamp(22px, 4vw, 34px)', color: '#f8fafc', direction: 'rtl', lineHeight: 2.1, marginBottom: '20px' }}>
              {randomAyah.text}
            </div>
          )}
          <div style={{ fontSize: '15px', color: '#64748b', fontStyle: 'italic', lineHeight: 1.7, marginBottom: '18px' }}>
            "{randomAyah.translation}"
          </div>
          <div style={{ display: 'inline-block', padding: '5px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, background: 'rgba(34,211,160,0.1)', border: '1px solid rgba(34,211,160,0.2)', color: '#22d3a0', letterSpacing: '0.04em' }}>
            QS. {randomAyah.surah}:{randomAyah.ayah}
          </div>
        </div>
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '0 32px 64px', maxWidth: '756px', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />

      {/* SURAH LIST */}
      <section style={{ maxWidth: '820px', margin: '0 auto', padding: '0 32px 64px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#22d3a0', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>Al-Qur'an</div>
        <div style={{ fontSize: '24px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', marginBottom: '6px' }}>Jelajahi 114 Surah</div>
        <div style={{ fontSize: '14px', color: '#334155', marginBottom: '16px' }}>Cari berdasarkan nama, arti, atau nomor</div>
        <input
          type="text"
          value={surahQuery}
          onChange={e => setSurahQuery(e.target.value)}
          placeholder='Ketik nama surah, arti, atau nomor...'
          style={{
            width: '100%', padding: '13px 18px', fontSize: '14px', fontFamily: 'inherit',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px', color: '#f1f5f9', outline: 'none', marginBottom: '14px',
            boxSizing: 'border-box', transition: 'border-color 0.2s',
          }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))', gap: '8px' }}>
          {filteredSurahs.map(s => (
            <Link key={s.n} href={`/quran/${s.n}`} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px', padding: '13px 14px', display: 'flex', alignItems: 'center',
                  gap: '12px', cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(34,211,160,0.06)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(34,211,160,0.2)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.06)';
                }}
              >
                <div style={{ width: '34px', height: '34px', background: 'rgba(34,211,160,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#22d3a0', flexShrink: 0 }}>{s.n}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{s.name}</div>
                  <div style={{ fontSize: '11px', color: '#334155', marginTop: '2px' }}>{s.arti} · {s.type} · {s.ayat} ayat</div>
                </div>
                <div style={{ fontFamily: "'Traditional Arabic', serif", fontSize: '17px', color: '#22d3a0', flexShrink: 0 }}>{s.ar}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '0 32px 64px', maxWidth: '756px', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />

      {/* CTA */}
      <section style={{ maxWidth: '820px', margin: '0 auto', padding: '0 32px 80px' }}>
        <div style={{ border: '1px solid rgba(34,211,160,0.12)', background: 'rgba(34,211,160,0.05)', borderRadius: '20px', padding: '52px 32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.03em', marginBottom: '10px' }}>
            Punya pertanyaan tentang Islam?
          </h2>
          <p style={{ color: '#475569', fontSize: '15px', marginBottom: '28px' }}>
            Tanyakan langsung — sistem kami siap mencarikan jawabannya
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => router.push('/search')}
              style={{ padding: '13px 28px', borderRadius: '12px', fontSize: '14px', fontWeight: 800, background: '#22d3a0', color: '#0b1120', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.01em', transition: 'all 0.15s' }}
            >
              ✦ Mulai Cari
            </button>
            <Link href="/surah" style={{ textDecoration: 'none' }}>
              <button style={{ padding: '13px 28px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.15s' }}>
                📖 Baca Al-Qur'an
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SikajiLogo size={24} />
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#22d3a0', letterSpacing: '-0.02em' }}>SiKAJI</span>
          <span style={{ fontSize: '11px', color: '#1e293b', fontWeight: 500 }}>Islamic AI Search</span>
        </div>
        <div style={{ fontSize: '12px', color: '#1e293b' }}>© 2025 SiKAJI — Dibuat untuk umat Muslim Indonesia</div>
      </footer>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
        input::placeholder { color: #334155; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}