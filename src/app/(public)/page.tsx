'use client';

import dynamic from 'next/dynamic';

// ✅ PASTIKAN PATH-NYA BENAR (relative)
const HomeContent = dynamic(() => import('./HomeContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#0b1120] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
    </div>
  ),
});

export default function HomePage() {
  return <HomeContent />;
}