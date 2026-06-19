'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  Share2, 
  Copy, 
  Check,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Music,
  Loader2,
  Download
} from 'lucide-react';

interface Verse {
  id: number;
  surah: number;
  ayah: number;
  arabic: string;
  translation: string;
  surah_name: string;
}

interface TafsirItem {
  id: number;
  verseId: number;
  source: string;
  content: string;
}

interface Navigation {
  next: { surah: number; ayah: number } | null;
  prev: { surah: number; ayah: number } | null;
}

interface ApiResponse {
  verse: Verse;
  tafsir: TafsirItem[];
  navigation: Navigation;
}

// Daftar qari dengan URL mapping ke everyayah.com
const reciters = [
  { id: 'mishary', name: 'Mishary Rashid Alafasy', folder: 'Mishary_Rashid_Alafasy_128kbps' },
  { id: 'abdul_basit', name: 'Abdul Basit', folder: 'Abdul_Basit_Mujawwad_192kbps' },
  { id: 'saood_shuraim', name: 'Saood Shuraim', folder: 'Saood_Shuraim_128kbps' },
  { id: 'ahmed_ajamy', name: 'Ahmed Ajamy', folder: 'Ahmed_Ajamy_128kbps' },
];

export default function VerseDetailClient({ surah, ayah }: { surah: string; ayah: string }) {
  const router = useRouter();
  const surahNum = parseInt(surah);
  const ayahNum = parseInt(ayah);
  
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showTafsir, setShowTafsir] = useState(true);
  const [selectedReciter, setSelectedReciter] = useState(reciters[0]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // Audio states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch verse data dari database lokal
  useEffect(() => {
    fetch(`/api/quran/${surahNum}/${ayahNum}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data: ApiResponse) => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Gagal memuat data');
        setLoading(false);
      });
  }, [surahNum, ayahNum]);

  // Cek status bookmark
  useEffect(() => {
    const checkBookmark = async () => {
      if (!data?.verse?.id) return;
      try {
        const res = await fetch('/api/bookmarks');
        if (res.ok) {
          const bookmarks = await res.json();
          const bookmarked = Array.isArray(bookmarks) && bookmarks.some(
            (b: any) => b.content_type === 'quran' && b.content_id === data.verse.id
          );
          setIsBookmarked(bookmarked);
        }
      } catch (error) {
        console.error('Error checking bookmark:', error);
      }
    };
    checkBookmark();
  }, [data]);

  // Build audio URL from everyayah.com
  useEffect(() => {
    const buildAudioUrl = () => {
      setIsLoading(true);
      setAudioError(null);
      
      try {
        const surahFormatted = surahNum.toString().padStart(3, '0');
        const ayahFormatted = ayahNum.toString().padStart(3, '0');
        const url = `https://everyayah.com/data/${selectedReciter.folder}/${surahFormatted}_${ayahFormatted}.mp3`;
        
        setAudioUrl(url);
      } catch (err) {
        console.error('Failed to build audio URL:', err);
        setAudioError('Gagal memuat audio');
      } finally {
        setIsLoading(false);
      }
    };
    
    buildAudioUrl();
  }, [surahNum, ayahNum, selectedReciter]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      setAudioError('Gagal memutar audio. Coba qari lain.');
      setIsLoading(false);
      setIsPlaying(false);
    };
    const handleCanPlay = () => {
      setAudioError(null);
      setIsLoading(false);
    };
    const handleLoadStart = () => setIsLoading(true);
    const handleEnded = () => setIsPlaying(false);
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => setIsLoading(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);

    audio.volume = volume;
    audio.preload = 'metadata';

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
    };
  }, [volume]);

  // Update audio when URL changes
  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.load();
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => setAudioError('Playback failed'));
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const goToVerse = (newSurah: number, newAyah: number) => {
    router.push(`/quran/${newSurah}/${newAyah}`);
  };

  const copyToClipboard = async () => {
    if (!data) return;
    const text = `${data.verse.arabic}\n\n${data.verse.translation}\n\nQS. ${data.verse.surah}:${data.verse.ayah}\n\nBaca di SiKAJI - Quran Digital Indonesia`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const shareContent = async () => {
    if (!data) return;
    const title = `QS. ${data.verse.surah}:${data.verse.ayah} - ${data.verse.surah_name}`;
    const text = `${data.verse.translation.substring(0, 300)}...\n\nBaca selengkapnya di SiKAJI`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      copyToClipboard();
    }
  };

  // Toggle bookmark
  const toggleBookmark = async () => {
    if (!data?.verse?.id) return;
    
    try {
      if (isBookmarked) {
        const res = await fetch('/api/bookmarks', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content_type: 'quran',
            content_id: data.verse.id
          }),
        });
        if (res.ok) setIsBookmarked(false);
      } else {
        const res = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content_type: 'quran',
            content_id: data.verse.id,
            reference: `QS. ${data.verse.surah}:${data.verse.ayah}`,
          }),
        });
        if (res.ok) setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Memuat ayat...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Data tidak ditemukan'}</p>
          <Link href="/search" className="text-emerald-600 hover:underline">
            ← Kembali ke Pencarian
          </Link>
        </div>
      </div>
    );
  }

  const { verse, tafsir, navigation } = data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-gray-900 dark:to-gray-800">
      <audio ref={audioRef} src={audioUrl || ''} preload="metadata" />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/search" className="text-emerald-600 dark:text-emerald-400 hover:underline text-sm inline-flex items-center gap-1">
            ← Kembali
          </Link>
          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              title="Salin ayat"
            >
              {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
            </button>
            <button
              onClick={shareContent}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              title="Bagikan"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={toggleBookmark}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              title={isBookmarked ? 'Hapus bookmark' : 'Simpan bookmark'}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-emerald-500 text-emerald-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Surah Info */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">
            {verse.surah_name}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Ayat ke-{verse.ayah}
          </p>
        </div>

        {/* Arabic Text */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-6">
          <div className="text-right text-3xl font-arabic leading-loose">
            {verse.arabic}
          </div>
        </div>

        {/* Translation */}
        <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl p-6 mb-6">
          <h3 className="font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
            📖 Terjemahan
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {verse.translation}
          </p>
        </div>

        {/* Audio Player Section */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Music className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-semibold text-purple-700 dark:text-purple-400">
                🎧 Dengarkan Murottal
              </h3>
            </div>
            <select
              value={selectedReciter.id}
              onChange={(e) => {
                const reciter = reciters.find(r => r.id === e.target.value);
                if (reciter) setSelectedReciter(reciter);
              }}
              className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {reciters.map((reciter) => (
                <option key={reciter.id} value={reciter.id}>
                  {reciter.name}
                </option>
              ))}
            </select>
          </div>

          {audioError && (
            <div className="mb-3 p-2 bg-red-50 dark:bg-red-950/30 rounded-lg text-red-600 dark:text-red-400 text-sm text-center">
              {audioError}
            </div>
          )}

          {isLoading && (
            <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg text-yellow-600 dark:text-yellow-400 text-sm text-center flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Memuat audio...
            </div>
          )}

          {audioUrl && !isLoading && (
            <div className="space-y-3">
              {/* Main Controls */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => navigation.prev && goToVerse(navigation.prev.surah, navigation.prev.ayah)}
                  className="p-2 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/50 transition"
                  title="Ayat sebelumnya"
                >
                  <SkipBack className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </button>
                
                <button
                  onClick={togglePlay}
                  className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white flex items-center justify-center transition shadow-lg"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                </button>
                
                <button
                  onClick={() => navigation.next && goToVerse(navigation.next.surah, navigation.next.ayah)}
                  className="p-2 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/50 transition"
                  title="Ayat berikutnya"
                >
                  <SkipForward className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[40px]">
                  {formatTime(currentTime)}
                </span>
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-1.5 rounded-full appearance-none bg-purple-200 dark:bg-purple-800 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-600"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[40px]">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Download & Volume */}
              <div className="flex items-center justify-between">
                {audioUrl && (
                  <a
                    href={audioUrl}
                    download={`${verse.surah_name}_${verse.ayah}.mp3`}
                    className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:underline"
                    title="Download audio"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </a>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button onClick={toggleMute} className="p-1 rounded hover:bg-purple-100 dark:hover:bg-purple-900/50">
                    {isMuted ? <VolumeX className="w-4 h-4 text-purple-600" /> : <Volume2 className="w-4 h-4 text-purple-600" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-24 h-1 rounded-full appearance-none bg-purple-200 dark:bg-purple-800 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-600"
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Audio disediakan oleh everyayah.com | {selectedReciter.name}
            </p>
          </div>
        </div>

        {/* Tafsir Section */}
        {tafsir.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setShowTafsir(!showTafsir)}
              className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-semibold mb-3 hover:opacity-80 transition"
            >
              <span className="text-lg">{showTafsir ? '▼' : '▶'}</span>
              📚 Tafsir {tafsir[0].source}
            </button>
            
            {showTafsir && (
              <div className="bg-purple-50 dark:bg-purple-900/30 rounded-2xl p-6">
                <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm whitespace-pre-line">
                  {tafsir[0].content}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4 mt-8">
          {navigation.prev ? (
            <button
              onClick={() => goToVerse(navigation.prev!.surah, navigation.prev!.ayah)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              <ChevronLeft className="w-5 h-5" />
              {navigation.prev.surah}:{navigation.prev.ayah}
            </button>
          ) : (
            <div className="w-24"></div>
          )}
          
          {navigation.next ? (
            <button
              onClick={() => goToVerse(navigation.next!.surah, navigation.next!.ayah)}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition"
            >
              {navigation.next.surah}:{navigation.next.ayah}
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-24"></div>
          )}
        </div>

        {/* Quick Jump */}
        <div className="mt-8 text-center">
          <Link
            href={`/quran/${verse.surah}`}
            className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Lihat semua ayat surat {verse.surah_name} →
          </Link>
        </div>
      </div>
    </div>
  );
}