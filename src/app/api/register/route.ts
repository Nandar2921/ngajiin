import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  user: 'postgres',
  password: 'sikaji29',
  database: 'sikaji',
});

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    
    // Validasi input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }
    
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }
    
    // Cek apakah email sudah terdaftar
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user baru
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role) 
       VALUES ($1, $2, $3, 'user') 
       RETURNING id, name, email, role`,
      [name, email, hashedPassword]
    );
    
    const newUser = result.rows[0];
    
    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat registrasi' },
      { status: 500 }
    );
  }
}