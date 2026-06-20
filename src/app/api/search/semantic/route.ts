import { NextResponse } from 'next/server';
import { pool } from '@/lib/pg';

// ✅ PAKAI ENV VAR
const EMBEDDING_API_URL = process.env.EMBEDDING_API_URL || 'http://localhost:8000';

async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch(`${EMBEDDING_API_URL}/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  
  if (!response.ok) {
    throw new Error(`Embedding service error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.embedding;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const limit = parseInt(searchParams.get('limit') || '20');
  const threshold = parseFloat(searchParams.get('threshold') || '0.5');

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
    // ✅ JANGAN SILENT ERROR
    return NextResponse.json(
      { 
        error: 'Semantic search failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        results: [] 
      },
      { status: 500 }
    );
  }
}