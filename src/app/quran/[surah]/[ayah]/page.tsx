'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
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
  Loader2
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

interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  error: string | null;
}

// Daftar reciter yang tersedia (EQuran.id API)
const reciters = [
  { id: 'misyari', name: 'Mishary Alafasy', url: 'misyari' },
  { id: 'sudais', name: 'Abdurrahman As-Sudais', url: 'sudais' },
  { id: 'shuraim', name: 'Saood Shuraim', url: 'shuraim' },
  { id: 'ajamy', name: 'Ahmed Ajamy', url: 'ajamy' },
];

export default function QuranDetailPage() {
  const params = useParams();
  const router = useRouter();
  const surahNum = parseInt(params.surah as string);
  const ayahNum = parseInt(params.ayah as string);
  
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showTafsir, setShowTafsir] = useState(true);
  
  // Audio state
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    isLoading: false,
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    isMuted: false,
    error: null,
  });
  const [selectedReciter, setSelectedReciter] = useState(reciters[0]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // Load audio URL from EQuran.id API (reliable)
  useEffect(() => {
    if (!data) return;
    
    // Gunakan API EQuran.id yang reliable
    const reciterMap: Record<string, string> = {
      'misyari': 'Mishary_Rashid_Alafasy',
      'sudais': 'Abdurrahman_As_Sudais',
      'shuraim': 'Saood_Shuraim',
      'ajamy': 'Ahmed_Ajamy',
    };
    
    const reciterPath = reciterMap[selectedReciter.id];
    const url = `https://equran.id/api/audio/murottal/${reciterPath}/${surahNum}/${ayahNum}`;
    setAudioUrl(url);
    
  }, [surahNum, ayahNum, selectedReciter, data]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setAudioState(prev => ({ ...prev, currentTime: audio.currentTime }));
    };
    
    const handleDurationChange = () => {
      setAudioState(prev => ({ ...prev, duration: audio.duration }));
    };
    
    const handlePlay = () => {
      setAudioState(prev => ({ ...prev, isPlaying: true, error: null }));
    };
    
    const handlePause = () => {
      setAudioState(prev => ({ ...prev, isPlaying: false }));
    };
    
    const handleError = () => {
      setAudioState(prev => ({ ...prev, isPlaying: false, error: 'Gagal memutar audio. Coba reciter lain.' }));
    };
    
    const handleLoadStart = () => {
      setAudioState(prev => ({ ...prev, isLoading: true }));
    };
    
    const handleCanPlay = () => {
      setAudioState(prev => ({ ...prev, isLoading: false, error: null }));
    };
    
    const handleEnded = () => {
      setAudioState(prev => ({ ...prev, isPlaying: false }));
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);
    
    audio.volume = audioState.volume;
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioState.volume]);

  // Load audio when URL changes
  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.load();
      setAudioState(prev => ({ ...prev, isLoading: true, currentTime: 0, duration: 0, isPlaying: false }));
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    
    if (audioState.isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.error('Playback failed:', err);
        setAudioState(prev => ({ ...prev, error: 'Playback failed' }));
      });
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setAudioState(prev => ({ ...prev, volume: newVolume, isMuted: newVolume === 0 }));
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioState.isMuted;
      setAudioState(prev => ({ ...prev, isMuted: !prev.isMuted }));
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const goTo = (surah: number, ayah: number) => {
    router.push(`/quran/${surah}/${ayah}`);
  };

  const copyToClipboard = async () => {
    if (!data) return;
    const text = `${data.verse.arabic}\n\n${data.verse.translation}\n\nQS. ${data.verse.surah}:${data.verse.ayah}`;
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
    const text = `QS. ${data.verse.surah}:${data.verse.ayah}\n${data.verse.translation.substring(0, 200)}...`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `QS. ${data.verse.surah}:${data.verse.ayah}`,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Memuat ayat...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Data tidak ditemukan'}</p>
          <Link href="/search" className="text-emerald-500 hover:underline">
            ← Kembali ke Pencarian
          </Link>
        </div>
      </div>
    );
  }

  const { verse, tafsir, navigation } = data;

  return (
    <div className="min-h-screen bg-[#0b1120] text-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/quran" className="text-emerald-500 hover:text-emerald-400 text-sm inline-flex items-center gap-1">
            ← Daftar Surah
          </Link>
          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className="p-2 rounded-full hover:bg-white/5 transition"
              title="Salin ayat"
            >
              {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
            </button>
            <button
              onClick={shareContent}
              className="p-2 rounded-full hover:bg-white/5 transition"
              title="Bagikan"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              className="p-2 rounded-full hover:bg-white/5 transition"
              title="Bookmark"
            >
              <Bookmark className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Surah Info */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-500">
            {verse.surah_name}
          </h1>
          <p className="text-gray-500">
            Ayat ke-{verse.ayah}
          </p>
        </div>

        {/* Arabic Text */}
        <div className="bg-gray-900/50 rounded-2xl border border-white/10 p-8 mb-6">
          <div className="text-right text-3xl font-arabic leading-loose">
            {verse.arabic}
          </div>
        </div>

        {/* Translation */}
        <div className="bg-emerald-950/30 rounded-2xl border border-emerald-500/20 p-6 mb-6">
          <h3 className="font-semibold text-emerald-500 mb-2">
            📖 Terjemahan
          </h3>
          <p className="text-gray-300 leading-relaxed">
            {verse.translation}
          </p>
        </div>

        {/* Audio Player Section */}
        <div className="bg-purple-950/30 rounded-2xl border border-purple-500/20 p-5 mb-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Music className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold text-purple-400">
                Dengarkan Murottal
              </h3>
            </div>
            <select
              value={selectedReciter.id}
              onChange={(e) => {
                const reciter = reciters.find(r => r.id === e.target.value);
                if (reciter) setSelectedReciter(reciter);
              }}
              className="px-3 py-1.5 text-sm bg-gray-800 border border-purple-500/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
            >
              {reciters.map((reciter) => (
                <option key={reciter.id} value={reciter.id}>
                  {reciter.name}
                </option>
              ))}
            </select>
          </div>

          <audio ref={audioRef} src={audioUrl || ''} />

          <div className="space-y-3">
            {audioState.error && (
              <div className="text-center text-red-500 text-sm py-2 bg-red-950/30 rounded-lg">
                {audioState.error}
              </div>
            )}

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => navigation.prev && goTo(navigation.prev.surah, navigation.prev.ayah)}
                className="p-2 rounded-full hover:bg-purple-900/50 transition"
                title="Ayat sebelumnya"
              >
                <SkipBack className="w-5 h-5 text-purple-400" />
              </button>
              
              <button
                onClick={togglePlay}
                disabled={audioState.isLoading}
                className="w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white flex items-center justify-center transition shadow-lg"
              >
                {audioState.isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : audioState.isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-0.5" />
                )}
              </button>
              
              <button
                onClick={() => navigation.next && goTo(navigation.next.surah, navigation.next.ayah)}
                className="p-2 rounded-full hover:bg-purple-900/50 transition"
                title="Ayat berikutnya"
              >
                <SkipForward className="w-5 h-5 text-purple-400" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">{formatTime(audioState.currentTime)}</span>
              <input
                type="range"
                min="0"
                max={audioState.duration || 0}
                value={audioState.currentTime}
                onChange={(e) => {
                  const time = parseFloat(e.target.value);
                  if (audioRef.current) {
                    audioRef.current.currentTime = time;
                    setAudioState(prev => ({ ...prev, currentTime: time }));
                  }
                }}
                className="flex-1 h-1.5 rounded-lg appearance-none bg-purple-800 accent-purple-600"
              />
              <span className="text-xs text-gray-500">{formatTime(audioState.duration)}</span>
            </div>

            {/* Volume Control */}
            <div className="flex items-center justify-end gap-2">
              <button onClick={toggleMute} className="p-1 rounded hover:bg-purple-900/50">
                {audioState.isMuted ? <VolumeX className="w-4 h-4 text-purple-400" /> : <Volume2 className="w-4 h-4 text-purple-400" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={audioState.isMuted ? 0 : audioState.volume}
                onChange={handleVolumeChange}
                className="w-24 h-1 rounded-lg appearance-none bg-purple-800 accent-purple-600"
              />
            </div>
          </div>
        </div>

        {/* Tafsir Section */}
        {tafsir.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setShowTafsir(!showTafsir)}
              className="flex items-center gap-2 text-purple-400 font-semibold mb-3 hover:opacity-80 transition"
            >
              <span>{showTafsir ? '▼' : '▶'}</span>
              📚 Tafsir {tafsir[0].source}
            </button>
            
            {showTafsir && (
              <div className="bg-purple-950/30 rounded-2xl border border-purple-500/20 p-6">
                <div className="text-gray-300 leading-relaxed text-sm whitespace-pre-line">
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
              onClick={() => goTo(navigation.prev!.surah, navigation.prev!.ayah)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition"
            >
              <ChevronLeft className="w-5 h-5" />
              {navigation.prev.surah}:{navigation.prev.ayah}
            </button>
          ) : (
            <div className="w-24"></div>
          )}
          
          {navigation.next ? (
            <button
              onClick={() => goTo(navigation.next!.surah, navigation.next!.ayah)}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition"
            >
              {navigation.next.surah}:{navigation.next.ayah}
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-24"></div>
          )}
        </div>
      </div>
    </div>
  );
}