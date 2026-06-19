import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Pool } from 'pg';
import { authOptions } from '@/lib/auth.config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
});
// GET: Ambil riwayat pencarian user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json([]);
    }

    const userId = parseInt(session.user.id);
    const result = await pool.query(
      `SELECT id, keyword, created_at 
       FROM search_history 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 20`,
      [userId]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching search history:', error);
    return NextResponse.json([]);
  }
}

// POST: Simpan riwayat pencarian
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const { keyword } = await request.json();

    if (!keyword) {
      return NextResponse.json({ error: 'Missing keyword' }, { status: 400 });
    }

    await pool.query(
      `INSERT INTO search_history (user_id, keyword) VALUES ($1, $2)`,
      [userId, keyword]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving search history:', error);
    return NextResponse.json({ error: 'Failed to save search history' }, { status: 500 });
  }
}

// DELETE: Hapus semua riwayat pencarian
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    await pool.query(`DELETE FROM search_history WHERE user_id = $1`, [userId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing search history:', error);
    return NextResponse.json({ error: 'Failed to clear search history' }, { status: 500 });
  }
}