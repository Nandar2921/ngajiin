const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const neonPool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_e9NYUfAwI2Jb@ep-purple-waterfall-ao5g02js-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false },
});

async function fixDatabase() {
  console.log('🔧 MEMPERBAIKI DATABASE NEON...\n');
  
  try {
    // 1. Hapus data dengan DELETE (cascade)
    console.log('🗑️  Menghapus data Quran yang salah...');
    await neonPool.query('DELETE FROM quran_verses CASCADE');
    await neonPool.query('ALTER SEQUENCE quran_verses_id_seq RESTART WITH 1');
    console.log('✅ Data Quran dihapus\n');
    
    // 2. Baca data dari file lokal
    console.log('📖 Membaca data dari quran-json lokal...');
    const surahDir = path.join(process.cwd(), 'quran-json', 'surah');
    const files = fs.readdirSync(surahDir).filter(f => f.endsWith('.json'));
    
    console.log(`✅ Ditemukan ${files.length} surah\n`);
    
    let inserted = 0;
    
    for (const file of files) {
      const surahNum = parseInt(file.replace('.json', ''));
      const filePath = path.join(surahDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Ambil data surah dari key surahNum
      const surahData = data[String(surahNum)];
      
      if (!surahData) {
        console.log(`⚠️ Surah ${surahNum}: data tidak valid`);
        continue;
      }
      
      const surahName = surahData.name_latin || surahData.name || '';
      const verses = surahData.text || {};
      
      console.log(`📖 Processing Surah ${surahNum} (${surahName}) - ${Object.keys(verses).length} verses`);
      
      for (const [ayahNum, arabic] of Object.entries(verses)) {
        // Ambil terjemahan dari file yang sama
        let translation = '';
        if (surahData.translations?.id?.text?.[ayahNum]) {
          translation = surahData.translations.id.text[ayahNum];
        }
        
        await neonPool.query(
          `INSERT INTO quran_verses (surah, ayah, arabic, translation, surah_name)
           VALUES ($1, $2, $3, $4, $5)`,
          [surahNum, parseInt(ayahNum), arabic, translation, surahName]
        );
        inserted++;
      }
      
      if (surahNum % 10 === 0) {
        console.log(`   ✅ Inserted ${inserted} verses so far`);
      }
    }
    
    console.log(`\n🎉 Inserted ${inserted} verses with CORRECT data!`);
    
    // Verifikasi
    const sample = await neonPool.query(
      "SELECT surah, ayah, arabic, translation FROM quran_verses WHERE surah = 1 ORDER BY ayah LIMIT 3"
    );
    console.log('\n📖 Surah 1 (Al-Fatihah):');
    for (const row of sample.rows) {
      console.log(`   ${row.surah}:${row.ayah}`);
      console.log(`      Arabic: ${row.arabic.substring(0, 30)}...`);
      console.log(`      Translation: ${row.translation}`);
    }
    
    const result = await neonPool.query(
      "SELECT COUNT(*) FROM quran_verses WHERE translation ILIKE '%allah%'"
    );
    console.log(`\n📊 Verses containing "allah": ${result.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
  
  process.exit();
}

fixDatabase().catch(console.error);
