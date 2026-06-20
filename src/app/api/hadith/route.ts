import { NextResponse } from 'next/server';
import { pool } from '@/lib/pg';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const bookId = searchParams.get('bookId') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT 
        h.id,
        h.number,
        h.arabic,
        h.translation,
        h.narrator,
        h.grade,
        b.name as book_name,
        h.book_id
      FROM hadiths h
      JOIN hadith_books b ON b.id = h.book_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    // Filter by book
    if (bookId) {
      query += ` AND h.book_id = $${paramIndex}`;
      params.push(parseInt(bookId));
      paramIndex++;
    }

    // Search by keyword
    if (search) {
      query += ` AND (h.translation ILIKE $${paramIndex} OR h.arabic ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Count total
    const countQuery = query.replace(
      /SELECT[\s\S]*?FROM/,
      'SELECT COUNT(*) as total FROM'
    );
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0]?.total || '0');

    // Get data with pagination
    query += ` ORDER BY h.book_id, h.number LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return NextResponse.json({
      data: result.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching hadiths:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hadiths' },
      { status: 500 }
    );
  }
}