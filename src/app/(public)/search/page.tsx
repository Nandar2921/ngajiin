'use client';

import dynamic from 'next/dynamic';

// ✅ PASTIKAN PATH-NYA BENAR (relative)
const SearchContent = dynamic(() => import('./SearchContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
    </div>
  ),
});

export default function SearchPage() {
  return <SearchContent />;
}