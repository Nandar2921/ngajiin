'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, LibraryBig, ScrollText, BookHeart } from 'lucide-react';

// [UI REFRESH] Komponen baru — sebelumnya tidak ada navigasi bawah untuk
// mobile sama sekali. Hanya tampil di layar kecil (md:hidden), menu akun
// (profil/admin/login/logout) tetap di Navbar atas, bukan di sini.
export default function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Beranda', icon: Home },
    { href: '/surah', label: "Qur'an", icon: BookOpen },
    { href: '/hadith', label: 'Hadits', icon: LibraryBig },
    { href: '/tafsir', label: 'Tafsir', icon: ScrollText },
    { href: '/doa', label: 'Doa', icon: BookHeart },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none flex justify-center pb-6 md:hidden">
      <nav className="pointer-events-auto bg-background/95 backdrop-blur-xl border border-border/50 shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] rounded-full px-2 py-2 w-full max-w-sm">
        <div className="flex justify-between items-center h-14 w-full">
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group flex flex-col items-center justify-center w-16 h-full space-y-1 transition-all ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div
                  className={`p-2 rounded-full transition-all duration-300 relative ${
                    isActive ? 'bg-primary/10 shadow-sm scale-110' : 'bg-transparent group-hover:bg-muted'
                  }`}
                >
                  <link.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                {isActive && <span className="text-[10px] font-bold tracking-wide">{link.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
