const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'Kajiin29',
  database: 'Kajiin',
  port: 5432,
});

async function checkLocalTranslation() {
  try {
    const result = await pool.query(
      "SELECT COUNT(*) FROM quran_verses WHERE translation IS NOT NULL AND translation != ''"
    );
    console.log('Local translation count:', result.rows[0].count);
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit();
}

checkLocalTranslation();
