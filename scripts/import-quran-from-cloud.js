// scripts/import-quran-from-cloud.js
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'sikaji29',
  database: 'sikaji',
});

async function importQuranFromCloud() {
  console.log('🚀 Importing Quran from Al-Quran Cloud API...\n');
  
  // Baca file Quran Utsmani
  const quranData = JSON.parse(fs.readFileSync('quran_uthmani.json', 'utf8'));
  const translationData = JSON.parse(fs.readFileSync('quran_id.json', 'utf8'));
  
  // Buat map translation
  const translations = {};
  for (const surah of translationData.data.surahs) {
    for (const ayah of surah.ayahs) {
      const key = `${surah.number}-${ayah.number}`;
      translations[key] = ayah.text;
    }
  }
  
  let totalAyat = 0;
  
  for (const surah of quranData.data.surahs) {
    const surahNumber = surah.number;
    const surahName = surah.name;
    const totalAyatSurah = surah.ayahs.length;
    
    console.log(`📖 Processing Surah ${surahNumber} (${surahName}) - ${totalAyatSurah} ayat`);
    
    for (const ayah of surah.ayahs) {
      const ayahNumber = ayah.numberInSurah;
      const key = `${surahNumber}-${ayahNumber}`;
      const arabicText = ayah.text; // Teks Arab yang BENAR dari API
      const translationText = translations[key] || '';
      
      // UPDATE data yang ada
      await pool.query(
        `UPDATE quran_verses 
         SET arabic = $1, translation = $2, surah_name = $3
         WHERE surah = $4 AND ayah = $5`,
        [arabicText, translationText, surahName, surahNumber, ayahNumber]
      );
      
      totalAyat++;
      
      if (totalAyat % 500 === 0) {
        console.log(`   📊 Progress: ${totalAyat} ayat updated`);
      }
    }
    
    console.log(`✅ Surah ${surahNumber} (${surahName}) selesai\n`);
  }
  
  console.log(`\n🎉 SELESAI!`);
  console.log(`📖 Total ayat updated: ${totalAyat}`);
  
  process.exit();
}

importQuranFromCloud().catch(console.error);