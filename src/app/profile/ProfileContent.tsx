'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { 
  User, 
  Bookmark, 
  History, 
  Settings, 
  Moon,
  Sun,
  LogOut,
  ChevronRight,
  Calendar,
  Clock,
  FolderHeart,
  Trash2,
  Loader2,
  Music,
  Volume2,
  Globe,
  Bell,
  HelpCircle,
  Camera,
  Save,
  Eye,
  EyeOff,
  Home,
  Shield,
  AlertTriangle,
  ChevronDown,
  Check,
  Edit3,
  Key,
  Languages,
  BellRing
} from 'lucide-react';

// ===== INTERFACES =====
interface BookmarkItem {
  id: number;
  verseId: number;
  surah: number;
  ayah: number;
  arabic: string;
  translation: string;
  createdAt: string;
}

interface HistoryItem {
  id: number;
  keyword: string;
  created_at: string;
}

interface UserStats {
  totalBookmarks: number;
  totalSearches: number;
  totalRead: number;
}

// ===== RECITERS =====
const reciters = [
  { id: '01', name: 'Abdullah Al-Juhany' },
  { id: '02', name: 'Abdul Muhsin Al-Qasim' },
  { id: '03', name: 'Abdurrahman As-Sudais' },
  { id: '04', name: 'Ibrahim Al-Dossari' },
  { id: '05', name: 'Misyari Rasyid Al-Afasy' },
  { id: '06', name: 'Yasser Al-Dosari' },
];

