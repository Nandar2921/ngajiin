const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'sikaji29',
  database: 'sikaji',
});

// Data 42 Hadits Arbain (sumber: kitab resmi An-Nawawi)
const arbainHadith = [
  { number: 1, arabic: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى', translation: 'Sesungguhnya amal itu tergantung pada niatnya, dan setiap orang akan mendapatkan sesuai dengan apa yang dia niatkan', narrator: 'Umar bin Khattab', grade: 'Shahih', reference: 'HR. Bukhari No. 1, Muslim No. 1907', topic: 'Niat' },
  { number: 2, arabic: 'عَنْ عُمَرَ بْنِ الْخَطَّابِ رَضِيَ اللَّهُ عَنْهُ قَالَ: بَيْنَمَا نَحْنُ جُلُوسٌ عِنْدَ رَسُولِ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ ذَاتَ يَوْمٍ إِذْ طَلَعَ عَلَيْنَا رَجُلٌ شَدِيدُ بَيَاضِ الثِّيَابِ شَدِيدُ سَوَادِ الشَّعْرِ...', translation: 'Dari Umar bin Khattab radhiyallahu anhu, ia berkata: Suatu ketika kami sedang duduk-duduk di dekat Rasulullah shallallahu alaihi wasallam, tiba-tiba datanglah seorang laki-laki...', narrator: 'Umar bin Khattab', grade: 'Shahih', reference: 'HR. Muslim No. 8', topic: 'Islam, Iman, Ihsan' },
  { number: 3, arabic: 'عَنْ أَبِي عَبْدِ الرَّحْمَنِ عَبْدِ اللَّهِ بْنِ عُمَرَ بْنِ الْخَطَّابِ رَضِيَ اللَّهُ عَنْهُمَا قَالَ: سَمِعْتُ رَسُولَ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ يَقُولُ: بُنِيَ الْإِسْلَامُ عَلَى خَمْسٍ...', translation: 'Dari Abdullah bin Umar radhiyallahu anhuma, ia berkata: Aku mendengar Rasulullah bersabda: Islam dibangun di atas lima perkara...', narrator: 'Abdullah bin Umar', grade: 'Shahih', reference: 'HR. Bukhari No. 8, Muslim No. 16', topic: 'Rukun Islam' },
  { number: 4, arabic: 'عَنْ أَبِي عَبْدِ الرَّحْمَنِ عَبْدِ اللَّهِ بْنِ مَسْعُودٍ رَضِيَ اللَّهُ عَنْهُ قَالَ: حَدَّثَنَا رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ وَهُوَ الصَّادِقُ الْمَصْدُوقُ...', translation: 'Dari Abdullah bin Mas\'ud radhiyallahu anhu, ia berkata: Rasulullah shallallahu alaihi wasallam yang selalu jujur dan dibenarkan bersabda kepada kami...', narrator: 'Abdullah bin Mas\'ud', grade: 'Shahih', reference: 'HR. Bukhari No. 3208, Muslim No. 2643', topic: 'Penciptaan Manusia' },
  { number: 5, arabic: 'عَنْ أُمِّ الْمُؤْمِنِينَ أُمِّ عَبْدِ اللَّهِ عَائِشَةَ رَضِيَ اللَّهُ عَنْهَا قَالَتْ: قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: مَنْ أَحْدَثَ فِي أَمْرِنَا هَذَا مَا لَيْسَ مِنْهُ فَهُوَ رَدٌّ', translation: 'Dari Aisyah radhiyallahu anha, ia berkata: Rasulullah shallallahu alaihi wasallam bersabda: Barangsiapa mengada-adakan dalam urusan kami ini sesuatu yang tidak ada asalnya, maka ia tertolak', narrator: 'Aisyah', grade: 'Shahih', reference: 'HR. Bukhari No. 2697, Muslim No. 1718', topic: 'Larangan Bid\'ah' },
  // ... tambahkan hingga hadits ke-42
];

async function importArbain() {
  console.log('========================================');
  console.log('📥 MENGIMPOR 42 HADITS ARBAIN NAWAWI');
  console.log('========================================\n');
  
  // Cek atau buat kitab Arbain
  let bookResult = await pool.query(
    `SELECT id FROM hadith_books WHERE name = 'Arbain'`
  );
  
  let bookId;
  if (bookResult.rows.length === 0) {
    const insertResult = await pool.query(
      `INSERT INTO hadith_books (name, name_arabic, name_indonesian, total_hadith) 
       VALUES ('Arbain', 'الأربعون النووية', 'Hadits Arbain Nawawi', 42)
       RETURNING id`,
    );
    bookId = insertResult.rows[0].id;
    console.log('✅ Kitab Hadits Arbain dibuat');
  } else {
    bookId = bookResult.rows[0].id;
    console.log('✅ Kitab Hadits Arbain sudah ada');
  }
  
  let count = 0;
  for (const hadith of arbainHadith) {
    const existing = await pool.query(
      `SELECT id FROM hadiths WHERE book_id = $1 AND number = $2`,
      [bookId, hadith.number]
    );
    
    if (existing.rows.length === 0) {
      await pool.query(
        `INSERT INTO hadiths (book_id, number, arabic, translation, narrator, grade, reference) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [bookId, hadith.number, hadith.arabic, hadith.translation, hadith.narrator, hadith.grade, hadith.reference]
      );
      count++;
      console.log(`✅ Hadits ${hadith.number} diimport - ${hadith.topic}`);
    } else {
      console.log(`⏭️ Hadits ${hadith.number} sudah ada, skip`);
    }
  }
  
  console.log(`\n🎉 Selesai! ${count} hadits Arbain diimport`);
  
  const result = await pool.query('SELECT COUNT(*) FROM hadiths WHERE book_id = $1', [bookId]);
  console.log(`📊 Total hadits Arbain di database: ${result.rows[0].count}`);
  
  await pool.end();
}

importArbain();