const { Pool } = require('pg');
const { WideQuran } = require('widequran');

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  user: 'postgres',
  password: 'sikaji29',
  database: 'sikaji',
});

const api = new WideQuran();

async function importTafsirFromWideQuran() {
  console.log('========================================');
  console.log('📥 MENGIMPOR TAFSIR DARI WIDEQURAN');
  console.log('========================================\n');
  
  // Surah yang akan diambil tafsirnya (surah populer)
  const surahList = [1, 2, 12, 18, 19, 20, 36, 55, 56, 67, 78, 112, 113, 114];
  
  let totalTafsir = 0;
  
  for (const surah of surahList) {
    console.log(`📖 Mengambil tafsir surah ${surah}...`);
    
    try {
      // Ambil tafsir dari WideQuran
      const tafsir = await api.getTafsir(surah);
      
      if (!tafsir || !tafsir.ayahs) {
        console.log(`   ⚠️ Tafsir surah ${surah} tidak tersedia`);
        continue;
      }
      
      for (const ayah of tafsir.ayahs) {
        const ayahNum = ayah.number || ayah.id;
        
        // Cari verse_id dari database
        const verseResult = await pool.query(
          'SELECT id FROM quran_verses WHERE surah = $1 AND ayah = $2',
          [surah, ayahNum]
        );
        
        if (verseResult.rows.length === 0) continue;
        
        const verseId = verseResult.rows[0].id;
        const tafsirText = ayah.tafsir || ayah.explanation || '';
        
        if (tafsirText) {
          const existing = await pool.query(
            'SELECT id FROM tafsir WHERE verse_id = $1 AND source = $2',
            [verseId, 'WideQuran']
          );
          
          if (existing.rows.length === 0) {
            await pool.query(
              `INSERT INTO tafsir (verse_id, source, content) 
               VALUES ($1, $2, $3)`,
              [verseId, 'WideQuran', tafsirText]
            );
            totalTafsir++;
          }
        }
      }
      
      console.log(`   ✅ Tafsir surah ${surah} selesai (${totalTafsir} total)`);
      
    } catch (error) {
      console.error(`   ❌ Gagal surah ${surah}:`, error.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n========================================');
  console.log('🎉 IMPORT TAFSIR SELESAI!');
  console.log('========================================');
  console.log(`✅ Total tafsir baru: ${totalTafsir}`);
  
  const result = await pool.query('SELECT COUNT(*) FROM tafsir');
  console.log(`📚 Total tafsir di database: ${result.rows[0].count}`);
  
  await pool.end();
}

importTafsirFromWideQuran();