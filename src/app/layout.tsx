import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { FontSizeProvider } from '@/contexts/FontSizeContext';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
});

export const metadata = {
  title: {
    default: "Kajiin - Cari. Kaji. Pahami.",
    template: "%s | Kajiin",
  },

  description:
    "Kajiin adalah platform pencarian dan pembelajaran ilmu Islam modern yang menghubungkan Al-Quran, Hadits, Tafsir, dan referensi terpercaya.",

  applicationName: "Kajiin",

  keywords: [
    "Kajiin",
    "Quran",
    "Hadits",
    "Tafsir",
    "Islam",
    "Kajian Islam",
  ],
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <FontSizeProvider>
            {children}
          </FontSizeProvider>
        </Providers>
      </body>
    </html>
  );
}