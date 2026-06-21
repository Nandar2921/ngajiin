import { defineConfig } from 'drizzle-kit';
import { config as loadEnv } from 'dotenv';

// [FIX] Sebelumnya url di-hardcode ke Postgres Docker lokal
// (postgresql://postgres:sikaji29@localhost:5433/sikaji). Karena itu,
// `drizzle-kit migrate` selalu mencoba connect ke localhost:5433 — yang di
// komputer manapun selain mesin dev awal pasti tidak ada apa-apa di situ,
// sehingga command nyangkut/gagal. Sekarang baca DATABASE_URL dari .env,
// sama seperti yang dipakai aplikasi Next.js-nya sendiri (lihat src/lib/db/index.ts).
//
// Next.js otomatis baca .env DAN .env.local (.env.local diprioritaskan),
// tapi package `dotenv` secara default cuma baca .env. Supaya konsisten
// dengan punya Next.js, dua-duanya di-load di sini.

loadEnv({ path: '.env.local', override: true });

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL tidak ditemukan. Pastikan file .env atau .env.local berisi DATABASE_URL=postgresql://neondb_owner:npg_e9NYUfAwI2Jb@ep-purple-waterfall-ao5g02js-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
  );
}

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});