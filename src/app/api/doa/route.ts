import { NextResponse } from 'next/server';
import { pool } from '@/lib/pg';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let query = `
      SELECT 
        d.*,
        dc.name as category_name,
        dc.slug as category_slug
      FROM doas d
      LEFT JOIN doa_categories dc ON d.category_id = dc.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND dc.slug = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (search) {
      query += ` AND (d.title ILIKE $${paramIndex} OR d.translation ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY d.title LIMIT 50`;

    const result = await pool.query(query, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching doas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doas' },
      { status: 500 }
    );
  }
}