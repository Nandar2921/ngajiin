const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: 'localhost',
  port: 5433,  // ← pakai port Docker
  user: 'postgres',
  password: 'sikaji29',
  database: 'sikaji',
});

const SURAH_DIR = 'D:/sikaji/quran-json/surah';

async function importData() {
  console.log('🚀 Mulai import data ke database pgvector (port 5433)...\n');

  // Cek folder surah
  if (!fs.existsSync(SURAH_DIR)) {
    console.error(`❌ Folder tidak ditemukan: ${SURAH_DIR}`);
    console.log('📌 Pastikan folder quran-json/surah ada!');
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
      
      if (!surahData) {
        console.log(`⚠️ Surah ${s}: data tidak valid`);
        continue;
      }

      const surahName = surahData.name_latin || surahData.name;
      const totalAyatSurah = parseInt(surahData.number_of_ayah);

      console.log(`📖 Memproses Surah ${s} (${surahName}) - ${totalAyatSurah} ayat`);

      for (let ayah = 1; ayah <= totalAyatSurah; ayah++) {
        const arabicText = surahData.text?.[String(ayah)] || '';
        const translationText = surahData.translations?.id?.text?.[String(ayah)] || '';
        
        // Cek tafsir Kemenag
        let tafsirText = null;
        if (surahData.tafsir?.id?.kemenag?.text?.[String(ayah)]) {
          tafsirText = surahData.tafsir.id.kemenag.text[String(ayah)];
        }

        // Insert ke quran_verses
        const result = await pool.query(
          `INSERT INTO quran_verses (surah, ayah, arabic, translation, surah_name)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (surah, ayah) DO UPDATE SET
             arabic = EXCLUDED.arabic,
             translation = EXCLUDED.translation
           RETURNING id`,
          [s, ayah, arabicText, translationText, surahName]
        );
        totalAyat++;

        // Insert tafsir jika ada
        if (tafsirText) {
          await pool.query(
            `INSERT INTO tafsir (verse_id, source, content)
             VALUES ($1, 'Kemenag', $2)
             ON CONFLICT (verse_id, source) DO NOTHING`,
            [result.rows[0].id, tafsirText]
          );
          totalTafsir++;
        }

        if (totalAyat % 500 === 0) {
          console.log(`   📊 Progress: ${totalAyat} ayat terimport, ${totalTafsir} tafsir`);
        }
      }

      console.log(`✅ Surah ${s} (${surahName}) selesai\n`);

    } catch (err) {
      console.error(`❌ Error pada surah ${s}:`, err.message);
    }
  }

  console.log(`\n🎉 SELESAI!`);
  console.log(`📖 Total ayat terimport: ${totalAyat}`);
  console.log(`📚 Total tafsir terimport: ${totalTafsir}`);
  
  process.exit();
}

importData().catch(console.error);