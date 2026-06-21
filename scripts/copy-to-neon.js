require('dotenv').config();
// scripts/copy-hadith-to-neon.js
const { Pool } = require('pg');

// Koneksi ke lokal (sumber data yang sudah benar)
const localPool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'sikaji29',
  database: 'sikaji',
  port: 5432,
});

// Koneksi ke Neon (target)
const neonPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function copyHadithToNeon() {
  console.log('🚀 Copying Hadith from local to Neon...\n');
  
  try {
    // 1. Test koneksi
    console.log('📡 Testing connections...');
    await localPool.query('SELECT 1');
    await neonPool.query('SELECT 1');
    console.log('✅ Both connections successful\n');
    
    // 2. Ambil data hadith dari lokal
    console.log('📖 Reading Hadith from local database...');
    const hadithResult = await localPool.query(
      'SELECT book_id, number, arabic, translation, narrator, reference, grade FROM hadiths ORDER BY id'
    );
    console.log(`   Found ${hadithResult.rows.length} hadith\n`);
    
    // 3. Update ke Neon
    console.log('🔄 Copying Hadith to Neon...');
    let updated = 0;
    let failed = 0;
    
    for (const hadith of hadithResult.rows) {
      try {
        await neonPool.query(
          `UPDATE hadiths 
           SET arabic = $1, 
               translation = $2, 
               narrator = $3, 
               reference = $4,
               grade = $5
           WHERE book_id = $6 AND number = $7`,
          [
            hadith.arabic, 
            hadith.translation, 
            hadith.narrator || '', 
            hadith.reference || '',
            hadith.grade || '',
            hadith.book_id, 
            hadith.number
          ]
        );
        updated++;
      } catch (err) {
        failed++;
        console.log(`   ❌ Failed to update hadith ${hadith.number} (book ${hadith.book_id}): ${err.message}`);
      }
      
      if (updated % 500 === 0) {
        console.log(`   ✅ Updated ${updated} hadith`);
      }
    }
    
    console.log(`\n✅ Hadith copied: ${updated} hadith`);
    if (failed > 0) {
      console.log(`⚠️ Failed: ${failed} hadith`);
    }
    
    // 4. Verifikasi
    console.log('\n🔍 Verifying in Neon...');
    const verifyResult = await neonPool.query(
      'SELECT COUNT(*) FROM hadiths'
    );
    console.log(`   Total hadith in Neon: ${verifyResult.rows[0].count}`);
    
    const sampleResult = await neonPool.query(
      'SELECT id, number, arabic FROM hadiths LIMIT 1'
    );
    if (sampleResult.rows.length > 0) {
      console.log(`   Sample hadith: ${sampleResult.rows[0].arabic.substring(0, 50)}...`);
    }
    
    console.log('\n🎉 SELESAI! Hadith copied to Neon successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('   ', error.stack);
  }
  
  process.exit();
}

copyHadithToNeon().catch(console.error);