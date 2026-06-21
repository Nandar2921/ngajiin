const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const SURAH_DIR = 'D:/sikaji/quran-json/surah';

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'sikaji29',
  database: 'sikaji',
});

async function importFullQuran() {
  console.log('🚀 Memulai import Quran + Tafsir...\n');
  
  if (!fs.existsSync(SURAH_DIR)) {
    console.error(`❌ Folder tidak ditemukan: ${SURAH_DIR}`);
    process.exit(1);
  }
  
  let totalAyat = 0;
  let totalTafsir = 0;
  
  for (let s = 1; s <= 114; s++) {
    const filePath = path.join(SURAH_DIR, `${s}.json`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ Surah ${s}: file tidak ditemukan`);
      continue;
    }
    
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const surahData = data[String(s)];
      
      if (!surahData) continue;
      
      const surahName = surahData.name_latin || surahData.name;
      const totalAyatSurah = parseInt(surahData.number_of_ayah);
      
      console.log(`📖 Memproses Surah ${s} (${surahName}) - ${totalAyatSurah} ayat`);
      
      for (let ayah = 1; ayah <= totalAyatSurah; ayah++) {
        let arabicText = surahData.text?.[String(ayah)] || '';
        let translationText = surahData.translations?.id?.text?.[String(ayah)] || '';
        let tafsirText = null;
        
        if (surahData.tafsir?.id?.kemenag?.text?.[String(ayah)]) {
          tafsirText = surahData.tafsir.id.kemenag.text[String(ayah)];
        } else if (surahData.tafsir?.kemenag?.text?.[String(ayah)]) {
          tafsirText = surahData.tafsir.kemenag.text[String(ayah)];
        }
        
        const result = await pool.query(
          `INSERT INTO quran_verses (surah, ayah, arabic, translation, surah_name)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (surah, ayah) DO UPDATE SET
             arabic = EXCLUDED.arabic,
             translation = EXCLUDED.translation,
             surah_name = EXCLUDED.surah_name
           RETURNING id`,
          [s, ayah, arabicText, translationText, surahName]
        );
        
        totalAyat++;
        
        if (tafsirText) {
          await pool.query(
            `INSERT INTO tafsir (verse_id, source, content)
             VALUES ($1, 'Kemenag', $2)
             ON CONFLICT (verse_id, source) DO UPDATE SET content = $2`,
            [result.rows[0].id, tafsirText]
          );
          totalTafsir++;
        }
        
        if (totalAyat % 500 === 0) {
          console.log(`   📊 Progress: ${totalAyat} ayat, ${totalTafsir} tafsir`);
        }
      }
      
      console.log(`✅ Surah ${s} (${surahName}) selesai\n`);
    } catch (err) {
      console.error(`❌ Error surah ${s}:`, err.message);
    }
  }
  
  console.log(`\n🎉 SELESAI! Total ayat: ${totalAyat}, Tafsir: ${totalTafsir}`);
  process.exit();
}

importFullQuran().catch(console.error);