const languages = [
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

export default function ProfileContent() {
  const { t } = useLanguage();
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'profile' | 'bookmarks' | 'history' | 'settings'>('profile');
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [stats, setStats] = useState<UserStats>({
    totalBookmarks: 0,
    totalSearches: 0,
    totalRead: 0,
  });

  // ===== SETTINGS STATE =====
  const [selectedReciter, setSelectedReciter] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sikaji-selected-reciter');
      if (saved) {
        const found = reciters.find(r => r.id === saved);
        if (found) return found;
      }
    }
    return reciters[4];
  });
  const [autoNext, setAutoNext] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sikaji-auto-next') !== 'false';
    }
    return true;
  });
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sikaji-language') || 'id';
    }
    return 'id';
  });
  const [notifications, setNotifications] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sikaji-notifications') !== 'false';
    }
    return true;
  });

  // ===== EDIT PROFILE STATE =====
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // ===== MOUNTED =====
  useEffect(() => {
    setMounted(true);
  }, []);

  // ===== FETCH DATA =====
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (session?.user) {
      setEditName(session.user.name || '');
      const savedImage = localStorage.getItem('sikaji-profile-image');
      if (savedImage) setProfileImage(savedImage);
      fetchData();
    }
  }, [session, status, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookmarksRes, historyRes] = await Promise.all([
        fetch('/api/bookmarks'),
        fetch('/api/search-history')
      ]);
      
      const bookmarksData = await bookmarksRes.json();
      const historyData = await historyRes.json();
      
      const bookmarksArray = Array.isArray(bookmarksData) ? bookmarksData : [];
      const historyArray = Array.isArray(historyData) ? historyData : [];
      
      setBookmarks(bookmarksArray);
      setHistory(historyArray);
      setStats({
        totalBookmarks: bookmarksArray.length,
        totalSearches: historyArray.length,
        totalRead: 0,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ===== HANDLE PROFILE IMAGE =====
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setEditError('File harus berupa gambar');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setEditError('Ukuran gambar maksimal 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      setProfileImage(imageData);
      localStorage.setItem('sikaji-profile-image', imageData);
      setEditSuccess('Foto profil berhasil diupdate');
      setTimeout(() => setEditSuccess(null), 3000);
    };
    reader.readAsDataURL(file);
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    localStorage.removeItem('sikaji-profile-image');
    setEditSuccess('Foto profil dihapus');
    setTimeout(() => setEditSuccess(null), 3000);
  };

  // ===== HANDLE UPDATE PROFILE =====
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setEditError(null);
    setEditSuccess(null);

    try {
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal update profil');
      }

      await update({
        ...session,
        user: {
          ...session?.user,
          name: editName,
        },
      });

      setEditSuccess('Profil berhasil diupdate');
      setIsEditing(false);
      setTimeout(() => setEditSuccess(null), 3000);
    } catch (error: any) {
      setEditError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // ===== HANDLE CHANGE PASSWORD =====
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setEditError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setEditError('Password baru tidak cocok');
      setIsSaving(false);
      return;
    }

    if (newPassword.length < 6) {
      setEditError('Password minimal 6 karakter');
      setIsSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal ubah password');
      }

      setPasswordSuccess('✅ Password berhasil diubah!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch (error: any) {
      setEditError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // ===== HANDLERS =====
  const handleDeleteBookmark = async (verseId: number) => {
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verseId }),
      });
      if (res.ok) {
        setBookmarks(prev => prev.filter(b => b.verseId !== verseId));
        setStats(prev => ({ ...prev, totalBookmarks: prev.totalBookmarks - 1 }));
      }
    } catch (error) {
      console.error('Error deleting bookmark:', error);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('Hapus semua riwayat pencarian?')) return;
    try {
      const res = await fetch('/api/search-history', { method: 'DELETE' });
      if (res.ok) {
        setHistory([]);
        setStats(prev => ({ ...prev, totalSearches: 0 }));
      }
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const handleReciterChange = (reciterId: string) => {
    const reciter = reciters.find(r => r.id === reciterId);
    if (reciter) {
      setSelectedReciter(reciter);
      localStorage.setItem('sikaji-selected-reciter', reciter.id);
    }
  };

  const handleAutoNextChange = (value: boolean) => {
    setAutoNext(value);
    localStorage.setItem('sikaji-auto-next', String(value));
  };

  const handleLanguageChange = (code: string) => {
    setLanguage(code);
    localStorage.setItem('sikaji-language', code);
    window.location.reload();
  };

  const handleNotificationsChange = (value: boolean) => {
    setNotifications(value);
    localStorage.setItem('sikaji-notifications', String(value));
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Yakin ingin menghapus akun? Semua data akan hilang permanen!')) return;
    setIsDeleting(true);
    try {
      alert('Fitur hapus akun akan segera tersedia');
    } catch (error) {
      console.error('Error deleting account:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!mounted || status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // ===== TABS =====
  const tabs = [
    { key: 'profile', label: t('profile.title'), icon: User },
    { key: 'bookmarks', label: t('profile.bookmarks'), icon: Bookmark, count: stats.totalBookmarks },
    { key: 'history', label: t('profile.history'), icon: History, count: stats.totalSearches },
    { key: 'settings', label: t('profile.settings'), icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0b1120] text-gray-200">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 text-sm sm:text-base">
          <Link href="/" className="text-emerald-500 hover:text-emerald-400 transition inline-flex items-center gap-1">
            <Home className="w-4 h-4" /> 
            <span>{t('nav.home')}</span>
          </Link>
          <span className="text-gray-700">/</span>
          <span className="text-white font-medium">{t('profile.title')}</span>
        </div>

        {/* Error/Success Messages */}
        {editError && (
          <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-3 sm:p-4 text-red-400 text-xs sm:text-sm mb-4 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {editError}
          </div>
        )}
        {editSuccess && (
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 sm:p-4 text-emerald-400 text-xs sm:text-sm mb-4">
            {editSuccess}
          </div>
        )}
        {passwordSuccess && (
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 sm:p-4 text-emerald-400 text-xs sm:text-sm mb-4">
            {passwordSuccess}
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-gradient-to-r from-emerald-950/50 to-teal-950/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-emerald-500/20">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Profile Photo */}
            <div className="relative group flex-shrink-0">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-emerald-500/20 border-2 border-emerald-500/30 flex items-center justify-center">
                {profileImage ? (
                  <img src={profileImage} alt={t('profile.photo')} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl sm:text-4xl font-bold text-emerald-400">
                    {session.user?.name?.[0] || 'U'}
                  </span>
                )}
              </div>
              {activeTab === 'profile' && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-1 bg-emerald-600 rounded-full hover:bg-emerald-700 transition"
                >
                  <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-bold text-white truncate">
                  {session.user?.name}
                </h1>
                <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30 capitalize">
                  {session.user?.role || 'user'}
                </span>
              </div>
              <p className="text-sm sm:text-base text-gray-400 truncate">{session.user?.email}</p>
              <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">
                {t('profile.memberSince')} {new Date().toLocaleDateString('id-ID')}
              </p>
            </div>

            {activeTab === 'profile' && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg sm:rounded-xl text-xs sm:text-sm text-white transition flex-shrink-0"
              >
                {isEditing ? t('common.cancel') : t('profile.edit')}
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/10">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-emerald-500">{stats.totalBookmarks}</div>
              <div className="text-[10px] sm:text-xs text-gray-500">{t('profile.totalBookmarks')}</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-emerald-500">{stats.totalSearches}</div>
              <div className="text-[10px] sm:text-xs text-gray-500">{t('profile.totalSearches')}</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-emerald-500">{stats.totalRead}</div>
              <div className="text-[10px] sm:text-xs text-gray-500">{t('profile.totalRead')}</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-0.5 sm:gap-1 border-b border-white/10 mb-4 sm:mb-6 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-b-2 border-emerald-500 text-emerald-500'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">{tab.label}</span>
              {tab.count !== undefined && (
                <span className="text-[10px] sm:text-xs bg-gray-800 px-1 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ===== TAB: PROFILE ===== */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            {/* Edit Profile Form */}
            {isEditing ? (
              <div className="bg-gray-900/30 border border-white/5 rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-emerald-500" />
                  {t('profile.editProfile')}
                </h3>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{t('profile.name')}</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-emerald-500 focus:outline-none text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{t('profile.email')}</label>
                    <input
                      type="email"
                      value={session.user?.email || ''}
                      disabled
                      className="w-full px-4 py-2.5 bg-gray-800/30 border border-gray-700 rounded-xl text-gray-500 cursor-not-allowed text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">{t('profile.email')} tidak dapat diubah</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white font-medium transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                    >
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-4 h-4" />}
                      {t('common.save')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setEditName(session.user?.name || '');
                      }}
                      className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-white transition text-sm"
                    >
                      {t('common.cancel')}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-gray-900/30 border border-white/5 rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-500" />
                  {t('profile.accountInfo')}
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-white/5 gap-1">
                    <span className="text-gray-500">{t('profile.name')}</span>
                    <span className="text-white font-medium">{session.user?.name}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-white/5 gap-1">
                    <span className="text-gray-500">{t('profile.email')}</span>
                    <span className="text-white font-medium">{session.user?.email}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-white/5 gap-1">
                    <span className="text-gray-500">{t('profile.role')}</span>
                    <span className="text-emerald-400 capitalize">{session.user?.role}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between py-2 gap-1">
                    <span className="text-gray-500">{t('profile.status')}</span>
                    <span className="text-green-400">✅ {t('profile.active')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* ===== UBAH PASSWORD ===== */}
            <div className="bg-gray-900/30 border border-white/5 rounded-xl p-4 sm:p-6">
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2 text-emerald-500 hover:text-emerald-400 transition">
                  <Key className="w-5 h-5" />
                  <span className="font-medium text-sm sm:text-base">🔒 {t('profile.changePassword')}</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${showPasswordForm ? 'rotate-180' : ''}`} />
              </button>
              
              {showPasswordForm && (
                <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{t('profile.oldPassword')}</label>
                    <div className="relative">
                      <input
                        type={showOldPassword ? 'text' : 'password'}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-emerald-500 focus:outline-none pr-10 text-sm"
                        required
                        placeholder={t('profile.oldPassword')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      >
                        {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{t('profile.newPassword')}</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-emerald-500 focus:outline-none pr-10 text-sm"
                        required
                        minLength={6}
                        placeholder={t('auth.passwordMin')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{t('profile.confirmPassword')}</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-emerald-500 focus:outline-none text-sm"
                      required
                      placeholder={t('profile.confirmPassword')}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white font-medium transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-4 h-4" />}
                    {t('common.save')}
                  </button>
                </form>
              )}
            </div>

            {/* Hapus Akun */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3 bg-red-950/30 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-950/50 transition text-sm flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> {t('profile.deleteAccount')}
            </button>
          </div>
        )}

        {/* ===== TAB: BOOKMARKS ===== */}
        {activeTab === 'bookmarks' && (
          <div className="space-y-3">
            {bookmarks.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="text-4xl sm:text-5xl mb-4">🔖</div>
                <p className="text-gray-500 mb-4 text-sm sm:text-base">{t('common.noData')}</p>
                <Link href="/search" className="text-emerald-500 hover:text-emerald-400 text-sm">
                  {t('search.title')} →
                </Link>
              </div>
            ) : (
              bookmarks.map((item) => (
                <div key={item.id} className="bg-gray-900/30 border border-white/5 rounded-xl p-3 sm:p-4 hover:bg-gray-900/50 transition group relative">
                  <Link href={`/quran/${item.surah}/${item.ayah}`} className="block pr-10 sm:pr-12">
                    <div className="text-white font-arabic text-lg sm:text-xl text-right mb-1">
                      {item.arabic}
                    </div>
                    <div className="text-gray-300 text-xs sm:text-sm line-clamp-2">
                      {item.translation}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      QS. {item.surah}:{item.ayah}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleDateString('id-ID')}
                    </div>
                  </Link>
                  <button
                    onClick={() => handleDeleteBookmark(item.verseId)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-red-500/20 transition z-10"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* ===== TAB: HISTORY ===== */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {history.length > 0 && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleClearHistory}
                  className="text-sm text-red-500 hover:text-red-400 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> {t('common.delete')} semua
                </button>
              </div>
            )}
            {history.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="text-4xl sm:text-5xl mb-4">🔍</div>
                <p className="text-gray-500 mb-4 text-sm sm:text-base">{t('common.noData')}</p>
                <Link href="/search" className="text-emerald-500 hover:text-emerald-400 text-sm">
                  {t('search.title')} →
                </Link>
              </div>
            ) : (
              history.map((item) => (
                <Link
                  key={item.id}
                  href={`/search?q=${encodeURIComponent(item.keyword)}`}
                  className="block"
                >
                  <div className="bg-gray-900/30 border border-white/5 rounded-xl p-3 sm:p-4 hover:bg-gray-900/50 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-white font-medium text-sm sm:text-base truncate">
                            {item.keyword}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(item.created_at).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-emerald-500 transition flex-shrink-0" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {/* ===== TAB: SETTINGS ===== */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            {/* Tema */}
            <div className="bg-gray-900/30 border border-white/5 rounded-xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Moon className="w-5 h-5 text-purple-400" />
                {t('profile.theme')}
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex-1 py-3 rounded-xl border transition text-sm ${
                    theme === 'dark'
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  <Moon className="w-5 h-5 mx-auto mb-1" />
                  {t('profile.dark')}
                </button>
                <button
                  onClick={() => setTheme('light')}
                  className={`flex-1 py-3 rounded-xl border transition text-sm ${
                    theme === 'light'
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  <Sun className="w-5 h-5 mx-auto mb-1" />
                  {t('profile.light')}
                </button>
              </div>
            </div>

            {/* Qori Favorit */}
            <div className="bg-gray-900/30 border border-white/5 rounded-xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Music className="w-5 h-5 text-purple-400" />
                {t('quran.reciter')}
              </h3>
              <select
                value={selectedReciter.id}
                onChange={(e) => handleReciterChange(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-emerald-500 focus:outline-none text-sm"
              >
                {reciters.map((reciter) => (
                  <option key={reciter.id} value={reciter.id}>
                    {reciter.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">{t('quran.reciter')} akan digunakan untuk audio murottal</p>
            </div>

            {/* Auto-Next */}
            <div className="bg-gray-900/30 border border-white/5 rounded-xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-purple-400" />
                {t('quran.audio')}
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white text-sm">{t('quran.autoNext')}</div>
                  <div className="text-xs text-gray-500">{t('quran.autoNextDesc')}</div>
                </div>
                <button
                  onClick={() => handleAutoNextChange(!autoNext)}
                  className={`w-12 h-6 rounded-full transition ${
                    autoNext ? 'bg-emerald-500' : 'bg-gray-700'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition ${
                    autoNext ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>

            {/* ===== BAHASA ===== */}
            <div className="bg-gray-900/30 border border-white/5 rounded-xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Languages className="w-5 h-5 text-purple-400" />
                {t('profile.language')}
              </h3>
              <p className="text-xs text-gray-500 mb-3">{t('profile.languageDesc')}</p>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`px-3 sm:px-4 py-2 rounded-xl border transition text-sm flex items-center gap-2 ${
                      language === lang.code
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    {lang.name}
                    {language === lang.code && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">🌍 {t('profile.languageDesc')}</p>
            </div>

            {/* ===== NOTIFIKASI ===== */}
            <div className="bg-gray-900/30 border border-white/5 rounded-xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BellRing className="w-5 h-5 text-purple-400" />
                {t('profile.notifications')}
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white text-sm">{t('profile.notifications')}</div>
                  <div className="text-xs text-gray-500">{t('profile.notificationsDesc')}</div>
                </div>
                <button
                  onClick={() => handleNotificationsChange(!notifications)}
                  className={`w-12 h-6 rounded-full transition ${
                    notifications ? 'bg-emerald-500' : 'bg-gray-700'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition ${
                    notifications ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>

            {/* Tentang */}
            <div className="bg-gray-900/30 border border-white/5 rounded-xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-purple-400" />
                {t('profile.about')}
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-white/5 gap-1">
                  <span className="text-gray-500">{t('profile.about')}</span>
                  <span className="text-white">SiKAJI</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-white/5 gap-1">
                  <span className="text-gray-500">{t('profile.version')}</span>
                  <span className="text-white">1.0.0</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-white/5 gap-1">
                  <span className="text-gray-500">{t('profile.database')}</span>
                  <span className="text-white">Neon PostgreSQL</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between py-2 gap-1">
                  <span className="text-gray-500">{t('profile.audioApi')}</span>
                  <span className="text-white">EQuran.id</span>
                </div>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={() => router.push('/api/auth/signout')}
              className="w-full py-3 bg-red-950/30 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-950/50 transition flex items-center justify-center gap-2 text-sm"
            >
              <LogOut className="w-5 h-5" /> {t('nav.logout')}
            </button>
          </div>
        )}
      </div>

      {/* Delete Account Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] border border-red-500/20 rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-red-500 mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {t('profile.deleteConfirm')}
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              {t('profile.deleteWarning')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 bg-gray-800 rounded-xl text-white hover:bg-gray-700 transition text-sm"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 py-3 bg-red-600 rounded-xl text-white hover:bg-red-700 transition disabled:opacity-50 text-sm"
              >
                {isDeleting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t('profile.deleteAccount')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}