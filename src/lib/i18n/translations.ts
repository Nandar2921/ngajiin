// src/lib/i18n/translations.ts

export type Language = 'id' | 'en' | 'ar';

export interface Translation {
  // Navigation
  'nav.home': string;
  'nav.quran': string;
  'nav.hadith': string;
  'nav.tafsir': string;
  'nav.search': string;
  'nav.profile': string;
  'nav.admin': string;
  'nav.login': string;
  'nav.logout': string;
  'nav.register': string;

  // Common
  'common.back': string;
  'common.save': string;
  'common.cancel': string;
  'common.delete': string;
  'common.edit': string;
  'common.search': string;
  'common.loading': string;
  'common.error': string;
  'common.success': string;
  'common.confirm': string;
  'common.close': string;
  'common.readMore': string;
  'common.share': string;
  'common.copy': string;
  'common.copied': string;
  'common.bookmark': string;
  'common.bookmarked': string;
  'common.noData': string;
  'common.viewAll': string;
  'common.showMore': string;
  'common.showLess': string;
  'common.retry': string;

  // Profile
  'profile.title': string;
  'profile.account': string;
  'profile.accountInfo': string;
  'profile.name': string;
  'profile.email': string;
  'profile.role': string;
  'profile.status': string;
  'profile.active': string;
  'profile.memberSince': string;
  'profile.edit': string;
  'profile.editProfile': string;
  'profile.changePassword': string;
  'profile.oldPassword': string;
  'profile.newPassword': string;
  'profile.confirmPassword': string;
  'profile.passwordChanged': string;
  'profile.deleteAccount': string;
  'profile.deleteConfirm': string;
  'profile.deleteWarning': string;
  'profile.statistics': string;
  'profile.bookmarks': string;
  'profile.history': string;
  'profile.settings': string;
  'profile.theme': string;
  'profile.dark': string;
  'profile.light': string;
  'profile.language': string;
  'profile.languageDesc': string;
  'profile.notifications': string;
  'profile.notificationsDesc': string;
  'profile.about': string;
  'profile.version': string;
  'profile.database': string;
  'profile.audioApi': string;
  'profile.logout': string;
  'profile.photo': string;
  'profile.photoUpdate': string;
  'profile.photoRemove': string;
  'profile.totalBookmarks': string;
  'profile.totalSearches': string;
  'profile.totalRead': string;
  'profile.badges': string;
  'profile.joinDate': string;

  // Home
  'home.heroEyebrow': string;
  'home.heroTitle': string;
  'home.heroSubtitle': string;
  'home.howItWorks': string;
  'home.howItWorksTitle': string;
  'home.howItWorksDesc': string;
  'home.step1': string;
  'home.step1Desc': string;
  'home.step2': string;
  'home.step2Desc': string;
  'home.step3': string;
  'home.step3Desc': string;
  'home.popular': string;
  'home.popularTitle': string;
  'home.popularDesc': string;
  'home.features': string;
  'home.featuresTitle': string;
  'home.featuresDesc': string;
  'home.ayahOfDay': string;
  'home.ayahOfDayTitle': string;
  'home.ayahOfDayDesc': string;
  'home.ctaTitle': string;
  'home.ctaDesc': string;
  'home.ctaButton': string;
  'home.bacaAlquran': string;
  'home.quranDesc': string;
  'home.hadithDesc': string;
  'home.tafsirDesc': string;
  'home.doaDesc': string;

  // Quran
  'quran.title': string;
  'quran.verse': string;
  'quran.verses': string;
  'quran.surah': string;
  'quran.surahs': string;
  'quran.translation': string;
  'quran.arabic': string;
  'quran.tafsir': string;
  'quran.audio': string;
  'quran.listen': string;
  'quran.reciter': string;
  'quran.autoNext': string;
  'quran.autoNextDesc': string;

  // Hadith
  'hadith.title': string;
  'hadith.hadiths': string;
  'hadith.book': string;
  'hadith.books': string;
  'hadith.narrator': string;
  'hadith.grade': string;
  'hadith.reference': string;
  'hadith.sanad': string;
  'hadith.sanadDesc': string;
  'hadith.viewSanad': string;
  'hadith.hideSanad': string;

