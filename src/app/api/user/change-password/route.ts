import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { pool } from '@/lib/pg';
import { authOptions } from '@/lib/auth.config';
import bcrypt from 'bcryptjs';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { oldPassword, newPassword } = await request.json();
    const userId = parseInt(session.user.id);

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Password lama dan baru wajib diisi' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password baru minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Cek user
    const userResult = await pool.query(
      'SELECT password FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verifikasi password lama
    const isValid = await bcrypt.compare(oldPassword, userResult.rows[0].password);
    if (!isValid) {
      return NextResponse.json({ error: 'Password lama salah' }, { status: 400 });
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: 'Gagal mengubah password' },
      { status: 500 }
    );
  }
}