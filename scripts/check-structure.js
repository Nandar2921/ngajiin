const { Pool } = require('pg');

const neonPool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_e9NYUfAwI2Jb@ep-purple-waterfall-ao5g02js-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
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
