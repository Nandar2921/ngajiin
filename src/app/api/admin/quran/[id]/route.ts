import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config'; // ✅ IMPORT
import { db } from '@/lib/db';
import { quranVerses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  // ✅ TAMBAHKAN AUTH CHECK
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { surah, ayah, arabic, translation } = body;

    if (!surah || !ayah || !arabic || !translation) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const existing = await db.select().from(quranVerses).where(eq(quranVerses.id, id));
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Verse not found' }, { status: 404 });
    }

    const updatedVerse = await db.update(quranVerses)
      .set({
        surah: parseInt(surah),
        ayah: parseInt(ayah),
        arabic: arabic,
        translation: translation,
      })
      .where(eq(quranVerses.id, id))
      .returning();

    return NextResponse.json(updatedVerse[0]);
  } catch (error) {
    console.error('Error updating verse:', error);
    return NextResponse.json({ error: 'Failed to update verse' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // ✅ TAMBAHKAN AUTH CHECK
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = parseInt(params.id);

    const existing = await db.select().from(quranVerses).where(eq(quranVerses.id, id));
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Verse not found' }, { status: 404 });
    }

    await db.delete(quranVerses).where(eq(quranVerses.id, id));

    return NextResponse.json({ message: 'Verse deleted successfully' });
  } catch (error) {
    console.error('Error deleting verse:', error);
    return NextResponse.json({ error: 'Failed to delete verse' }, { status: 500 });
  }
}