  // Search
  'search.title': string;
  'search.subtitle': string;
  'search.recent': string;
  'search.placeholder': string;
  'search.results': string;
  'search.resultsFor': string;
  'search.found': string;
  'search.noResults': string;
  'search.tryAgain': string;
  'search.popular': string;
  'search.mode': string;
  'search.modeExact': string;
  'search.modeSemantic': string;
  'search.modeExactDesc': string;
  'search.modeSemanticDesc': string;
  'search.sortRelevance': string;
  'search.sortLatest': string;
  'search.filter': string;
  'search.all': string;
  'search.quran': string;
  'search.hadith': string;
  'search.tafsir': string;
  'search.expanded': string;
  'search.relevant': string;
  'search.noResultsInCategory': string;
  'search.error': string;

  // Admin
  'admin.title': string;
  'admin.dashboard': string;
  'admin.users': string;
  'admin.statistics': string;
  'admin.totalUsers': string;
  'admin.totalQuran': string;
  'admin.totalHadith': string;
  'admin.totalTafsir': string;
  'admin.totalSearches': string;
  'admin.totalBookmarks': string;

  // Auth
  'auth.login': string;
  'auth.register': string;
  'auth.email': string;
  'auth.password': string;
  'auth.confirmPassword': string;
  'auth.forgotPassword': string;
  'auth.noAccount': string;
  'auth.haveAccount': string;
  'auth.loginSuccess': string;
  'auth.registerSuccess': string;
  'auth.loginError': string;
  'auth.registerError': string;
  'auth.passwordMin': string;
  'auth.emailRequired': string;
  'auth.passwordRequired': string;
  'auth.name': string;
  'auth.nameRequired': string;

  // Footer
  'footer.copyright': string;
  'footer.privacy': string;
  'footer.terms': string;
  'footer.contact': string;
  'footer.about': string;
}

