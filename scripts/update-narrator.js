const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  user: 'postgres',
  password: 'sikaji29',
  database: 'sikaji',
});

const imamNames = {
  'bukhari': 'Imam Al-Bukhari (Abu Abdillah Muhammad bin Ismail Al-Bukhari)',
  'muslim': 'Imam Muslim (Abu Al-Husain Muslim bin Al-Hajjaj Al-Qusyairi)',
  'abudawud': 'Imam Abu Dawud (Sulaiman bin Al-Asy\'ats As-Sijistani)',
  'tirmidzi': 'Imam At-Tirmidzi (Abu Isa Muhammad bin Isa At-Tirmidzi)',
  'nasai': 'Imam An-Nasa\'i (Ahmad bin Syu\'aib An-Nasa\'i)',
  'ibnumajah': 'Imam Ibnu Majah (Muhammad bin Yazid Al-Qazwini)',
};

async function updateImamNames() {
  console.log('📝 UPDATE NARRATOR KE NAMA LENGKAP\n');

  for (const [slug, imamName] of Object.entries(imamNames)) {
    // Update semua hadits di kitab tersebut, apapun narrator-nya
    const result = await pool.query(`
      UPDATE hadiths 
      SET narrator = $1
      WHERE book_id = (SELECT id FROM hadith_books WHERE slug = $2)
    `, [imamName, slug]);
    
    console.log(`✅ ${slug}: ${result.rowCount} hadits diupdate menjadi "${imamName.substring(0, 50)}..."`);
  }

  // Verifikasi
  const sample = await pool.query(`
    SELECT b.name, h.number, h.narrator 
    FROM hadiths h
    JOIN hadith_books b ON h.book_id = b.id
    LIMIT 3
  `);
  
  console.log('\n📋 Sample hasil:');
  sample.rows.forEach(row => {
    console.log(`   ${row.name} No.${row.number}: ${row.narrator}`);
  });

  await pool.end();
}

updateImamNames();