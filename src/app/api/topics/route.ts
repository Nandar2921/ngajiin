import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  user: 'postgres',
  password: 'sikaji29',
  database: 'sikaji',
});

// Get all topics
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT t.*, COUNT(tr.id) as content_count
      FROM topics t
      LEFT JOIN topic_relations tr ON t.id = tr.topic_id
      GROUP BY t.id
      ORDER BY t.name
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 });
  }
}