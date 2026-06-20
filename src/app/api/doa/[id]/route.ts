import { NextResponse } from 'next/server';
import { pool } from '@/lib/pg';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await pool.query(
      `SELECT 
        d.*,
        dc.name as category_name,
        dc.slug as category_slug
      FROM doas d
      LEFT JOIN doa_categories dc ON d.category_id = dc.id
      WHERE d.id = $1`,
      [params.id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Doa not found' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching doa:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doa' },
      { status: 500 }
    );
  }
}