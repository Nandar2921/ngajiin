const { Pool } = require('pg');

// Database lama (port 5433 - PostgreSQL asli)
const oldPool = new Pool({
  host: 'localhost',
  port: 5433,
  user: 'postgres',
  password: 'Kajiin29',
  database: 'Kajiin',
});

// Database baru (port 5433 - Docker pgvector)
const newPool = new Pool({
  host: 'localhost',
  port: 5433,
  user: 'postgres',
  password: 'Kajiin29',
  database: 'Kajiin',
});

async function copyData() {
  console.log('🚀 Mulai copy data hadits...\n');

  try {
    // 1. Copy hadith_books
    console.log('📚 Copy tabel hadith_books...');
    const books = await oldPool.query('SELECT * FROM hadith_books');
    console.log(`   Ditemukan ${books.rows.length} kitab`);

    for (const book of books.rows) {
      await newPool.query(`
        INSERT INTO hadith_books (id, name, name_indonesian, total_hadith)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO NOTHING
      `, [book.id, book.name, book.name_indonesian, book.total_hadith]);
    }
    console.log('   ✅ Kitab selesai');

    // 2. Copy hadiths
    console.log('\n📜 Copy tabel hadiths...');
    const hadiths = await oldPool.query('SELECT * FROM hadiths');
    console.log(`   Ditemukan ${hadiths.rows.length} hadits`);

    let inserted = 0;
    let skipped = 0;

    for (const h of hadiths.rows) {
      try {
        await newPool.query(`
          INSERT INTO hadiths (
            id, number, arabic, translation, narrator, 
            grade, reference, book_id, book_name
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (id) DO NOTHING
        `, [
          h.id, h.number, h.arabic, h.translation, h.narrator,
          h.grade, h.reference, h.book_id, h.book_name
        ]);
        inserted++;
      } catch (err) {
        skipped++;
        console.log(`   ⚠️ Skip hadith ${h.id}: ${err.message}`);
      }
    }

    console.log(`\n✅ Selesai!`);
    console.log(`   📚 Kitab: ${books.rows.length}`);
    console.log(`   📜 Hadits: ${inserted} berhasil, ${skipped} skip`);

    // 3. Verifikasi
    const verifyBooks = await newPool.query('SELECT COUNT(*) FROM hadith_books');
    const verifyHadiths = await newPool.query('SELECT COUNT(*) FROM hadiths');
    
    console.log(`\n📊 Verifikasi database baru:`);
    console.log(`   Kitab: ${verifyBooks.rows[0].count}`);
    console.log(`   Hadits: ${verifyHadiths.rows[0].count}`);

  } catch (err) {
    console.error('❌ Error:', err.message);
  }

  process.exit();
}

copyData();