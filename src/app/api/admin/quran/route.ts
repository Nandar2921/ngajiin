import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config'; // ✅ IMPORT authOptions
import { db } from '@/lib/db';
import { quranVerses } from '@/lib/db/schema';
import { asc, eq, and } from 'drizzle-orm';

// GET: List semua Quran
export async function GET() {
  // ✅ TAMBAHKAN AUTH CHECK
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const verses = await db.select().from(quranVerses).orderBy(asc(quranVerses.surah), asc(quranVerses.ayah));
    return NextResponse.json(verses);
  } catch (error) {
    console.error('Error fetching verses:', error);
    return NextResponse.json({ error: 'Failed to fetch verses' }, { status: 500 });
  }
}

// POST: Tambah ayat baru
export async function POST(request: Request) {
  // ✅ TAMBAHKAN AUTH CHECK
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { surah, ayah, arabic, translation } = body;

    if (!surah || !ayah || !arabic || !translation) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const existing = await db.select()
      .from(quranVerses)
      .where(
        and(
          eq(quranVerses.surah, parseInt(surah)),
          eq(quranVerses.ayah, parseInt(ayah))
        )
      );
    
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Verse already exists' }, { status: 409 });
    }

    const newVerse = await db.insert(quranVerses).values({
      surah: parseInt(surah),
      ayah: parseInt(ayah),
      arabic: arabic,
      translation: translation,
    }).returning();

    return NextResponse.json(newVerse[0], { status: 201 });
  } catch (error) {
    console.error('Error creating verse:', error);
    return NextResponse.json({ error: 'Failed to create verse' }, { status: 500 });
  }
}