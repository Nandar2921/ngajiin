const { Pool } = require('pg');
const { pipeline } = require('@xenova/transformers');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
});
async function testSemanticSearch() {
  const query = process.argv[2] || 'qurban';
  console.log(`🔍 Mencari: "${query}"\n`);

  // Generate embedding untuk query
  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  const queryEmbedding = await extractor(query, { pooling: 'mean', normalize: true });
  const vectorStr = `[${Array.from(queryEmbedding.data).join(',')}]`;

  // Cari di Quran
  const result = await pool.query(`
    SELECT surah, ayah, translation,
           1 - (embedding <=> $1::vector) as similarity
    FROM quran_verses
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> $1::vector
    LIMIT 10
  `, [vectorStr]);

  console.log('📖 Hasil pencarian semantic (10 teratas):\n');
  for (const row of result.rows) {
    console.log(`QS. ${row.surah}:${row.ayah} (similarity: ${row.similarity.toFixed(3)})`);
    console.log(`   ${row.translation.substring(0, 100)}...\n`);
  }

  process.exit();
}

testSemanticSearch().catch(console.error);