require('dotenv').config();
﻿
const { Pool } = require('pg');

const neonPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function checkTranslation() {
  try {
    const total = await neonPool.query('SELECT COUNT(*) FROM quran_verses');
    console.log('Total Quran:', total.rows[0].count);
    
    const withTranslation = await neonPool.query(
      "SELECT COUNT(*) FROM quran_verses WHERE translation IS NOT NULL AND translation != ''"
    );
    console.log('With translation:', withTranslation.rows[0].count);
    
    const sample = await neonPool.query(
      "SELECT surah, ayah, translation FROM quran_verses LIMIT 3"
    );
    console.log('\nSample:');
    for (const row of sample.rows) {
      console.log(`  ${row.surah}:${row.ayah} - ${row.translation || '(NULL)'}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit();
}

checkTranslation();
