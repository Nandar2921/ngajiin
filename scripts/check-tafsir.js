require('dotenv').config();
// scripts/check-tafsir.js
const { Pool } = require('pg');

// Koneksi ke Neon
const neonPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Koneksi ke Lokal
const localPool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'sikaji29',
  database: 'sikaji',
  port: 5432,
});

async function checkTafsir() {
  console.log('🔍 Checking TAFSIR data...\n');

  try {
    // Cek di Neon
    const neonResult = await neonPool.query('SELECT COUNT(*) FROM tafsir');
    console.log(`📊 Tafsir di Neon: ${neonResult.rows[0].count}`);

    // Cek di Lokal
    const localResult = await localPool.query('SELECT COUNT(*) FROM tafsir');
    console.log(`📊 Tafsir di Lokal: ${localResult.rows[0].count}`);

    // Sample data jika ada
    if (parseInt(neonResult.rows[0].count) > 0) {
      const sample = await neonPool.query('SELECT * FROM tafsir LIMIT 3');
      console.log('\n📖 Sample tafsir di Neon:');
      for (const row of sample.rows) {
        console.log(`   ID: ${row.id} | Verse: ${row.verse_id} | Source: ${row.source}`);
        console.log(`   Content: ${row.content?.substring(0, 100)}...`);
        console.log('');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  process.exit();
}

checkTafsir();