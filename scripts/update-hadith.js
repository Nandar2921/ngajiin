const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  user: 'postgres',
  password: 'sikaji29',
  database: 'sikaji',
});

const hadithData = [
  {
    number: 1,
    arabic: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    translation: 'Sesungguhnya amal itu tergantung pada niatnya, dan setiap orang akan mendapatkan sesuai dengan apa yang dia niatkan',
  },
  {
    number: 2,
    arabic: 'عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
    translation: 'Barangsiapa beriman kepada Allah dan hari akhir, hendaklah berkata baik atau diam',
  },
  {
    number: 3,
    arabic: 'عَنْ أَنَسِ بْنِ مَالِكٍ رَضِيَ اللَّهُ عَنْهُ عَنِ النَّبِيِّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ قَالَ: لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
    translation: 'Tidak sempurna iman seseorang di antara kamu sehingga ia mencintai untuk saudaranya apa yang ia cintai untuk dirinya sendiri',
  },
  {
    number: 4,
    arabic: 'عَنْ أَبِي عَبْدِ الرَّحْمَنِ عَبْدِ اللَّهِ بْنِ مَسْعُودٍ رَضِيَ اللَّهُ عَنْهُ قَالَ: حَدَّثَنَا رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ وَهُوَ الصَّادِقُ الْمَصْدُوقُ: إِنَّ أَحَدَكُمْ يُجْمَعُ خَلْقُهُ فِي بَطْنِ أُمِّهِ أَرْبَعِينَ يَوْمًا...',
    translation: 'Sesungguhnya setiap kalian dikumpulkan penciptaannya dalam perut ibunya selama 40 hari...',
  },
  {
    number: 5,
    arabic: 'عَنْ أُمِّ الْمُؤْمِنِينَ أُمِّ عَبْدِ اللَّهِ عَائِشَةَ رَضِيَ اللَّهُ عَنْهَا قَالَتْ: قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: مَنْ أَحْدَثَ فِي أَمْرِنَا هَذَا مَا لَيْسَ مِنْهُ فَهُوَ رَدٌّ',
    translation: 'Barangsiapa mengada-adakan dalam urusan kami ini sesuatu yang tidak ada asalnya, maka ia tertolak',
  },
];

async function updateHadith() {
  console.log('📥 Mengupdate hadits dengan teks Arab asli...\n');
  
  for (const h of hadithData) {
    await pool.query(
      `UPDATE hadiths SET arabic = $1, translation = $2 WHERE number = $3`,
      [h.arabic, h.translation, h.number]
    );
    console.log(`✅ Hadits ${h.number} diupdate`);
  }
  
  console.log('\n🎉 Selesai!');
  await pool.end();
}

updateHadith().catch(console.error);