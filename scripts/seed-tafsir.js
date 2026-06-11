const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'sikaji29',
  database: 'sikaji',
});

const tafsirList = [
  { surah: 1, ayah: 1, source: 'Ibnu Katsir', content: 'Surat Al-Fatihah adalah Ummul Quran, surat paling agung. Wajib dibaca dalam setiap rakaat shalat.' },
  { surah: 1, ayah: 2, source: 'Ibnu Katsir', content: 'Alhamdulillah: Segala puji bagi Allah. Rabbil Alamin: Tuhan semesta alam.' },
  { surah: 1, ayah: 3, source: 'Ibnu Katsir', content: 'Ar-Rahman: Maha Pengasih, Ar-Rahim: Maha Penyayang.' },
  { surah: 2, ayah: 255, source: 'Ibnu Katsir', content: 'Ayat Kursi adalah ayat paling agung. Barangsiapa membacanya di malam hari akan dijaga Allah.' },
  { surah: 36, ayah: 1, source: 'Ibnu Katsir', content: 'Yasin adalah jantung Al-Quran. Membacanya di malam hari dengan ikhlas akan diampuni dosanya.' },
  { surah: 55, ayah: 1, source: 'Ibnu Katsir', content: 'Ar-Rahman: Allah Yang Maha Pengasih kepada seluruh makhluk.' },
  { surah: 67, ayah: 1, source: 'Ibnu Katsir', content: 'Tabarakalladzi bi yadihil mulku: Maha Suci Allah Yang menguasai kerajaan.' },
  { surah: 112, ayah: 1, source: 'Ibnu Katsir', content: 'Qul huwallahu ahad: Katakanlah Dialah Allah Yang Maha Esa.' },
];

async function importTafsir() {
  let count = 0;
  for (const t of tafsirList) {
    const verse = await pool.query('SELECT id FROM quran_verses WHERE surah = $1 AND ayah = $2', [t.surah, t.ayah]);
    if (verse.rows.length) {
      await pool.query(
        `INSERT INTO tafsir (verse_id, source, content) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
        [verse.rows[0].id, t.source, t.content]
      );
      count++;
      console.log(`✅ Tafsir QS. ${t.surah}:${t.ayah} diimport`);
    }
  }
  console.log(`\n🎉 Selesai! ${count} tafsir diimport`);
  await pool.end();
}

importTafsir();