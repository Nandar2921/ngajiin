import { NextResponse } from 'next/server';

// Mapping qari ke folder everyayah.com
const qariMap: Record<string, string> = {
  'misyari': 'Mishary_Rashid_Alafasy_128kbps',
  'abdullah_juhany': 'Abdullah_Al_Juhany_128kbps',
  'abdul_muhsin': 'Abdul_Muhsin_Al_Qasim_128kbps',
  'abdurrahman_sudais': 'Abdurrahman_As_Sudais_128kbps',
  'ibrahim_dossari': 'Ibrahim_Al_Dossari_128kbps',
  'yasser_dosari': 'Yasser_Al_Dosari_128kbps',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const surah = searchParams.get('surah');
  const ayah = searchParams.get('ayah');
  const qari = searchParams.get('qari') || 'misyari';

  console.log('🔊 Audio request:', { surah, ayah, qari });

  if (!surah || !ayah) {
    return NextResponse.json({ error: 'Surah and Ayah parameters are required' }, { status: 400 });
  }

  try {
    const surahFormatted = surah.toString().padStart(3, '0');
    const ayahFormatted = ayah.toString().padStart(3, '0');
    const folder = qariMap[qari] || qariMap.misyari;
    
    // Direct URL ke everyayah.com
    const audioUrl = `https://everyayah.com/data/${folder}/${surahFormatted}_${ayahFormatted}.mp3`;
    
    // Cek apakah file exist (optional, but recommended)
    const checkResponse = await fetch(audioUrl, { method: 'HEAD' });
    
    if (checkResponse.ok) {
      return NextResponse.json({ success: true, url: audioUrl });
    } else {
      return NextResponse.json({ error: 'Audio not found for this verse' }, { status: 404 });
    }
  } catch (error) {
    console.error('Audio API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}