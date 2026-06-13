import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  user: 'postgres',
  password: 'sikaji29',
  database: 'sikaji',
});

async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch('http://localhost:8000/embed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  
  const data = await response.json();
  return data.embedding;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const limit = parseInt(searchParams.get('limit') || '20');
  const threshold = parseFloat(searchParams.get('threshold') || '0.5'); // Turunkan threshold untuk IndoBERT

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const queryEmbedding = await getEmbedding(q);
    const vectorStr = `[${queryEmbedding.join(',')}]`;

    const result = await pool.query(`
      SELECT 
        'quran' as type,
        id, surah, ayah, arabic, translation,
        CONCAT('QS. ', surah, ':', ayah) as reference,
        1 - (embedding <=> $1::vector) as similarity
      FROM quran_verses
      WHERE embedding IS NOT NULL 
        AND (1 - (embedding <=> $1::vector)) > $2
      ORDER BY embedding <=> $1::vector
      LIMIT $3
    `, [vectorStr, threshold, limit]);

    return NextResponse.json({
      query: q,
      results: result.rows,
    });

  } catch (error) {
    console.error('Semantic search error:', error);
    return NextResponse.json({ error: 'Semantic search failed' }, { status: 500 });
  }
}