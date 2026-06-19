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
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = await params;
    
    // Get topic info
    const topicResult = await pool.query(`
      SELECT * FROM topics WHERE slug = $1
    `, [slug]);
    
    if (topicResult.rows.length === 0) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }
    
    const topic = topicResult.rows[0];
    
    // Get related Quran verses
    const quranResult = await pool.query(`
      SELECT q.surah, q.ayah, q.arabic, q.translation, tr.notes
      FROM topic_relations tr
      JOIN quran_verses q ON tr.content_id = q.id
      WHERE tr.topic_id = $1 AND tr.content_type = 'quran'
      ORDER BY q.surah, q.ayah
    `, [topic.id]);
    
    // Get related Hadiths
    const hadithResult = await pool.query(`
      SELECT h.id, h.number, h.arabic, h.translation, h.narrator, tr.notes
      FROM topic_relations tr
      JOIN hadiths h ON tr.content_id = h.id
      WHERE tr.topic_id = $1 AND tr.content_type = 'hadith'
      ORDER BY h.number
    `, [topic.id]);
    
    return NextResponse.json({
      topic,
      quran: quranResult.rows,
      hadith: hadithResult.rows,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch topic' }, { status: 500 });
  }
}