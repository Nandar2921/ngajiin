import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // ✅ Tambahkan proteksi untuk admin routes DAN admin API
    if ((path.startsWith('/admin') || path.startsWith('/api/admin')) && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    if (path.startsWith('/profile') && !token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    return NextResponse.next();
  },
  {
    callbacks: { authorized: ({ token }) => !!token },
  }
);

// ✅ Tambahkan /api/admin/:path* ke matcher
export const config = { 
  matcher: ['/admin/:path*', '/api/admin/:path*', '/profile/:path*'] 
};