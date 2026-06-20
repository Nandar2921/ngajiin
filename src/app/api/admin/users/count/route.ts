import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { pool } from '@/lib/pg';
import { authOptions } from '@/lib/auth.config';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await pool.query('SELECT COUNT(*) FROM users');
    
    return NextResponse.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Error fetching users count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users count' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'GET, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}