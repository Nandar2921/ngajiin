'use client';

import { SessionProvider } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import { ReactNode } from 'react';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-[#0b1120]">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}