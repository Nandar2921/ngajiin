require('dotenv').config();
﻿const { Pool } = require('pg');

const localPool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'sikaji29',
  database: 'sikaji',
  port: 5432,
});

const neonPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function copyQuranWithTranslation() {
  console.log('🚀 Copying Quran WITH translation from local to Neon...\n');
  
  try {
    console.log('📡 Testing connections...');
    await localPool.query('SELECT 1');
    await neonPool.query('SELECT 1');
    console.log('✅ Both connections successful\n');
    
    // 1. Cek data di lokal
    console.log('📖 Checking local Quran data...');
    const localCount = await localPool.query('SELECT COUNT(*) FROM quran_verses');
    console.log(`   Local Quran: ${localCount.rows[0].count} verses`);
    
    const localTranslation = await localPool.query(
      "SELECT COUNT(*) FROM quran_verses WHERE translation IS NOT NULL AND translation != ''"
    );
    console.log(`   Local with translation: ${localTranslation.rows[0].count} verses`);
    
    // 2. Ambil semua data dari lokal
    console.log('\n📖 Reading Quran from local database...');
    const quranResult = await localPool.query(
      'SELECT surah, ayah, arabic, translation, surah_name FROM quran_verses ORDER BY surah, ayah'
    );
    console.log(`   Found ${quranResult.rows.length} verses\n`);
    
    // 3. Update di Neon (UPDATE, bukan INSERT)
    console.log('🔄 Updating Quran in Neon with translation...');
    let updated = 0;
    for (const verse of quranResult.rows) {
      await neonPool.query(
        `UPDATE quran_verses 
         SET arabic = $1, translation = $2, surah_name = $3
         WHERE surah = $4 AND ayah = $5`,
        [verse.arabic, verse.translation, verse.surah_name, verse.surah, verse.ayah]
      );
      updated++;
      if (updated % 500 === 0) {
        console.log(`   ✅ Updated ${updated} verses`);
      }
    }
    console.log(`✅ Quran updated: ${updated} verses\n`);
    
    // 4. Verifikasi
    console.log('🔍 Verifying in Neon...');
    const verifyResult = await neonPool.query(
      "SELECT COUNT(*) FROM quran_verses WHERE translation IS NOT NULL AND translation != ''"
    );
    console.log(`   Verses with translation in Neon: ${verifyResult.rows[0].count}`);
    
    const sampleResult = await neonPool.query(
      "SELECT surah, ayah, translation FROM quran_verses WHERE surah = 1 ORDER BY ayah LIMIT 3"
    );
    console.log('\n📖 Surah 1 in Neon:');
    for (const row of sampleResult.rows) {
      console.log(`   ${row.surah}:${row.ayah} - ${row.translation}`);
    }
    
    console.log('\n🎉 SELESAI! Quran with translation copied to Neon!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit();
}

copyQuranWithTranslation().catch(console.error);
