require('dotenv').config();
﻿const { Pool } = require('pg');

const neonPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function checkSample() {
  try {
    const sample = await neonPool.query(
      "SELECT surah, ayah, translation FROM quran_verses WHERE surah = 1 ORDER BY ayah LIMIT 3"
    );
    console.log('Surah 1 (Al-Fatihah):');
    for (const row of sample.rows) {
      console.log(`  ${row.surah}:${row.ayah} - ${row.translation}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit();
}

checkSample();
