const { Pool } = require('pg');
const { WideQuran } = require('widequran');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'sikaji29',
  database: 'sikaji',
});

const api = new WideQuran();

// Daftar koleksi hadits yang tersedia di WideQuran
const collections = [
  { name: 'Bukhari', displayName: 'Shahih Bukhari', arabic: 'صحيح البخاري' },
  { name: 'Muslim', displayName: 'Shahih Muslim', arabic: 'صحيح مسلم' },
  { name: 'AbuDawud', displayName: 'Sunan Abu Daud', arabic: 'سنن أبي داود' },
  { name: 'Tirmidhi', displayName: 'Sunan Tirmidzi', arabic: 'جامع الترمذي' },
  { name: 'Nasai', displayName: 'Sunan Nasai', arabic: 'سنن النسائي' },
  { name: 'IbnuMajah', displayName: 'Sunan Ibnu Majah', arabic: 'سنن ابن ماجه' },
];

async function importHadithFromWideQuran() {
  console.log('========================================');
  console.log('📥 MENGIMPOR HADITS DARI WIDEQURAN');
  console.log('========================================\n');
  
  let totalHadith = 0;
  
  for (const collection of collections) {
    console.log(`\n📖 Mengimpor kitab: ${collection.displayName}...`);
    
    // Cek atau buat kitab di database
    let bookResult = await pool.query(
      `SELECT id FROM hadith_books WHERE name = $1`,
      [collection.displayName]
    );
    
    let bookId;
    if (bookResult.rows.length === 0) {
      const insertResult = await pool.query(
        `INSERT INTO hadith_books (name, name_arabic, name_indonesian) 
         VALUES ($1, $2, $3) RETURNING id`,
        [collection.displayName, collection.arabic, collection.displayName]
      );
      bookId = insertResult.rows[0].id;
      console.log(`   ✅ Kitab baru ditambahkan (ID: ${bookId})`);
    } else {
      bookId = bookResult.rows[0].id;
      console.log(`   ✅ Kitab sudah ada (ID: ${bookId})`);
    }
    
    try {
      // Ambil hadits dari WideQuran untuk koleksi ini
      // WideQuran memiliki method untuk mengambil hadits per koleksi
      let page = 1;
      let hasMore = true;
      let bookCount = 0;
      
      while (hasMore && page <= 5) { // Ambil 5 halaman dulu (bisa disesuaikan)
        console.log(`   📡 Mengambil halaman ${page}...`);
        
        // Method untuk mengambil hadits (sesuaikan dengan dokumentasi WideQuran)
        // Contoh: api.getHadithsByCollection(collection.name, page, 20)
        const hadiths = await api.getHadithsByCollection(collection.name, page, 20);
        
        if (!hadiths || hadiths.length === 0) {
          hasMore = false;
          break;
        }
        
        for (const hadith of hadiths) {
          const number = hadith.number || hadith.id;
          
          const existing = await pool.query(
            `SELECT id FROM hadiths WHERE book_id = $1 AND number = $2`,
            [bookId, number]
          );
          
          if (existing.rows.length === 0) {
            await pool.query(
              `INSERT INTO hadiths (book_id, number, arabic, translation, narrator, grade, reference) 
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [
                bookId,
                number,
                hadith.arabic || hadith.text || '',
                hadith.translation || hadith.english || '',
                hadith.narrator || 'Unknown',
                hadith.grade || 'Shahih',
                hadith.reference || `HR. ${collection.displayName} No. ${number}`
              ]
            );
            bookCount++;
            totalHadith++;
          }
        }
        
        page++;
        await new Promise(resolve => setTimeout(resolve, 500)); // Delay
      }
      
      console.log(`   ✅ ${bookCount} hadits baru diimport dari ${collection.displayName}`);
      
    } catch (error) {
      console.error(`   ❌ Gagal import ${collection.displayName}:`, error.message);
    }
  }
  
  console.log('\n========================================');
  console.log('🎉 IMPORT SELESAI!');
  console.log('========================================');
  console.log(`✅ Total hadits baru: ${totalHadith}`);
  
  const result = await pool.query('SELECT COUNT(*) FROM hadiths');
  console.log(`📚 Total hadits di database: ${result.rows[0].count}`);
  
  await pool.end();
}

importHadithFromWideQuran();