'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// SVG Logo Component (sama persis dengan homepage)
function SikajiLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="36" rx="9" fill="#0f1f14" />
      <path d="M18 10 C14 10 9 12 9 14 L9 26 C9 26 13 24 18 24" stroke="#22d3a0" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M18 10 C22 22 27 12 27 14 L27 26 C27 26 23 24 18 24" stroke="#22d3a0" strokeWidth="1.5" strokeLinecap="round" fill="none" />
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

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = ['Beranda', "Al-Qur'an", 'Hadits', 'Tafsir', 'Doa', 'Explore'];
  const linkMap: Record<string, string> = {
    'Beranda': '/',
    "Al-Qur'an": '/surah',
    'Hadits': '/hadith',
    'Tafsir': '/tafsir',
    'Doa': '/doa',
    'Explore': '/explore',
  };

  const getPath = () => {
    if (typeof window === 'undefined') return '';
    return window.location.pathname;
  };

  const isActive = (path: string) => getPath() === path;

  if (status === 'loading') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: '62px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(11,17,32,0.92)', backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SikajiLogo size={32} />
          <div>
            <div style={{ fontSize: '16px', fontWeight: 900, color: '#f1f5f9' }}>Si<span style={{ color: '#22d3a0' }}>KAJI</span></div>
            <div style={{ fontSize: '8px', color: '#334155', marginTop: '1px' }}>Sistem Informasi Kajian Islam</div>
          </div>
        </div>
        <div style={{ fontSize: '12px', color: '#475569' }}>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <nav className="sikaji-navbar" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: '62px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'sticky', top: 0, zIndex: 20,
        background: 'rgba(11,17,32,0.92)',
        backdropFilter: 'blur(12px)',
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <SikajiLogo size={32} />
          <div>
            <div style={{ fontSize: '16px', fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.03em' }}>
              Si<span style={{ color: '#22d3a0' }}>KAJI</span>
            </div>
            <div style={{ fontSize: '8px', fontWeight: 600, color: '#334155', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '1px' }}>
              Sistem Informasi Kajian Islam
            </div>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="sikaji-desktop-menu" style={{ display: 'flex', gap: '4px' }}>
          {navLinks.map(link => {
            const path = linkMap[link];
            const active = isActive(path);
            return (
              <Link
                key={link}
                href={path}
                style={{
                  padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
                  color: active ? '#f1f5f9' : '#64748b',
                  background: active ? 'rgba(255,255,255,0.06)' : 'none',
                  textDecoration: 'none', transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.color = '#f1f5f9';
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.color = '#64748b';
                }}
              >
                {link}
              </Link>
            );
          })}
        </div>

        {/* Right Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {session ? (
            <>
              {/* Tombol Profile */}
              <Link
                href="/profile"
                style={{
                  padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 500,
                  color: '#64748b', textDecoration: 'none', transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#f1f5f9')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
              >
                Profile
              </Link>
              
              <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>
                {session.user?.name}
              </span>
              
              {session.user?.role === 'admin' && (
                <Link
                  href="/admin"
                  style={{
                    padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                    background: 'rgba(34,211,160,0.1)', border: '1px solid rgba(34,211,160,0.2)',
                    color: '#22d3a0', textDecoration: 'none',
                  }}
                >
                  Admin
                </Link>
              )}
              
              <button
                onClick={() => signOut()}
                style={{
                  padding: '7px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                  background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
                  color: '#f87171', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                style={{ fontSize: '13px', fontWeight: 500, color: '#64748b', textDecoration: 'none' }}
              >
                Masuk
              </Link>
              <button
                onClick={() => router.push('/register')}
                style={{
                  padding: '7px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
                  background: '#22d3a0', color: '#0b1120', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Mulai
              </button>
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sikaji-mobile-btn"
            style={{
              background: 'none', border: 'none', color: '#f1f5f9',
              fontSize: '22px', cursor: 'pointer', display: 'none',
            }}
            aria-label="Menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div style={{
          position: 'absolute', top: '62px', left: 0, right: 0,
          background: '#0b1120', borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '16px 32px', display: 'flex', flexDirection: 'column', gap: '12px',
          zIndex: 19, backdropFilter: 'blur(12px)',
        }}>
          {navLinks.map(link => {
            const path = linkMap[link];
            return (
              <Link
                key={link}
                href={path}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: '10px 0', fontSize: '15px', fontWeight: 500,
                  color: '#94a3b8', textDecoration: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {link}
              </Link>
            );
          })}
          
          {/* Profile di Mobile Menu */}
          {session && (
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: '10px 0', fontSize: '15px', fontWeight: 500,
                color: '#94a3b8', textDecoration: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              Profile
            </Link>
          )}
          
          <hr style={{ borderColor: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
          
          {!session ? (
            <>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} style={{ padding: '10px 0', color: '#94a3b8', textDecoration: 'none' }}>
                Masuk
              </Link>
              <button onClick={() => { router.push('/register'); setMobileMenuOpen(false); }} style={{ padding: '10px 0', background: 'none', border: 'none', color: '#22d3a0', textAlign: 'left', fontSize: '15px', cursor: 'pointer' }}>
                Mulai
              </button>
            </>
          ) : (
            <>
              {session.user?.role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    padding: '10px 0', fontSize: '15px', fontWeight: 500,
                    color: '#22d3a0', textDecoration: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={() => { signOut(); setMobileMenuOpen(false); }}
                style={{
                  padding: '10px 0', fontSize: '15px', fontWeight: 500,
                  color: '#f87171', textDecoration: 'none', textAlign: 'left',
                  cursor: 'pointer', background: 'none', border: 'none',
                  width: '100%',
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .sikaji-desktop-menu {
            display: none !important;
          }
          .sikaji-mobile-btn {
            display: block !important;
          }
          nav {
            padding: 0 16px !important;
          }
        }
      `}</style>
    </>
  );
}