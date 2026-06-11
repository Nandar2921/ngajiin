const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'sikaji29',
  database: 'sikaji',
});

// Daftar kitab hadits dengan endpoint yang benar (sesuai API Sutanlab)
const hadithBooks = [
  { name: 'bukhari', displayName: 'Shahih Bukhari', nameArabic: 'صحيح البخاري', nameIndonesian: 'Shahih Bukhari' },
  { name: 'muslim', displayName: 'Shahih Muslim', nameArabic: 'صحيح مسلم', nameIndonesian: 'Shahih Muslim' },
  { name: 'tirmidzi', displayName: 'Sunan Tirmidzi', nameArabic: 'جامع الترمذي', nameIndonesian: 'Sunan Tirmidzi' },
  { name: 'nasai', displayName: 'Sunan Nasai', nameArabic: 'سنن النسائي', nameIndonesian: 'Sunan Nasai' },
  { name: 'abudaud', displayName: 'Sunan Abu Daud', nameArabic: 'سنن أبي داود', nameIndonesian: 'Sunan Abu Daud' },
  { name: 'ibnumajah', displayName: 'Sunan Ibnu Majah', nameArabic: 'سنن ابن ماجه', nameIndonesian: 'Sunan Ibnu Majah' },
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function importAllHadith() {
  console.log('📥 MENGIMPOR HADITS DARI API SUTANLAB\n');

  for (const book of hadithBooks) {
    console.log(`📖 Memproses kitab: ${book.displayName}...`);

    // 1. Tambahkan kitab ke database jika belum ada
    let bookId;
    const bookCheck = await pool.query(`SELECT id FROM hadith_books WHERE name = $1`, [book.displayName]);
    if (bookCheck.rows.length === 0) {
      const insertBook = await pool.query(
        `INSERT INTO hadith_books (name, name_arabic, name_indonesian) VALUES ($1, $2, $3) RETURNING id`,
        [book.displayName, book.nameArabic, book.nameIndonesian]
      );
      bookId = insertBook.rows[0].id;
      console.log(`   ✅ Kitab baru ditambahkan (ID: ${bookId})`);
    } else {
      bookId = bookCheck.rows[0].id;
      console.log(`   ✅ Kitab sudah ada (ID: ${bookId})`);
    }

    // 2. Ambil data hadits dari API (sample 20 hadits per kitab)
    try {
      const apiUrl = `https://api.hadith.sutanlab.id/books/${book.name}?range=1-20`;
      console.log(`   📡 Mengambil data dari: ${apiUrl}`);
      const response = await fetch(apiUrl);

      if (!response.ok) {
        console.log(`   ⚠️ Gagal mengambil data untuk ${book.displayName} (HTTP ${response.status})`);
        continue;
      }

      const data = await response.json();
      if (!data?.data?.hadiths) {
        console.log(`   ⚠️ Format data tidak sesuai untuk ${book.displayName}`);
        continue;
      }

      let newHadithCount = 0;
      for (const hadith of data.data.hadiths) {
        const existing = await pool.query(`SELECT id FROM hadiths WHERE book_id = $1 AND number = $2`, [bookId, hadith.number]);
        if (existing.rows.length === 0) {
          await pool.query(
            `INSERT INTO hadiths (book_id, number, arabic, translation, narrator, grade, reference) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              bookId,
              hadith.number,
              hadith.arabic || '',
              hadith.translation || '',
              hadith.narrator || 'Unknown',
              hadith.grade || 'Shahih',
              `HR. ${book.displayName} No. ${hadith.number}`
            ]
          );
          newHadithCount++;
        }
      }
      console.log(`   ✅ Berhasil mengimpor ${newHadithCount} hadits baru dari ${book.displayName}.`);

    } catch (error) {
      console.error(`   ❌ Error saat memproses ${book.displayName}:`, error.message);
    }

    await delay(1000); // Jeda agar tidak overload API
  }

  console.log('\n🎉 Proses impor selesai!');
  const result = await pool.query('SELECT COUNT(*) FROM hadiths');
  console.log(`📚 Total hadits di database saat ini: ${result.rows[0].count}`);

  await pool.end();
}

importAllHadith();