export const translations: Record<Language, Translation> = {
  id: {
    // Navigation
    'nav.home': 'Beranda',
    'nav.quran': 'Al-Quran',
    'nav.hadith': 'Hadits',
    'nav.tafsir': 'Tafsir',
    'nav.search': 'Cari',
    'nav.profile': 'Profil',
    'nav.admin': 'Admin',
    'nav.login': 'Masuk',
    'nav.logout': 'Keluar',
    'nav.register': 'Daftar',

    // Common
    'common.back': 'Kembali',
    'common.save': 'Simpan',
    'common.cancel': 'Batal',
    'common.delete': 'Hapus',
    'common.edit': 'Ubah',
    'common.search': 'Cari',
    'common.loading': 'Memuat...',
    'common.error': 'Terjadi kesalahan',
    'common.success': 'Berhasil',
    'common.confirm': 'Konfirmasi',
    'common.close': 'Tutup',
    'common.readMore': 'Baca selengkapnya',
    'common.share': 'Bagikan',
    'common.copy': 'Salin',
    'common.copied': 'Tersalin!',
    'common.bookmark': 'Simpan bookmark',
    'common.bookmarked': 'Tersimpan',
    'common.noData': 'Tidak ada data',
    'common.viewAll': 'Lihat semua',
    'common.showMore': 'Tampilkan lebih',
    'common.showLess': 'Tampilkan sedikit',
    'common.retry': 'Coba Lagi',

    // Profile
    'profile.title': 'Profil',
    'profile.account': 'Akun',
    'profile.accountInfo': 'Informasi Akun',
    'profile.name': 'Nama',
    'profile.email': 'Email',
    'profile.role': 'Role',
    'profile.status': 'Status',
    'profile.active': 'Aktif',
    'profile.memberSince': 'Bergabung sejak',
    'profile.edit': 'Edit',
    'profile.editProfile': 'Edit Profil',
    'profile.changePassword': 'Ubah Password',
    'profile.oldPassword': 'Password Lama',
    'profile.newPassword': 'Password Baru',
    'profile.confirmPassword': 'Konfirmasi Password',
    'profile.passwordChanged': 'Password berhasil diubah!',
    'profile.deleteAccount': 'Hapus Akun',
    'profile.deleteConfirm': 'Hapus Akun?',
    'profile.deleteWarning': 'Semua data termasuk bookmark dan riwayat akan hilang permanen. Tindakan ini tidak dapat dibatalkan.',
    'profile.statistics': 'Statistik',
    'profile.bookmarks': 'Bookmark',
    'profile.history': 'Riwayat',
    'profile.settings': 'Pengaturan',
    'profile.theme': 'Tampilan',
    'profile.dark': 'Gelap',
    'profile.light': 'Terang',
    'profile.language': 'Bahasa',
    'profile.languageDesc': 'Pilih bahasa untuk seluruh aplikasi',
    'profile.notifications': 'Notifikasi',
    'profile.notificationsDesc': 'Terima notifikasi dari aplikasi',
    'profile.about': 'Tentang',
    'profile.version': 'Versi',
    'profile.database': 'Database',
    'profile.audioApi': 'API Audio',
    'profile.logout': 'Keluar',
    'profile.photo': 'Foto Profil',
    'profile.photoUpdate': 'Ubah foto profil',
    'profile.photoRemove': 'Hapus foto',
    'profile.totalBookmarks': 'Total Bookmark',
    'profile.totalSearches': 'Total Pencarian',
    'profile.totalRead': 'Total Bacaan',
    'profile.badges': 'Lencana',
    'profile.joinDate': 'Bergabung',

    // Home
    'home.heroEyebrow': 'Pencari Referensi Islam',
    'home.heroTitle': 'Tanya apa saja,\ntemukan jawabannya\ndari Al-Qur\'an & Hadits',
    'home.heroSubtitle': 'Ketik pertanyaan atau topik bebas — Kajiin otomatis membaca database dan mencarikan ayat, hadits, serta tafsir yang paling relevan.',
    'home.howItWorks': 'Cara Kerja',
    'home.howItWorksTitle': 'Cukup ketik, sisanya biar sistem',
    'home.howItWorksDesc': 'Tidak perlu tahu nomor surah atau bab hadits',
    'home.step1': 'Ketik bebas',
    'home.step1Desc': 'Tulis pertanyaan dalam Bahasa Indonesia sehari-hari',
    'home.step2': 'Sistem membaca',
    'home.step2Desc': 'AI memindai seluruh database Al-Qur\'an, hadits, dan tafsir',
    'home.step3': 'Hasil relevan',
    'home.step3Desc': 'Ayat, hadits, dan tafsir terpilih disajikan lengkap',
    'home.popular': 'Populer',
    'home.popularTitle': 'Topik yang Sering Dicari',
    'home.popularDesc': 'Klik untuk langsung mencari',
    'home.features': 'Fitur',
    'home.featuresTitle': 'Semua sumber dalam satu tempat',
    'home.featuresDesc': 'Database lengkap, pencarian cerdas',
    'home.ayahOfDay': 'Renungan Harian',
    'home.ayahOfDayTitle': 'Ayat Hari Ini',
    'home.ayahOfDayDesc': 'Ambil waktu sejenak untuk merenungkan firman Allah',
    'home.ctaTitle': 'Punya pertanyaan tentang Islam?',
    'home.ctaDesc': 'Tanyakan langsung — sistem kami siap mencarikan jawabannya',
    'home.ctaButton': 'Mulai Cari',
    'home.bacaAlquran': '📖 Baca Al-Qur\'an',
    'home.quranDesc': 'Teks Arab, transliterasi, terjemahan 6.236 ayat',
    'home.hadithDesc': 'Bukhari, Muslim, Abu Dawud, Tirmidzi & lainnya',
    'home.tafsirDesc': 'Penjelasan mendalam setiap ayat dari ulama',
    'home.doaDesc': 'Kumpulan doa ma\'tsur lengkap beserta artinya',

    // Quran
    'quran.title': 'Al-Quran',
    'quran.verse': 'Ayat',
    'quran.verses': 'Ayat',
    'quran.surah': 'Surah',
    'quran.surahs': 'Surah',
    'quran.translation': 'Terjemahan',
    'quran.arabic': 'Teks Arab',
    'quran.tafsir': 'Tafsir',
    'quran.audio': 'Audio',
    'quran.listen': 'Dengarkan Murottal',
    'quran.reciter': 'Qori',
    'quran.autoNext': 'Auto-Next',
    'quran.autoNextDesc': 'Otomatis lanjut ke ayat berikutnya',

    // Hadith
    'hadith.title': 'Kumpulan Hadits',
    'hadith.hadiths': 'Hadits',
    'hadith.book': 'Kitab',
    'hadith.books': 'Kitab',
    'hadith.narrator': 'Perawi',
    'hadith.grade': 'Derajat',
    'hadith.reference': 'Referensi',
    'hadith.sanad': 'Sanad',
    'hadith.sanadDesc': 'Sanad adalah rantai periwayat yang menyampaikan hadits ini dari generasi ke generasi',
    'hadith.viewSanad': 'Lihat Sanad (Rantai Perawi)',
    'hadith.hideSanad': 'Sembunyikan Sanad',

    // Search
    'search.title': 'Pencarian',
    'search.subtitle': 'Cari ayat Al-Qur\'an, hadits, dan tafsir dengan mudah',
    'search.recent': 'Pencarian Terakhir',
    'search.placeholder': 'Cari Quran, Hadits, Tafsir...',
    'search.results': 'hasil ditemukan',
    'search.resultsFor': 'Hasil pencarian',
    'search.found': 'Ditemukan',
    'search.noResults': 'Tidak ditemukan hasil',
    'search.tryAgain': 'Coba gunakan kata kunci lain',
    'search.popular': 'Topik Populer',
    'search.mode': 'Mode',
    'search.modeExact': 'Tepat',
    'search.modeSemantic': 'Cerdas',
    'search.modeExactDesc': 'Mencari kata persis',
    'search.modeSemanticDesc': 'Mencari makna (lebih luas)',
    'search.sortRelevance': 'Sort: Relevansi',
    'search.sortLatest': 'Sort: Terbaru',
    'search.filter': 'Filter',
    'search.all': 'Semua',
    'search.quran': 'Quran',
    'search.hadith': 'Hadits',
    'search.tafsir': 'Tafsir',
    'search.expanded': 'Pencarian diperluas ke',
    'search.relevant': 'relevan',
    'search.noResultsInCategory': 'Tidak ditemukan hasil di kategori ini',
    'search.error': 'Terjadi kesalahan saat mencari',

    // Admin
    'admin.title': 'Panel Admin',
    'admin.dashboard': 'Dashboard',
    'admin.users': 'Users',
    'admin.statistics': 'Statistik',
    'admin.totalUsers': 'Total Users',
    'admin.totalQuran': 'Total Ayat Quran',
    'admin.totalHadith': 'Total Hadits',
    'admin.totalTafsir': 'Total Tafsir',
    'admin.totalSearches': 'Total Pencarian',
    'admin.totalBookmarks': 'Total Bookmark',

    // Auth
    'auth.login': 'Masuk',
    'auth.register': 'Daftar',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Konfirmasi Password',
    'auth.forgotPassword': 'Lupa Password?',
    'auth.noAccount': 'Belum punya akun?',
    'auth.haveAccount': 'Sudah punya akun?',
    'auth.loginSuccess': 'Berhasil masuk!',
    'auth.registerSuccess': 'Berhasil mendaftar!',
    'auth.loginError': 'Gagal masuk. Periksa email dan password.',
    'auth.registerError': 'Gagal mendaftar. Coba lagi.',
    'auth.passwordMin': 'Password minimal 6 karakter',
    'auth.emailRequired': 'Email wajib diisi',
    'auth.passwordRequired': 'Password wajib diisi',
    'auth.name': 'Nama',
    'auth.nameRequired': 'Nama wajib diisi',

    // Footer
    'footer.copyright': 'Hak Cipta © 2026 Kajiin. All rights reserved.',
    'footer.privacy': 'Kebijakan Privasi',
    'footer.terms': 'Syarat & Ketentuan',
    'footer.contact': 'Kontak',
    'footer.about': 'Tentang',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.quran': 'Al-Quran',
    'nav.hadith': 'Hadith',
    'nav.tafsir': 'Tafsir',
    'nav.search': 'Search',
    'nav.profile': 'Profile',
    'nav.admin': 'Admin',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    'nav.register': 'Register',

    // Common
    'common.back': 'Back',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.search': 'Search',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success',
    'common.confirm': 'Confirm',
    'common.close': 'Close',
    'common.readMore': 'Read more',
    'common.share': 'Share',
    'common.copy': 'Copy',
    'common.copied': 'Copied!',
    'common.bookmark': 'Bookmark',
    'common.bookmarked': 'Bookmarked',
    'common.noData': 'No data',
    'common.viewAll': 'View all',
    'common.showMore': 'Show more',
    'common.showLess': 'Show less',
    'common.retry': 'Retry',

    // Profile
    'profile.title': 'Profile',
    'profile.account': 'Account',
    'profile.accountInfo': 'Account Information',
    'profile.name': 'Name',
    'profile.email': 'Email',
    'profile.role': 'Role',
    'profile.status': 'Status',
    'profile.active': 'Active',
    'profile.memberSince': 'Member since',
    'profile.edit': 'Edit',
    'profile.editProfile': 'Edit Profile',
    'profile.changePassword': 'Change Password',
    'profile.oldPassword': 'Old Password',
    'profile.newPassword': 'New Password',
    'profile.confirmPassword': 'Confirm Password',
    'profile.passwordChanged': 'Password changed successfully!',
    'profile.deleteAccount': 'Delete Account',
    'profile.deleteConfirm': 'Delete Account?',
    'profile.deleteWarning': 'All data including bookmarks and history will be permanently deleted. This action cannot be undone.',
    'profile.statistics': 'Statistics',
    'profile.bookmarks': 'Bookmarks',
    'profile.history': 'History',
    'profile.settings': 'Settings',
    'profile.theme': 'Theme',
    'profile.dark': 'Dark',
    'profile.light': 'Light',
    'profile.language': 'Language',
    'profile.languageDesc': 'Select language for the entire application',
    'profile.notifications': 'Notifications',
    'profile.notificationsDesc': 'Receive notifications from the app',
    'profile.about': 'About',
    'profile.version': 'Version',
    'profile.database': 'Database',
    'profile.audioApi': 'Audio API',
    'profile.logout': 'Logout',
    'profile.photo': 'Profile Photo',
    'profile.photoUpdate': 'Update profile photo',
    'profile.photoRemove': 'Remove photo',
    'profile.totalBookmarks': 'Total Bookmarks',
    'profile.totalSearches': 'Total Searches',
    'profile.totalRead': 'Total Read',
    'profile.badges': 'Badges',
    'profile.joinDate': 'Joined',

    // Home
    'home.heroEyebrow': 'Islamic Reference Finder',
    'home.heroTitle': 'Ask anything,\nfind the answer\nfrom Al-Quran & Hadith',
    'home.heroSubtitle': 'Type your question or topic — Kajiin automatically searches the database and finds the most relevant verses, hadiths, and tafsir.',
    'home.howItWorks': 'How It Works',
    'home.howItWorksTitle': 'Just type, the system does the rest',
    'home.howItWorksDesc': 'No need to know surah numbers or hadith chapters',
    'home.step1': 'Type freely',
    'home.step1Desc': 'Write your question in everyday language',
    'home.step2': 'System reads',
    'home.step2Desc': 'AI scans the entire Quran, hadith, and tafsir database',
    'home.step3': 'Relevant results',
    'home.step3Desc': 'Selected verses, hadiths, and tafsir are presented in full',
    'home.popular': 'Popular',
    'home.popularTitle': 'Popular Topics',
    'home.popularDesc': 'Click to search directly',
    'home.features': 'Features',
    'home.featuresTitle': 'All sources in one place',
    'home.featuresDesc': 'Complete database, smart search',
    'home.ayahOfDay': 'Daily Reflection',
    'home.ayahOfDayTitle': 'Verse of the Day',
    'home.ayahOfDayDesc': 'Take a moment to reflect on Allah\'s words',
    'home.ctaTitle': 'Have a question about Islam?',
    'home.ctaDesc': 'Ask directly — our system is ready to find the answers',
    'home.ctaButton': 'Start Searching',
    'home.bacaAlquran': '📖 Read Al-Quran',
    'home.quranDesc': 'Arabic text, transliteration, translation of 6,236 verses',
    'home.hadithDesc': 'Bukhari, Muslim, Abu Dawud, Tirmidhi & others',
    'home.tafsirDesc': 'In-depth explanation of every verse from scholars',
    'home.doaDesc': 'Complete collection of daily duas with meanings',

    // Quran
    'quran.title': 'Al-Quran',
    'quran.verse': 'Verse',
    'quran.verses': 'Verses',
    'quran.surah': 'Surah',
    'quran.surahs': 'Surahs',
    'quran.translation': 'Translation',
    'quran.arabic': 'Arabic Text',
    'quran.tafsir': 'Tafsir',
    'quran.audio': 'Audio',
    'quran.listen': 'Listen to Murottal',
    'quran.reciter': 'Reciter',
    'quran.autoNext': 'Auto-Next',
    'quran.autoNextDesc': 'Automatically go to next verse',

    // Hadith
    'hadith.title': 'Hadith Collection',
    'hadith.hadiths': 'Hadiths',
    'hadith.book': 'Book',
    'hadith.books': 'Books',
    'hadith.narrator': 'Narrator',
    'hadith.grade': 'Grade',
    'hadith.reference': 'Reference',
    'hadith.sanad': 'Sanad',
    'hadith.sanadDesc': 'Sanad is the chain of narrators who transmitted this hadith from generation to generation',
    'hadith.viewSanad': 'View Sanad (Chain of Narrators)',
    'hadith.hideSanad': 'Hide Sanad',

    // Search
    'search.title': 'Search',
    'search.subtitle': 'Search Quran verses, hadith, and tafsir easily',
    'search.recent': 'Recent Searches',
    'search.placeholder': 'Search Quran, Hadith, Tafsir...',
    'search.results': 'results found',
    'search.resultsFor': 'Search results for',
    'search.found': 'Found',
    'search.noResults': 'No results found',
    'search.tryAgain': 'Try different keywords',
    'search.popular': 'Popular Topics',
    'search.mode': 'Mode',
    'search.modeExact': 'Exact',
    'search.modeSemantic': 'Smart',
    'search.modeExactDesc': 'Search exact words',
    'search.modeSemanticDesc': 'Search by meaning (broader)',
    'search.sortRelevance': 'Sort: Relevance',
    'search.sortLatest': 'Sort: Latest',
    'search.filter': 'Filter',
    'search.all': 'All',
    'search.quran': 'Quran',
    'search.hadith': 'Hadith',
    'search.tafsir': 'Tafsir',
    'search.expanded': 'Search expanded to',
    'search.relevant': 'relevant',
    'search.noResultsInCategory': 'No results found in this category',
    'search.error': 'An error occurred while searching',

    // Admin
    'admin.title': 'Admin Panel',
    'admin.dashboard': 'Dashboard',
    'admin.users': 'Users',
    'admin.statistics': 'Statistics',
    'admin.totalUsers': 'Total Users',
    'admin.totalQuran': 'Total Quran Verses',
    'admin.totalHadith': 'Total Hadith',
    'admin.totalTafsir': 'Total Tafsir',
    'admin.totalSearches': 'Total Searches',
    'admin.totalBookmarks': 'Total Bookmarks',

    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.noAccount': "Don't have an account?",
    'auth.haveAccount': 'Already have an account?',
    'auth.loginSuccess': 'Login successful!',
    'auth.registerSuccess': 'Registration successful!',
    'auth.loginError': 'Login failed. Check email and password.',
    'auth.registerError': 'Registration failed. Try again.',
    'auth.passwordMin': 'Password must be at least 6 characters',
    'auth.emailRequired': 'Email is required',
    'auth.passwordRequired': 'Password is required',
    'auth.name': 'Name',
    'auth.nameRequired': 'Name is required',

    // Footer
    'footer.copyright': 'Copyright © 2026 Kajiin. All rights reserved.',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms & Conditions',
    'footer.contact': 'Contact',
    'footer.about': 'About',
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.quran': 'القرآن الكريم',
    'nav.hadith': 'الحديث',
    'nav.tafsir': 'التفسير',
    'nav.search': 'بحث',
    'nav.profile': 'الملف الشخصي',
    'nav.admin': 'المشرف',
    'nav.login': 'تسجيل الدخول',
    'nav.logout': 'تسجيل الخروج',
    'nav.register': 'تسجيل',

    // Common
    'common.back': 'رجوع',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.search': 'بحث',
    'common.loading': 'جاري التحميل...',
    'common.error': 'حدث خطأ',
    'common.success': 'تم بنجاح',
    'common.confirm': 'تأكيد',
    'common.close': 'إغلاق',
    'common.readMore': 'اقرأ المزيد',
    'common.share': 'مشاركة',
    'common.copy': 'نسخ',
    'common.copied': 'تم النسخ!',
    'common.bookmark': 'حفظ',
    'common.bookmarked': 'تم الحفظ',
    'common.noData': 'لا توجد بيانات',
    'common.viewAll': 'عرض الكل',
    'common.showMore': 'عرض المزيد',
    'common.showLess': 'عرض أقل',
    'common.retry': 'حاول مرة أخرى',

    // Profile
    'profile.title': 'الملف الشخصي',
    'profile.account': 'الحساب',
    'profile.accountInfo': 'معلومات الحساب',
    'profile.name': 'الاسم',
    'profile.email': 'البريد الإلكتروني',
    'profile.role': 'الدور',
    'profile.status': 'الحالة',
    'profile.active': 'نشط',
    'profile.memberSince': 'عضو منذ',
    'profile.edit': 'تعديل',
    'profile.editProfile': 'تعديل الملف الشخصي',
    'profile.changePassword': 'تغيير كلمة المرور',
    'profile.oldPassword': 'كلمة المرور القديمة',
    'profile.newPassword': 'كلمة المرور الجديدة',
    'profile.confirmPassword': 'تأكيد كلمة المرور',
    'profile.passwordChanged': 'تم تغيير كلمة المرور بنجاح!',
    'profile.deleteAccount': 'حذف الحساب',
    'profile.deleteConfirm': 'حذف الحساب؟',
    'profile.deleteWarning': 'سيتم حذف جميع البيانات بما في ذلك الإشارات المرجعية والسجل بشكل دائم. لا يمكن التراجع عن هذا الإجراء.',
    'profile.statistics': 'الإحصائيات',
    'profile.bookmarks': 'الإشارات المرجعية',
    'profile.history': 'السجل',
    'profile.settings': 'الإعدادات',
    'profile.theme': 'المظهر',
    'profile.dark': 'داكن',
    'profile.light': 'فاتح',
    'profile.language': 'اللغة',
    'profile.languageDesc': 'اختر اللغة للتطبيق بأكمله',
    'profile.notifications': 'الإشعارات',
    'profile.notificationsDesc': 'تلقي الإشعارات من التطبيق',
    'profile.about': 'حول',
    'profile.version': 'الإصدار',
    'profile.database': 'قاعدة البيانات',
    'profile.audioApi': 'API الصوت',
    'profile.logout': 'تسجيل الخروج',
    'profile.photo': 'الصورة الشخصية',
    'profile.photoUpdate': 'تحديث الصورة الشخصية',
    'profile.photoRemove': 'إزالة الصورة',
    'profile.totalBookmarks': 'إجمالي الإشارات المرجعية',
    'profile.totalSearches': 'إجمالي عمليات البحث',
    'profile.totalRead': 'إجمالي القراءات',
    'profile.badges': 'الشارات',
    'profile.joinDate': 'تاريخ الانضمام',

    // Home
    'home.heroEyebrow': 'محرك البحث الإسلامي',
    'home.heroTitle': 'اسأل أي شيء،\nابحث عن الإجابة\nمن القرآن والحديث',
    'home.heroSubtitle': 'اكتب سؤالك أو موضوعك — Kajiin يبحث تلقائياً في قاعدة البيانات ويجد الآيات والأحاديث والتفسيرات الأكثر صلة.',
    'home.howItWorks': 'كيف يعمل',
    'home.howItWorksTitle': 'ما عليك سوى الكتابة، والنظام يفعل الباقي',
    'home.howItWorksDesc': 'لا حاجة لمعرفة أرقام السور أو أبواب الحديث',
    'home.step1': 'اكتب بحرية',
    'home.step1Desc': 'اكتب سؤالك باللغة العربية أو الإنجليزية',
    'home.step2': 'النظام يقرأ',
    'home.step2Desc': 'الذكاء الاصطناعي يمسح قاعدة البيانات بأكملها',
    'home.step3': 'نتائج ذات صلة',
    'home.step3Desc': 'الآيات والأحاديث والتفسيرات المختارة معروضة بالكامل',
    'home.popular': 'شائع',
    'home.popularTitle': 'مواضيع شائعة',
    'home.popularDesc': 'انقر للبحث مباشرة',
    'home.features': 'الميزات',
    'home.featuresTitle': 'جميع المصادر في مكان واحد',
    'home.featuresDesc': 'قاعدة بيانات كاملة، بحث ذكي',
    'home.ayahOfDay': 'تأمل يومي',
    'home.ayahOfDayTitle': 'آية اليوم',
    'home.ayahOfDayDesc': 'خذ لحظة للتأمل في كلام الله',
    'home.ctaTitle': 'هل لديك سؤال عن الإسلام؟',
    'home.ctaDesc': 'اسأل مباشرة — نظامنا جاهز للعثور على الإجابات',
    'home.ctaButton': 'ابدأ البحث',
    'home.bacaAlquran': '📖 اقرأ القرآن',
    'home.quranDesc': 'نص عربي، ترجمة 6,236 آية',
    'home.hadithDesc': 'البخاري، مسلم، أبو داود، الترمذي وغيرهم',
    'home.tafsirDesc': 'شرح عميق لكل آية من العلماء',
    'home.doaDesc': 'مجموعة كاملة من الأدعية اليومية مع المعاني',

    // Quran
    'quran.title': 'القرآن الكريم',
    'quran.verse': 'آية',
    'quran.verses': 'آيات',
    'quran.surah': 'سورة',
    'quran.surahs': 'سور',
    'quran.translation': 'ترجمة',
    'quran.arabic': 'النص العربي',
    'quran.tafsir': 'تفسير',
    'quran.audio': 'صوت',
    'quran.listen': 'استمع إلى التلاوة',
    'quran.reciter': 'القارئ',
    'quran.autoNext': 'التشغيل التلقائي',
    'quran.autoNextDesc': 'الانتقال تلقائياً إلى الآية التالية',

    // Hadith
    'hadith.title': 'مجموعة الأحاديث',
    'hadith.hadiths': 'أحاديث',
    'hadith.book': 'كتاب',
    'hadith.books': 'كتب',
    'hadith.narrator': 'الراوي',
    'hadith.grade': 'الدرجة',
    'hadith.reference': 'المرجع',
    'hadith.sanad': 'السند',
    'hadith.sanadDesc': 'السند هو سلسلة الرواة الذين نقلوا هذا الحديث من جيل إلى جيل',
    'hadith.viewSanad': 'عرض السند (سلسلة الرواة)',
    'hadith.hideSanad': 'إخفاء السند',

    // Search
    'search.title': 'بحث',
    'search.subtitle': 'ابحث في آيات القرآن والحديث والتفسير بسهولة',
    'search.recent': 'عمليات البحث الأخيرة',
    'search.placeholder': 'ابحث في القرآن والحديث والتفسير...',
    'search.results': 'نتائج',
    'search.resultsFor': 'نتائج البحث عن',
    'search.found': 'تم العثور على',
    'search.noResults': 'لا توجد نتائج',
    'search.tryAgain': 'جرب كلمات بحث مختلفة',
    'search.popular': 'مواضيع شائعة',
    'search.mode': 'الوضع',
    'search.modeExact': 'دقيق',
    'search.modeSemantic': 'ذكي',
    'search.modeExactDesc': 'البحث عن الكلمات المطابقة',
    'search.modeSemanticDesc': 'البحث عن المعنى (أوسع)',
    'search.sortRelevance': 'ترتيب: الأكثر صلة',
    'search.sortLatest': 'ترتيب: الأحدث',
    'search.filter': 'فلتر',
    'search.all': 'الكل',
    'search.quran': 'القرآن',
    'search.hadith': 'الحديث',
    'search.tafsir': 'التفسير',
    'search.expanded': 'تم توسيع البحث إلى',
    'search.relevant': 'ذات صلة',
    'search.noResultsInCategory': 'لا توجد نتائج في هذه الفئة',
    'search.error': 'حدث خطأ أثناء البحث',

    // Admin
    'admin.title': 'لوحة المشرف',
    'admin.dashboard': 'لوحة التحكم',
    'admin.users': 'المستخدمين',
    'admin.statistics': 'الإحصائيات',
    'admin.totalUsers': 'إجمالي المستخدمين',
    'admin.totalQuran': 'إجمالي آيات القرآن',
    'admin.totalHadith': 'إجمالي الأحاديث',
    'admin.totalTafsir': 'إجمالي التفاسير',
    'admin.totalSearches': 'إجمالي عمليات البحث',
    'admin.totalBookmarks': 'إجمالي الإشارات المرجعية',

    // Auth
    'auth.login': 'تسجيل الدخول',
    'auth.register': 'تسجيل',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.confirmPassword': 'تأكيد كلمة المرور',
    'auth.forgotPassword': 'نسيت كلمة المرور؟',
    'auth.noAccount': 'ليس لديك حساب؟',
    'auth.haveAccount': 'لديك حساب بالفعل؟',
    'auth.loginSuccess': 'تم تسجيل الدخول بنجاح!',
    'auth.registerSuccess': 'تم التسجيل بنجاح!',
    'auth.loginError': 'فشل تسجيل الدخول. تحقق من البريد الإلكتروني وكلمة المرور.',
    'auth.registerError': 'فشل التسجيل. حاول مرة أخرى.',
    'auth.passwordMin': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
    'auth.emailRequired': 'البريد الإلكتروني مطلوب',
    'auth.passwordRequired': 'كلمة المرور مطلوبة',
    'auth.name': 'الاسم',
    'auth.nameRequired': 'الاسم مطلوب',

    // Footer
    'footer.copyright': 'جميع الحقوق محفوظة © 2026 Kajiin',
    'footer.privacy': 'سياسة الخصوصية',
    'footer.terms': 'الشروط والأحكام',
    'footer.contact': 'اتصل بنا',
    'footer.about': 'حول',
  },
};

export function getDirection(code: Language): 'ltr' | 'rtl' {
  return code === 'ar' ? 'rtl' : 'ltr';
}

export function getLanguageName(code: Language): string {
  const names = {
    id: 'Bahasa Indonesia',
    en: 'English',
    ar: 'العربية',
  };
  return names[code] || code;
}

export function getLanguageFlag(code: Language): string {
  const flags = {
    id: '🇮🇩',
    en: '🇬🇧',
    ar: '🇸🇦',
  };
  return flags[code] || '🌐';
}