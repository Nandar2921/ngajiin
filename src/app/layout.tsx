import type { Metadata } from 'next';
import { Inter, Amiri } from 'next/font/google';
import { Providers } from './providers';
import { FontSizeProvider } from '@/contexts/FontSizeContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

// [FIX] Sebelumnya class `.font-arabic` di globals.css mereferensikan font
// "Amiri" tapi font-nya tidak pernah benar-benar di-load dari Google Fonts
// (tidak ada <link>, tidak ada next/font, tidak ada @import yang valid).
// Akibatnya teks Arab di seluruh app selama ini selalu fallback ke font
// default sistem, bukan Amiri. Sekarang di-load dengan benar via next/font.
const amiri = Amiri({
  weight: ['400', '700'],
  subsets: ['arabic'],
  variable: '--font-arabic',
});

export const metadata: Metadata = {
  title: {
    default: 'KAJIIN | Cari. Kaji. Pahami.',
    template: '%s | KAJIIN',
  },
  description: 'Platform ilmu Islam modern dari Indonesia untuk dunia — Al-Qur\'an, Hadits, Tafsir, dan Doa dalam satu tempat.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${amiri.variable} font-sans antialiased flex flex-col min-h-screen`}
        suppressHydrationWarning
      >
        <Providers>
          <FontSizeProvider>
            {/* [UI REFRESH] Navbar, Footer, dan BottomNav sebelumnya HANYA
                terpasang di route group (public) — yaitu cuma di halaman
                Home & Search. Halaman Qur'an, Hadits, Tafsir, Doa, Explore,
                Profile sama sekali tidak punya navigasi. Sekarang dipasang
                di root layout supaya konsisten muncul di semua halaman. */}
            <Navbar />
            <main className="flex-grow pt-20 pb-24 md:pb-0">{children}</main>
            <BottomNav />
            <Footer />
          </FontSizeProvider>
        </Providers>
      </body>
    </html>
  );
}
