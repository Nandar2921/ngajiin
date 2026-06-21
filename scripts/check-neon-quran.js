require('dotenv').config();
﻿const { Pool } = require('pg');

const neonPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function checkNeonQuran() {
  console.log('🔍 Checking Quran data in Neon...\n');
  
  try {
    console.log('📡 Testing connection...');
    await neonPool.query('SELECT 1');
    console.log('✅ Connection successful\n');
    
    const countResult = await neonPool.query('SELECT COUNT(*) FROM quran_verses');
    console.log(`📊 Total Quran verses: ${countResult.rows[0].count}`);
    
    if (parseInt(countResult.rows[0].count) > 0) {
      const sampleResult = await neonPool.query('SELECT id, surah, ayah, translation FROM quran_verses LIMIT 3');
      console.log('\n📖 Sample data:');
      for (const row of sampleResult.rows) {
        console.log(`   Surah ${row.surah}:${row.ayah} - ${row.translation.substring(0, 50)}...`);
      }
    } else {
      console.log('\n⚠️ No Quran data found in Neon!');
      console.log('   Need to copy data from local database.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit();
}

checkNeonQuran().catch(console.error);
