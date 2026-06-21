import type { Config } from 'tailwindcss';

// [FIX BUG #8] Hapus tailwind.config.js — pertahankan file ini saja (tailwind.config.ts)
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        arabic: ['var(--font-arabic)', 'Amiri', 'Scheherazade New', 'serif'],
        sans: ['var(--font-sans)', 'Inter', 'sans-serif'],
      },
      colors: {
        dark: {
          bg: '#1a1a2e',
          card: '#16213e',
          text: '#e2e8f0',
        },
        // [UI REFRESH] Token baru berbasis CSS variable (lihat globals.css)
        // dipakai komponen hasil redesign (Navbar, Footer, BottomNav, dst).
        // Ditambahkan di samping warna `dark.*` di atas, bukan menggantikan,
        // supaya komponen lama yang masih pakai dark:bg-gray-900 dst tetap aman.
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        border: 'var(--border)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        brand: {
          emerald: '#10b981',
          'emerald-dark': '#059669',
          accent: '#f59e0b',
        },
      },
    },
  },
  plugins: [],
};

export default config;
