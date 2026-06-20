import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { pool } from '@/lib/pg';
import { authOptions } from '@/lib/auth.config';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();
    const userId = parseInt(session.user.id);

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Nama harus diisi minimal 2 karakter' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email, role',
      [name.trim(), userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Gagal mengupdate profil' },
      { status: 500 }
    );
  }
}