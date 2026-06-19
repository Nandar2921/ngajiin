const { Pool } = require('pg');

// Hardcode koneksi ke database Docker
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
});
async function testConnection() {
  try {
    console.log('🔍 Mencoba koneksi ke database...');
    console.log(`   Host: localhost:5433`);
    console.log(`   User: postgres`);
    console.log(`   Database: sikaji`);
    
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Koneksi berhasil!');
    console.log('📅 Server time:', result.rows[0].now);
    
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('\n📊 Tabel yang tersedia:');
    tables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    // Cek jumlah hadits
    const hadithCount = await pool.query('SELECT COUNT(*) FROM hadiths');
    console.log(`\n📚 Jumlah hadits: ${hadithCount.rows[0].count}`);
    
  } catch (err) {
    console.error('❌ Gagal konek:', err.message);
  }
  await pool.end();
}

testConnection();