const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
});
// Mapping bookId dari dataset ke database SiKAJI (sesuai dengan struktur `hadith_books`)
const BOOK_MAPPING = {
  'bukhari': { name: 'Sahih Bukhari', slug: 'bukhari', nameArabic: 'صحيح البخاري', nameIndonesian: 'Shahih Bukhari' },
  'muslim': { name: 'Sahih Muslim', slug: 'muslim', nameArabic: 'صحيح مسلم', nameIndonesian: 'Shahih Muslim' },
  'abudawud': { name: 'Sunan Abi Dawud', slug: 'abudawud', nameArabic: 'سنن أبي داود', nameIndonesian: 'Sunan Abu Daud' },
  'tirmidhi': { name: 'Jami at-Tirmidhi', slug: 'tirmidhi', nameArabic: 'جامع الترمذي', nameIndonesian: 'Sunan Tirmidzi' },
  'nasai': { name: 'Sunan an-Nasai', slug: 'nasai', nameArabic: 'سنن النسائي', nameIndonesian: 'Sunan Nasai' },
  'ibnmajah': { name: 'Sunan Ibn Majah', slug: 'ibnmajah', nameArabic: 'سنن ابن ماجه', nameIndonesian: 'Sunan Ibnu Majah' },
};

async function importBook(bookKey, filePath) {
  console.log(`\n📖 Importing ${bookKey}...`);
  
  const bookInfo = BOOK_MAPPING[bookKey];
  if (!bookInfo) {
    console.log(`   ⚠️ Skip ${bookKey} - no mapping`);
    return 0;
  }
  
  // 1. Cari atau buat kitab di `hadith_books`
  let bookResult = await pool.query(`SELECT id FROM hadith_books WHERE slug = $1`, [bookInfo.slug]);
  let bookId;
  
  if (bookResult.rows.length === 0) {
    const insertResult = await pool.query(
      `INSERT INTO hadith_books (name, slug, name_arabic, name_indonesian) 
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [bookInfo.name, bookInfo.slug, bookInfo.nameArabic, bookInfo.nameIndonesian]
    );
    bookId = insertResult.rows[0].id;
    console.log(`   ✅ Kitab baru (ID: ${bookId})`);
  } else {
    bookId = bookResult.rows[0].id;
    console.log(`   ✅ Kitab sudah ada (ID: ${bookId})`);
  }

  // 2. Baca file JSON
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const hadiths = Array.isArray(data) ? data : data.hadiths || [];
  
  console.log(`   📊 Total hadits di file: ${hadiths.length}`);
  
  let count = 0;
  for (const h of hadiths) {
    const number = h.id || h.number;
    const arabic = h.arabic || h.arab || '';
    const narrator = h.english?.narrator || h.narrator || 'Unknown';
    const grade = h.grade || 'Shahih'; // Default jika tidak ada grade
    const reference = `${bookInfo.name} No. ${number}`;
    const translation = h.english?.text || h.translation || '';
    
    if (!arabic && !translation) continue;
    
    // Cek apakah hadits sudah ada
    const existing = await pool.query(
      `SELECT id FROM hadiths WHERE book_id = $1 AND number = $2`,
      [bookId, number]
    );
    
    if (existing.rows.length === 0) {
      // Insert ke tabel `hadiths` (kolom yang sesuai)
      await pool.query(
        `INSERT INTO hadiths (book_id, number, arabic, translation, grade, narrator, reference) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [bookId, number, arabic, translation, grade, narrator, reference]
      );
      count++;
      
      if (count % 1000 === 0) {
        console.log(`   📊 ${count} hadits...`);
      }
    }
  }
  
  console.log(`   ✅ +${count} hadits baru`);
  return count;
}

async function importAll() {
  console.log('========================================');
  console.log('📥 IMPORT HADITS DARI AHMEDBASET DATASET');
  console.log('========================================\n');
  
  const dataDir = path.join(__dirname, 'hadith-dataset', 'db', 'by_book', 'the_9_books');
  let total = 0;
  
  const files = [
    { key: 'bukhari', file: 'bukhari.json' },
    { key: 'muslim', file: 'muslim.json' },
    { key: 'abudawud', file: 'abudawud.json' },
    { key: 'tirmidhi', file: 'tirmidhi.json' },
    { key: 'nasai', file: 'nasai.json' },
    { key: 'ibnmajah', file: 'ibnmajah.json' },
  ];
  
  for (const f of files) {
    const filePath = path.join(dataDir, f.file);
    if (fs.existsSync(filePath)) {
      const count = await importBook(f.key, filePath);
      total += count;
    } else {
      console.log(`⚠️ File ${f.file} tidak ditemukan`);
    }
  }
  
  console.log('\n========================================');
  console.log('🎉 IMPORT SELESAI!');
  console.log('========================================');
  console.log(`✅ Total hadits baru: ${total}`);
  
  const result = await pool.query('SELECT COUNT(*) FROM hadiths');
  console.log(`📚 Total hadits di database: ${result.rows[0].count}`);
  
  await pool.end();
}

importAll();