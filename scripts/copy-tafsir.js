// scripts/copy-tafsir-by-reference.js
const { Pool } = require('pg');

const localPool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'Kajiin29',
  database: 'Kajiin',
  port: 5432,
});

const neonPool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_e9NYUfAwI2Jb@ep-purple-waterfall-ao5g02js-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false },
});

async function copyTafsirByReference() {
  console.log('🚀 Copying TAFSIR using (surah, ayah) reference...\n');

  try {
    // 1. Ambil tafsir dari lokal dengan informasi surah + ayah
    console.log('📖 Reading tafsir from local with surah/ayah mapping...');
    const result = await localPool.query(`
      SELECT 
        t.id,
        t.verse_id,
        t.source,
        t.content,
        q.surah,
        q.ayah
      FROM tafsir t
      JOIN quran_verses q ON q.id = t.verse_id
      ORDER BY t.id
    `);

    console.log(`   Found ${result.rows.length} tafsir\n`);

    // 2. Hapus tafsir di Neon
    console.log('🗑️  Clearing tafsir in Neon...');
    await neonPool.query('TRUNCATE TABLE tafsir RESTART IDENTITY');
    console.log('✅ Cleared\n');

    // 3. Insert ke Neon dengan mapping ke verse_id yang benar
    console.log('🔄 Inserting tafsir to Neon...');
    let inserted = 0;
    let failed = 0;

    for (const row of result.rows) {
      // Cari verse_id di Neon berdasarkan (surah, ayah)
      const verseResult = await neonPool.query(
        'SELECT id FROM quran_verses WHERE surah = $1 AND ayah = $2',
        [row.surah, row.ayah]
      );

      if (verseResult.rows.length > 0) {
        const neonVerseId = verseResult.rows[0].id;
        await neonPool.query(
          'INSERT INTO tafsir (verse_id, source, content) VALUES ($1, $2, $3)',
          [neonVerseId, row.source, row.content]
        );
        inserted++;
      } else {
        failed++;
        console.log(`   ⚠️ Verse not found in Neon: Surah ${row.surah}, Ayah ${row.ayah}`);
      }

      if ((inserted + failed) % 500 === 0) {
        console.log(`   ✅ Inserted ${inserted}, Failed ${failed}`);
      }
    }

    console.log(`\n✅ Inserted: ${inserted}`);
    console.log(`⚠️ Failed: ${failed}`);

    // 4. Verifikasi
    const verify = await neonPool.query('SELECT COUNT(*) FROM tafsir');
    console.log(`\n📊 Tafsir di Neon sekarang: ${verify.rows[0].count}`);

    console.log('\n🎉 SELESAI!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  process.exit();
}

copyTafsirByReference();