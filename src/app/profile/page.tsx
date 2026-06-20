'use client';

import dynamic from 'next/dynamic';

// ✅ Dynamic import dengan ssr: false
const ProfileContent = dynamic(() => import('./ProfileContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#0b1120] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
    </div>
  ),
});

export default function ProfilePage() {
  return <ProfileContent />;
}