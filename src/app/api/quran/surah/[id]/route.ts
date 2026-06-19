import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
});
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const surahId = parseInt(params.id);
  
  try {
    const result = await pool.query(
      `SELECT id, surah, ayah, arabic, translation 
       FROM quran_verses 
       WHERE surah = $1 
       ORDER BY ayah`,
      [surahId]
    );
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching surah:', error);
    return NextResponse.json({ error: 'Failed to fetch surah' }, { status: 500 });
  }
}