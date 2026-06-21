require('dotenv').config();
﻿const { Pool } = require('pg');

const neonPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function checkStructure() {
  try {
    const result = await neonPool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'quran_verses'
      ORDER BY ordinal_position
    `);
    console.log('📋 Table structure:');
    for (const row of result.rows) {
      console.log(`   ${row.column_name}: ${row.data_type}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit();
}

checkStructure();
