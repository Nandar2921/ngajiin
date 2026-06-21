import Link from 'next/link';

// [UI REFRESH] Sebelumnya tidak ada Footer component reusable — footer
// hanya ditulis inline di beberapa halaman saja (Home, Login, Register,
// dst), sehingga tidak konsisten. Sekarang jadi satu komponen yang dipasang
// global lewat root layout, jadi muncul konsisten di semua halaman.
export default function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto pt-8 pb-28 md:pb-8 md:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col items-center md:items-start">
          <span className="font-bold text-lg tracking-tight text-foreground">
            KAJI<span className="text-primary">IN</span>
          </span>
          <p className="text-sm text-muted-foreground mt-1 text-center md:text-left">
            Platform ilmu Islam modern dari Indonesia untuk dunia.
          </p>
        </div>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            Beranda
          </Link>
          <Link href="/explore" className="hover:text-primary transition-colors">
            Explore
          </Link>
          <Link href="/profile" className="hover:text-primary transition-colors">
            Profil
          </Link>
        </div>
      </div>
    </footer>
  );
}
