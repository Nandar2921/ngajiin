const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  user: 'postgres',
  password: 'sikaji29',
  database: 'sikaji',
});

// Hanya kitab yang respons API-nya valid (Bukhari & Muslim)
const BOOKS = [
  { name: 'Shahih Bukhari', slug: 'bukhari' },
  { name: 'Shahih Muslim', slug: 'muslim' },
];

const LIMIT = 300; // Maksimal range per request API Gading

async function importHadith() {
  console.log('📥 IMPORT MASSAL HADITS (BUKHARI & MUSLIM) DARI API GADING\n');

  for (const book of BOOKS) {
    console.log(`📖 ${book.name}...`);

    // Cari ID kitab di database
    const bookResult = await pool.query(`SELECT id FROM hadith_books WHERE slug = $1`, [book.slug]);
    if (bookResult.rows.length === 0) {
      console.log(`   ❌ Kitab ${book.name} tidak ditemukan di database.`);
      continue;
    }
    const bookId = bookResult.rows[0].id;

    let totalInserted = 0;
    let start = 1;
    let hasMore = true;

    while (hasMore) {
      const end = start + LIMIT - 1;
      const url = `https://api.hadith.gading.dev/books/${book.slug}?range=${start}-${end}`;
      console.log(`   📡 Mengambil hadits ${start}-${end}...`);

      try {
        const response = await fetch(url);
        const result = await response.json();
        const hadiths = result.data?.hadiths;

        if (!hadiths || hadiths.length === 0) {
          console.log(`   ✅ Tidak ada data lagi. Total diimpor: ${totalInserted} hadits.\n`);
          hasMore = false;
          break;
        }

        let batchInserted = 0;
        for (const h of hadiths) {
          const number = h.number;
          const arabic = h.arab || '';
          const translation = h.id || '';

          if (!arabic && !translation) continue;

          const existing = await pool.query(
            `SELECT id FROM hadiths WHERE book_id = $1 AND number = $2`,
            [bookId, number]
          );

          if (existing.rows.length === 0) {
            await pool.query(
              `INSERT INTO hadiths (book_id, number, arabic, translation, narrator, grade, reference) 
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [bookId, number, arabic, translation, 'N/A', 'Shahih', `${book.name} No. ${number}`]
            );
            batchInserted++;
          }
        }

        totalInserted += batchInserted;
        console.log(`   ✅ Halaman ${start}-${end}: +${batchInserted} hadits (Total: ${totalInserted})`);

        // Jika jumlah hadits yang diterima kurang dari LIMIT, berarti ini halaman terakhir
        if (hadiths.length < LIMIT) {
          console.log(`   ✅ Selesai. Total diimpor: ${totalInserted} hadits.\n`);
          hasMore = false;
        } else {
          start += LIMIT;
        }
      } catch (err) {
        console.error(`   ❌ Error untuk ${book.name} pada range ${start}-${end}: ${err.message}\n`);
        hasMore = false;
      }
    }
  }

  const result = await pool.query('SELECT COUNT(*) FROM hadiths');
  console.log(`📚 TOTAL HADITS DI DATABASE: ${result.rows[0].count}`);
  await pool.end();
}

importHadith();