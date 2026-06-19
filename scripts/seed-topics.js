const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
});
// Data topik
const topics = [
  { name: 'Kaum Nabi Luth', slug: 'kaum-nabi-luth', description: 'Kisah kaum yang diazab karena homoseksual', category: 'qisas' },
  { name: 'Niat', slug: 'niat', description: 'Keutamaan dan pengaruh niat dalam beramal', category: 'akhlak' },
  { name: 'Shalat', slug: 'shalat', description: 'Tata cara dan keutamaan shalat', category: 'ibadah' },
  { name: 'Puasa Ramadhan', slug: 'puasa-ramadhan', description: 'Hukum dan keutamaan puasa Ramadhan', category: 'ibadah' },
  { name: 'Zakat', slug: 'zakat', description: 'Hukum dan perhitungan zakat', category: 'ibadah' },
  { name: 'Haji', slug: 'haji', description: 'Tata cara dan keutamaan haji', category: 'ibadah' },
  { name: 'Jihad', slug: 'jihad', description: 'Konsep jihad dalam Islam', category: 'aqidah' },
  { name: 'Tawakkal', slug: 'tawakkal', description: 'Berserah diri kepada Allah', category: 'akhlak' },
  { name: 'Sabr', slug: 'sabr', description: 'Keutamaan kesabaran', category: 'akhlak' },
  { name: 'Syukur', slug: 'syukur', description: 'Bersyukur atas nikmat Allah', category: 'akhlak' },
];

// Relasi topik dengan Quran, Tafsir, Hadits
const relations = [
  // Topik "Kaum Nabi Luth" - Quran
  { topicSlug: 'kaum-nabi-luth', contentType: 'quran', contentId: null, surah: 7, ayah: 80, note: 'Kisah Nabi Luth' },
  { topicSlug: 'kaum-nabi-luth', contentType: 'quran', contentId: null, surah: 11, ayah: 77, note: 'Kisah Nabi Luth' },
  { topicSlug: 'kaum-nabi-luth', contentType: 'quran', contentId: null, surah: 26, ayah: 160, note: 'Kisah Nabi Luth' },
  { topicSlug: 'kaum-nabi-luth', contentType: 'quran', contentId: null, surah: 27, ayah: 54, note: 'Kisah Nabi Luth' },
  { topicSlug: 'kaum-nabi-luth', contentType: 'quran', contentId: null, surah: 29, ayah: 28, note: 'Kisah Nabi Luth' },
  
  // Topik "Niat" - Hadits (Hadits Arbain ke-1)
  { topicSlug: 'niat', contentType: 'hadith', contentId: null, hadithNumber: 1, note: 'Hadits Arbain tentang niat' },
  
  // Topik "Shalat" - Quran
  { topicSlug: 'shalat', contentType: 'quran', contentId: null, surah: 2, ayah: 43, note: 'Perintah shalat' },
  { topicSlug: 'shalat', contentType: 'quran', contentId: null, surah: 4, ayah: 103, note: 'Shalat di waktu tertentu' },
];

async function seedTopics() {
  console.log('🌱 Seeding topics...\n');

  for (const topic of topics) {
    const existing = await pool.query(`SELECT id FROM topics WHERE slug = $1`, [topic.slug]);
    
    if (existing.rows.length === 0) {
      await pool.query(
        `INSERT INTO topics (name, slug, description, category) VALUES ($1, $2, $3, $4)`,
        [topic.name, topic.slug, topic.description, topic.category]
      );
      console.log(`✅ Topic: ${topic.name}`);
    } else {
      console.log(`⏭️ Topic sudah ada: ${topic.name}`);
    }
  }

  console.log('\n🔗 Creating relations...\n');

  for (const rel of relations) {
    // Cari topic_id
    const topicResult = await pool.query(`SELECT id FROM topics WHERE slug = $1`, [rel.topicSlug]);
    if (topicResult.rows.length === 0) continue;
    
    const topicId = topicResult.rows[0].id;
    let contentId = null;
    
    if (rel.contentType === 'quran' && rel.surah && rel.ayah) {
      const verseResult = await pool.query(
        `SELECT id FROM quran_verses WHERE surah = $1 AND ayah = $2`,
        [rel.surah, rel.ayah]
      );
      if (verseResult.rows.length > 0) contentId = verseResult.rows[0].id;
    }
    
    if (rel.contentType === 'hadith' && rel.hadithNumber) {
      const hadithResult = await pool.query(
        `SELECT id FROM hadiths WHERE number = $1`,
        [rel.hadithNumber]
      );
      if (hadithResult.rows.length > 0) contentId = hadithResult.rows[0].id;
    }
    
    if (contentId) {
      const existing = await pool.query(
        `SELECT id FROM topic_relations WHERE topic_id = $1 AND content_type = $2 AND content_id = $3`,
        [topicId, rel.contentType, contentId]
      );
      
      if (existing.rows.length === 0) {
        await pool.query(
          `INSERT INTO topic_relations (topic_id, content_type, content_id, notes) VALUES ($1, $2, $3, $4)`,
          [topicId, rel.contentType, contentId, rel.note]
        );
        console.log(`🔗 ${rel.topicSlug} → ${rel.contentType} (ID: ${contentId})`);
      }
    }
  }
  
  console.log('\n🎉 Topic seeding completed!');
  await pool.end();
}

seedTopics();