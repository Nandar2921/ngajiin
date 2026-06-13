const { Pool } = require('pg');
const cheerio = require('cheerio');

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  user: 'postgres',
  password: 'sikaji29',
  database: 'sikaji',
});

const BASE_URL = 'https://hadeethenc.com/id/browse/category/1';

// Function fetch dengan retry dan user-agent
async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
        }
      });
      if (response.ok) return response;
      console.log(`   ⚠️ Attempt ${i + 1} failed: ${response.status}`);
    } catch (err) {
      console.log(`   ⚠️ Attempt ${i + 1} error: ${err.message}`);
    }
    await new Promise(r => setTimeout(r, 2000));
  }
  return null;
}

async function scrapeHadith() {
  console.log('📥 Mengambil daftar hadits dari kategori...\n');

  // 1. Ambil halaman kategori
  const catRes = await fetchWithRetry(BASE_URL);
  if (!catRes) {
    console.log('❌ Gagal mengambil halaman kategori');
    process.exit(1);
  }
  
  const html = await catRes.text();
  const $ = cheerio.load(html);

  // 2. Ekstrak semua link hadits
  const hadithLinks = [];
  $('a[href*="/id/browse/hadith/"]').each((i, el) => {
    const href = $(el).attr('href');
    const id = href.split('/').pop();
    const translation = $(el).find('b').text().trim();
    if (id && translation && !isNaN(parseInt(id))) {
      hadithLinks.push({ id: parseInt(id), translation, url: `https://hadeethenc.com${href}` });
    }
  });

  console.log(`📊 Ditemukan ${hadithLinks.length} hadits.\n`);

  // 3. Buat kitab
  let bookResult = await pool.query(`SELECT id FROM hadith_books WHERE name = $1`, ['Kumpulan Hadits Pilihan']);
  let bookId;

  if (bookResult.rows.length === 0) {
    const insertBook = await pool.query(
      `INSERT INTO hadith_books (name, name_indonesian) VALUES ($1, $2) RETURNING id`,
      ['Kumpulan Hadits Pilihan', 'Kumpulan Hadits Pilihan']
    );
    bookId = insertBook.rows[0].id;
    console.log('📚 Kitab baru: Kumpulan Hadits Pilihan (ID: ' + bookId + ')');
  } else {
    bookId = bookResult.rows[0].id;
    console.log('📚 Kitab sudah ada (ID: ' + bookId + ')');
  }

  // 4. Ambil detail setiap hadits
  let total = 0;
  for (let i = 0; i < hadithLinks.length; i++) {
    const hadith = hadithLinks[i];
    console.log(`📖 [${i + 1}/${hadithLinks.length}] Hadits ID ${hadith.id}...`);

    try {
      const detailRes = await fetchWithRetry(hadith.url);
      if (!detailRes) {
        console.log(`   ❌ Gagal ambil halaman detail`);
        continue;
      }
      
      const detailHtml = await detailRes.text();
      const $detail = cheerio.load(detailHtml);

      // Cari teks Arab
      let arabic = '';
      
      // Coba berbagai selector
      const arabicSelectors = [
        '.arabic-text', '.hadith-text', '[class*="arabic"]', 
        '.text-arabic', '.arabic', '.text-right', '.rtl'
      ];
      
      for (const selector of arabicSelectors) {
        const elem = $detail(selector).first();
        if (elem.length) {
          const text = elem.text().trim();
          if (text && /[\u0600-\u06FF]/.test(text)) {
            arabic = text;
            break;
          }
        }
      }

      // Fallback
      if (!arabic) {
        $detail('p, div, span').each((i, el) => {
          const text = $detail(el).text().trim();
          if (text && /[\u0600-\u06FF]/.test(text) && text.length > 20 && !arabic) {
            arabic = text;
          }
        });
      }

      // Simpan ke database
      const existing = await pool.query(
        `SELECT id FROM hadiths WHERE book_id = $1 AND number = $2`,
        [bookId, hadith.id]
      );

      if (existing.rows.length === 0) {
        await pool.query(
          `INSERT INTO hadiths (book_id, number, arabic, narrator, source, reference) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [bookId, hadith.id, arabic || '', 'HadeethEnc', 'HadeethEnc', `Hadith ID: ${hadith.id}`]
        );
      }

      // Simpan terjemahan
      await pool.query(
        `INSERT INTO hadith_translations (hadith_id, language, translator, text, source) 
         VALUES ((SELECT id FROM hadiths WHERE book_id = $1 AND number = $2), $3, $4, $5, $6)
         ON CONFLICT (hadith_id, language) DO NOTHING`,
        [bookId, hadith.id, 'id', 'HadeethEnc', hadith.translation, 'hadeethenc.com']
      );

      total++;
      console.log(`   ✅ Terjemahan: "${hadith.translation.substring(0, 50)}..."`);
      if (arabic) console.log(`   📜 Arab: "${arabic.substring(0, 50)}..."`);

    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
    }

    // Delay lebih lama
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log(`\n🎉 Selesai! ${total} hadits berhasil diimport.`);
  await pool.end();
}

scrapeHadith();