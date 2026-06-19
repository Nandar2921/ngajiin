const { Pool } = require('pg');

const neonPool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_e9NYUfAwI2Jb@ep-purple-waterfall-ao5g02js-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false },
});

async function test() {
  try {
    // Test 1: Cek total Quran
    const total = await neonPool.query('SELECT COUNT(*) FROM quran_verses');
    console.log('Total Quran:', total.rows[0].count);
    
    // Test 2: Cek translation ada
    const withTrans = await neonPool.query(
      "SELECT COUNT(*) FROM quran_verses WHERE translation IS NOT NULL AND translation != ''"
    );
    console.log('With translation:', withTrans.rows[0].count);
    
    // Test 3: Cari "allah"
    const result = await neonPool.query(
      "SELECT COUNT(*) FROM quran_verses WHERE translation ILIKE '%allah%'"
    );
    console.log('Quran with "allah":', result.rows[0].count);
    
    // Test 4: Sample translation
    const sample = await neonPool.query(
      "SELECT surah, ayah, translation FROM quran_verses WHERE translation ILIKE '%allah%' LIMIT 3"
    );
    console.log('\nSample:');
    for (const row of sample.rows) {
      console.log(`  ${row.surah}:${row.ayah} - ${row.translation.substring(0, 50)}...`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit();
}

test();
