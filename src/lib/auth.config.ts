import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
// [FIX BUG #5] Gunakan pool terpusat dari src/lib/pg.ts
import { pool } from '@/lib/pg';

// [FIX BUG #6] Throw error jika NEXTAUTH_SECRET tidak di-set
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET is not set. Please set it in your environment variables.');
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'email@example.com' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Cari user berdasarkan email
          const result = await pool.query(
            'SELECT id, name, email, password, role FROM users WHERE email = $1',
            [credentials.email]
          );
          
          const user = result.rows[0];
          
          if (!user) {
            console.log('User not found:', credentials.email);
            return null;
          }
          
          // Verifikasi password
          const isValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isValid) {
            console.log('Invalid password for:', credentials.email);
            return null;
          }
          
          // Return user object (tanpa password)
          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.name = token.name as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 hari
  },
  // [FIX BUG #6] Hapus fallback hardcoded — error sudah dilempar di atas
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
