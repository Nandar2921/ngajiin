const { Pool } = require('pg');

const neonPool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_e9NYUfAwI2Jb@ep-purple-waterfall-ao5g02js-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false },
});

async function updateTranslation() {
  console.log('📥 UPDATING translation column with INDONESIAN translation...\n');
  
  try {
    console.log('🔄 Fetching Indonesian translation from API...');
    const response = await fetch('https://api.alquran.cloud/v1/quran/quran-id');
    const data = await response.json();
    
    if (data.code !== 200) {
      console.error('❌ API Error:', data.status);
      process.exit(1);
    }
    
    console.log(`✅ Downloaded ${data.data.surahs.length} surah\n`);
    
    let updated = 0;
    
    for (const surah of data.data.surahs) {
      const surahNum = surah.number;
      
      for (const ayah of surah.ayahs) {
        const ayahNum = ayah.numberInSurah;
        // ayah.text = TERJEMAHAN INDONESIA
        const translation = ayah.text;
        
        await neonPool.query(
          `UPDATE quran_verses 
           SET translation = $1
           WHERE surah = $2 AND ayah = $3`,
          [translation, surahNum, ayahNum]
        );
        updated++;
      }
      
      if (surahNum % 10 === 0) {
        console.log(`   ✅ Updated ${updated} verses so far`);
      }
    }
    
    console.log(`\n🎉 Updated ${updated} verses with INDONESIAN translations!`);
    
    // Verifikasi - Cek Surah 2 Ayat 70
    const check = await neonPool.query(
      "SELECT surah, ayah, translation FROM quran_verses WHERE surah = 2 AND ayah = 70"
    );
    if (check.rows.length > 0) {
      console.log('\n🔍 Surah 2:70 - SEHARUSNYA:');
      console.log(`   Translation: ${check.rows[0].translation}`);
      console.log('   (Harusnya Bahasa Indonesia, BUKAN Arab!)');
    }
    
    // Cek apakah ada kata "allah" (harusnya banyak)
    const result = await neonPool.query(
      "SELECT COUNT(*) FROM quran_verses WHERE translation ILIKE '%allah%'"
    );
    console.log(`\n📊 Verses containing "allah": ${result.rows[0].count}`);
    console.log('   (Harusnya > 0, karena banyak ayat mengandung kata "Allah")');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit();
}

updateTranslation().catch(console.error);
