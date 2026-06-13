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
  },
  {
    id: 5,
    title: "Doa Sebelum Makan",
    arabic: "اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ",
    latin: "Allahumma barik lana fima razaqtana wa qina 'adzaban nar",
    translation: "Ya Allah, berkahilah rezeki yang Engkau berikan kepada kami dan peliharalah kami dari siksa api neraka",
    source: "HR. Ibnu Sunni No. 472"
  },
  {
    id: 6,
    title: "Doa Sesudah Makan",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ",
    latin: "Alhamdulillahilladzi ath'amana wa saqana wa ja'alana muslimin",
    translation: "Segala puji bagi Allah yang telah memberi kami makan dan minum, serta menjadikan kami sebagai orang-orang Islam",
    source: "HR. Abu Dawud No. 3850"
  }
];

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const doa = doaList.find(d => d.id === id);
  
  if (!doa) {
    return NextResponse.json({ error: 'Doa not found' }, { status: 404 });
  }
  
  return NextResponse.json(doa);
}