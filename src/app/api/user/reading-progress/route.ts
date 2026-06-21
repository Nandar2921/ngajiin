import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { pool } from '@/lib/pg';
import { authOptions } from '@/lib/auth.config';

// [FITUR BARU] Progress baca Qur'an. Posisi terakhir disimpan sebagai
// kolom langsung di tabel users (last_read_surah, last_read_ayah,
// last_read_at) — lihat migration 0005_add_reading_progress.sql.
// Persentase progress dihitung dari posisi linear (jumlah ayat dari awal
// Qur'an sampai ke surah:ayah tsb), bukan dari menandai ayat satu-satu.

// GET: ambil posisi terakhir dibaca + persentase progress
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    const userResult = await pool.query(
      `SELECT last_read_surah, last_read_ayah, last_read_at FROM users WHERE id = $1`,
      [userId]
    );

    const row = userResult.rows[0];

    if (!row || !row.last_read_surah || !row.last_read_ayah) {
      return NextResponse.json({ hasProgress: false });
    }

    const { last_read_surah: surah, last_read_ayah: ayah, last_read_at: updatedAt } = row;

    // Total ayat di seluruh Qur'an (dihitung dari data asli, bukan di-hardcode,
    // supaya tetap akurat meski data belum 100% lengkap di database)
    const totalResult = await pool.query(`SELECT COUNT(*) as total FROM quran_verses`);
    const totalAyat = parseInt(totalResult.rows[0]?.total || '6236');

    // Posisi linear: jumlah ayat dari awal Qur'an sampai surah:ayah ini
    const positionResult = await pool.query(
      `SELECT COUNT(*) as position FROM quran_verses WHERE surah < $1 OR (surah = $1 AND ayah <= $2)`,
      [surah, ayah]
    );
    const position = parseInt(positionResult.rows[0]?.position || '0');

    const surahNameResult = await pool.query(
      `SELECT surah_name FROM quran_verses WHERE surah = $1 LIMIT 1`,
      [surah]
    );
    const surahName = surahNameResult.rows[0]?.surah_name || null;

    return NextResponse.json({
      hasProgress: true,
      surah,
      ayah,
      surahName,
      updatedAt,
      position,
      totalAyat,
      percentage: totalAyat > 0 ? Math.round((position / totalAyat) * 1000) / 10 : 0,
    });
  } catch (error) {
    console.error('Error fetching reading progress:', error);
    return NextResponse.json({ error: 'Failed to fetch reading progress' }, { status: 500 });
  }
}

// POST: simpan/update posisi terakhir dibaca (dipanggil dari halaman baca Qur'an)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const { surah, ayah } = await request.json();

    if (!surah || !ayah || typeof surah !== 'number' || typeof ayah !== 'number') {
      return NextResponse.json({ error: 'surah dan ayah (number) wajib diisi' }, { status: 400 });
    }

    await pool.query(
      `UPDATE users SET last_read_surah = $1, last_read_ayah = $2, last_read_at = NOW() WHERE id = $3`,
      [surah, ayah, userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving reading progress:', error);
    return NextResponse.json({ error: 'Failed to save reading progress' }, { status: 500 });
  }
}
