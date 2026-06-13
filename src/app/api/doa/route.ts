import { NextResponse } from 'next/server';

// Data doa statis (sementara)
const doaList = [
  {
    id: 1,
    title: "Doa Sebelum Tidur",
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    latin: "Bismikallahumma amutu wa ahya",
    translation: "Dengan nama-Mu ya Allah, aku mati dan aku hidup",
    source: "HR. Bukhari No. 6312"
  },
  {
    id: 2,
    title: "Doa Bangun Tidur",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    latin: "Alhamdulillahilladzi ahyaana ba'da ma amaatana wa ilaihin nusyur",
    translation: "Segala puji bagi Allah yang menghidupkan kami setelah mematikan kami, dan kepada-Nya kami dibangkitkan",
    source: "HR. Bukhari No. 6312"
  },
  {
    id: 3,
    title: "Doa Masuk Masjid",
    arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
    latin: "Allahummaftah li abwaba rahmatik",
    translation: "Ya Allah, bukakanlah untukku pintu-pintu rahmat-Mu",
    source: "HR. Muslim No. 713"
  },
  {
    id: 4,
    title: "Doa Keluar Masjid",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
    latin: "Allahumma inni as-aluka min fadlik",
    translation: "Ya Allah, sesungguhnya aku memohon kepada-Mu karunia-Mu",
    source: "HR. Muslim No. 713"
  }
];

export async function GET() {
  return NextResponse.json(doaList);
}