const { Pool } = require('pg');

const neonPool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_e9NYUfAwI2Jb@ep-purple-waterfall-ao5g02js-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false,
  },
});

async function downloadTranslations() {
  console.log('📥 Downloading Indonesian translations from API...\n');
  
  try {
    console.log('🔄 Fetching from Al-Quran Cloud API...');
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
      console.log(`📖 Processing Surah ${surahNum} (${surah.ayahs.length} ayahs)`);
      
      for (const ayah of surah.ayahs) {
        const ayahNum = ayah.numberInSurah;
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
    
    console.log(`\n🎉 Updated ${updated} verses with translations!`);
    
    // Verifikasi
    const result = await neonPool.query(
      "SELECT COUNT(*) FROM quran_verses WHERE translation IS NOT NULL AND translation != ''"
    );
    console.log(`📊 Total verses with translation in Neon: ${result.rows[0].count}`);
    
    // Sample
    const sample = await neonPool.query(
      "SELECT surah, ayah, translation FROM quran_verses WHERE surah = 1 ORDER BY ayah LIMIT 3"
    );
    console.log('\n📖 Surah 1 sample:');
    for (const row of sample.rows) {
      console.log(`   ${row.surah}:${row.ayah} - ${row.translation}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit();
}

downloadTranslations().catch(console.error);
