import { BookOpen, Search } from 'lucide-react';

// [UI REFRESH] Logo baru KAJIIN — menggantikan SikajiLogo SVG lama yang ada
// inline di Navbar.tsx. Konsepnya: buku terbuka (ilmu) + kaca pembesar
// (mencari), sesuai tagline "Cari. Kaji. Pahami."
export default function Logo({
  className = '',
  size = 'default',
}: {
  className?: string;
  size?: 'default' | 'large';
}) {
  const isLarge = size === 'large';

  return (
    <div
      className={`relative flex items-center justify-center bg-gradient-to-br from-emerald-900 via-[#0a2e24] to-[#021812] text-white shadow-xl overflow-hidden shrink-0 ring-1 ring-white/10 ${
        isLarge ? 'w-20 h-20 rounded-[1.75rem]' : 'w-10 h-10 rounded-xl'
      } ${className}`}
    >
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-100/15 via-transparent to-transparent opacity-80 mix-blend-overlay"></div>
      <div className="absolute inset-0 rounded-inherit ring-1 ring-inset ring-emerald-500/20"></div>

      <div className="relative z-10 flex items-center justify-center w-full h-full group">
        <div className="relative flex items-center justify-center">
          <BookOpen
            className={`${isLarge ? 'w-10 h-10' : 'w-[22px] h-[22px]'} text-emerald-50/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] transition-transform duration-500 group-hover:scale-105`}
            strokeWidth={isLarge ? 1.5 : 2}
          />
          <div
            className={`absolute ${isLarge ? '-bottom-1.5 -right-1.5' : '-bottom-1 -right-1'} bg-emerald-950/95 shadow-[0_4px_10px_rgba(0,0,0,0.5)] rounded-full ${
              isLarge ? 'p-1.5 ring-2 ring-amber-400/80' : 'p-[3px] ring-1 ring-amber-400/80'
            } z-20 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:-translate-x-0.5 backdrop-blur-sm`}
          >
            <Search className={`${isLarge ? 'w-4 h-4' : 'w-[10px] h-[10px]'} text-amber-300`} strokeWidth={3} />
          </div>
        </div>
      </div>
    </div>
  );
}
