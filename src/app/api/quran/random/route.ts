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
    // Ambil 1 ayat random
    const result = await pool.query(`
      SELECT surah, ayah, arabic, translation 
      FROM quran_verses 
      ORDER BY RANDOM() 
      LIMIT 1
    `);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching random ayah:', error);
    // Fallback: return ayat pertama
    try {
      const fallback = await pool.query(`
        SELECT surah, ayah, arabic, translation 
        FROM quran_verses 
        WHERE surah = 1 AND ayah = 1
      `);
      return NextResponse.json(fallback.rows[0] || {});
    } catch {
      return NextResponse.json({});
    }
  }
}