'use client';

import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (status === 'loading') {
    return (
      <nav className="bg-white dark:bg-gray-900 shadow-md px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400">SiKAJI</div>
          <div className="text-gray-500">Loading...</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition">
            SiKAJI
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/search" 
              className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              Search
            </Link>
            <Link 
              href="/surah" 
              className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              Surah
            </Link>
            {/* TAMBAHKAN INI - LINK HADITS */}
            <Link 
              href="/hadith" 
              className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              Hadits
            </Link>
            
            {/* Dark Mode Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
            )}
            
            {session ? (
              <>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {session.user?.name} ({session.user?.role})
                </span>
                <Link 
                  href="/profile" 
                  className="text-emerald-600 dark:text-emerald-400 hover:underline transition"
                >
                  Profile
                </Link>
                {session.user?.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-md hover:bg-emerald-200 dark:hover:bg-emerald-800 transition"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="bg-red-600 hover:bg-red-700 text-white text-sm py-1 px-3 rounded-md transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-emerald-600 dark:text-emerald-400 hover:underline transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-md transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 dark:text-gray-300 focus:outline-none p-2"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-800 px-4 py-3 space-y-2 shadow-lg">
          <Link
            href="/search"
            className="block text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 py-2 transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            Search
          </Link>
          <Link
            href="/surah"
            className="block text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 py-2 transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            Surah
          </Link>
          {/* TAMBAHKAN INI - LINK HADITS MOBILE */}
          <Link
            href="/hadith"
            className="block text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 py-2 transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            Hadits
          </Link>
          
          {session ? (
            <>
              <div className="text-sm text-gray-600 dark:text-gray-300 py-2 border-t dark:border-gray-800 pt-2">
                {session.user?.name} ({session.user?.role})
              </div>
              <Link
                href="/profile"
                className="block text-emerald-600 dark:text-emerald-400 hover:underline py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
              {session.user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="block bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-md inline-block"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              <button
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                className="block bg-red-600 hover:bg-red-700 text-white text-sm py-1 px-3 rounded-md w-full text-left"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="block text-emerald-600 dark:text-emerald-400 hover:underline py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="block bg-emerald-600 text-white px-3 py-1 rounded-md hover:bg-emerald-700 inline-block"
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}