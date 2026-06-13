import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  user: 'postgres',
  password: 'sikaji29',
  database: 'sikaji',
});

export async function GET() {
  try {
    // Sementara nonaktifkan auth check untuk testing
    // const session = await getServerSession();
    // if (!session || session.user?.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Quran stats
    const quranResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT surah) as surah
      FROM quran_verses
    `);
    
    // Tafsir stats
    const tafsirResult = await pool.query(`
      SELECT COUNT(*) as total FROM tafsir
    `);
    
    const tafsirSources = await pool.query(`
      SELECT source, COUNT(*) as count
      FROM tafsir
      GROUP BY source
    `);
    
    const sourcesMap: Record<string, number> = {};
    tafsirSources.rows.forEach((row: any) => {
      sourcesMap[row.source] = parseInt(row.count);
    });
    
    // Hadith stats
    const hadithResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT book_id) as books
      FROM hadiths
    `);
    
    // Users stats
    const usersResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins
      FROM users
    `);
    
    return NextResponse.json({
      quran: {
        total: parseInt(quranResult.rows[0].total),
        surah: parseInt(quranResult.rows[0].surah),
      },
      tafsir: {
        total: parseInt(tafsirResult.rows[0]?.total || 0),
        sources: sourcesMap,
      },
      hadith: {
        total: parseInt(hadithResult.rows[0]?.total || 0),
        books: parseInt(hadithResult.rows[0]?.books || 0),
      },
      users: {
        total: parseInt(usersResult.rows[0].total),
        admins: parseInt(usersResult.rows[0].admins),
      },
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}