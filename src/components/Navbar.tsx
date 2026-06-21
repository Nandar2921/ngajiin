'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Search, Moon, Sun, User, LogOut, Menu, X } from 'lucide-react';
import Logo from './Logo';

// [UI REFRESH] Navbar didesain ulang mengikuti hasil desain Stitch (layout,
// responsive, dark/light toggle), TAPI semua logic auth asli dipertahankan
// 100% sama seperti Navbar lama: useSession/signOut dari next-auth,
// pengecekan session.user?.role === 'admin' untuk link Admin, dan alur
// login/register yang sama. Brand text diperbarui dari "SiKAJI" -> "KAJIIN"
// sesuai rebranding resmi.
export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { label: "Al-Qur'an", href: '/surah' },
    { label: 'Hadits', href: '/hadith' },
    { label: 'Tafsir', href: '/tafsir' },
    { label: 'Doa', href: '/doa' },
    { label: 'Explore', href: '/explore' },
  ];

  const isActive = (path: string) => pathname === path || (path !== '/' && pathname?.startsWith(path));

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <Logo />
            <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-foreground">
              KAJI<span className="text-primary">IN</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex flex-1 justify-center space-x-1 lg:space-x-2 xl:space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 xl:px-4 py-2 rounded-full font-semibold transition-all text-sm xl:text-base ${
                  isActive(link.href)
                    ? 'text-primary bg-primary/10'
                    : 'text-foreground/80 hover:text-primary hover:bg-primary/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Link
              href="/search"
              className="p-2 text-foreground/80 hover:text-primary hover:bg-primary/10 rounded-full transition-all"
              aria-label="Cari"
            >
              <Search className="w-5 h-5 md:w-[22px] md:h-[22px]" />
            </Link>

            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 text-foreground/80 hover:text-primary hover:bg-primary/10 rounded-full transition-all"
                aria-label="Ganti tema"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 md:w-[22px] md:h-[22px]" /> : <Moon className="w-5 h-5 md:w-[22px] md:h-[22px]" />}
              </button>
            )}

            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse ml-1" />
            ) : session ? (
              <>
                <Link
                  href="/profile"
                  className="hidden sm:flex p-2 text-foreground/80 hover:text-primary hover:bg-primary/10 rounded-full transition-all"
                  aria-label="Profil"
                >
                  <User className="w-5 h-5 md:w-[22px] md:h-[22px]" />
                </Link>

                {session.user?.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all ml-1"
                  >
                    Admin
                  </Link>
                )}

                <button
                  onClick={() => signOut()}
                  className="hidden sm:flex p-2 text-rose-500 hover:bg-rose-500/10 rounded-full transition-all ml-1"
                  aria-label="Keluar"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2 ml-1">
                <Link href="/login" className="px-3 py-2 text-sm font-semibold text-foreground/80 hover:text-primary transition-colors">
                  Masuk
                </Link>
                <button
                  onClick={() => router.push('/register')}
                  className="px-4 py-2 rounded-full text-sm font-bold bg-primary text-white hover:bg-brand-emerald-dark transition-colors"
                >
                  Mulai
                </button>
              </div>
            )}

            {/* Mobile hamburger — buat akses Profile/Admin/Login/Logout di layar kecil
                (BottomNav cuma nampung 5 menu konten utama, bukan menu akun) */}
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="sm:hidden p-2 text-foreground/80 hover:text-primary hover:bg-primary/10 rounded-full transition-all"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown (akun & menu yang tidak ada di BottomNav) */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-border bg-background/95 backdrop-blur-xl px-4 py-4 space-y-1">
          {status === 'loading' ? null : session ? (
            <>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-foreground/90 hover:bg-primary/10 font-medium"
              >
                <User className="w-4 h-4" /> Profil ({session.user?.name})
              </Link>
              {session.user?.role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-primary font-semibold hover:bg-primary/10"
                >
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-rose-500 hover:bg-rose-500/10 font-medium text-left"
              >
                <LogOut className="w-4 h-4" /> Keluar
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-foreground/90 hover:bg-primary/10 font-medium"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl bg-primary text-white font-semibold text-center"
              >
                Mulai Sekarang
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
