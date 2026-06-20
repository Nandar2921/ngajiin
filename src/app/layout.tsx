import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { FontSizeProvider } from '@/contexts/FontSizeContext';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'SiKAJI - Sistem Informasi Kajian Islam',
    template: '%s | SiKAJI'
  },
  description: 'Platform kajian Islam modern dengan Al-Quran, Tafsir, dan Hadits.',
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