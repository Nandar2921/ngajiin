import { ReactNode } from 'react';

// [UI REFRESH] Sebelumnya file ini bungkus ulang <SessionProvider> (padahal
// root layout/providers.tsx sudah membungkus SEMUA halaman dengan
// SessionProvider — jadi dobel/redundan) dan render <Navbar /> sendiri
// (sekarang Navbar sudah global di root layout, jadi kalau dipertahankan
// di sini Navbar akan muncul DUA KALI di halaman Home & Search).
// Container max-width tetap dipertahankan untuk sementara supaya halaman
// yang belum di-redesign (HomeContent, SearchContent) tidak kehilangan
// styling-nya.
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {children}
    </div>
  );
}
