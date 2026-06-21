'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
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

const reciters = [
  { id: '01', name: 'Abdullah Al-Juhany' },
  { id: '02', name: 'Abdul Muhsin Al-Qasim' },
  { id: '03', name: 'Abdurrahman As-Sudais' },
  { id: '04', name: 'Ibrahim Al-Dossari' },
  { id: '05', name: 'Misyari Rasyid Al-Afasy' },
  { id: '06', name: 'Yasser Al-Dosari' },
];

interface VerseDetailClientProps {
  surah: string;
  ayah: string;
}

export default function VerseDetailClient({ surah, ayah }: VerseDetailClientProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const surahNum = parseInt(surah);
  const ayahNum = parseInt(ayah);
  
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showTafsir, setShowTafsir] = useState(true);
  
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    isLoading: false,
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    isMuted: false,
    error: null,
  });
  
  // 🔥 FIX: Load reciter dari localStorage
  const [selectedReciter, setSelectedReciter] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sikaji-selected-reciter');
      if (saved) {
        const found = reciters.find(r => r.id === saved);
        if (found) return found;
      }
    }
    return reciters[4]; // Default: Misyari (05)
  });
  
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasAutoPlayed = useRef(false);

  // ===== HANDLE RECITER CHANGE =====
  const handleReciterChange = (reciterId: string) => {
    const reciter = reciters.find(r => r.id === reciterId);
    if (reciter) {
      setSelectedReciter(reciter);
      localStorage.setItem('sikaji-selected-reciter', reciter.id);
      setAudioState(prev => ({ ...prev, error: null }));
      hasAutoPlayed.current = false;
    }
  };

  // ===== FETCH VERSE DATA =====
  useEffect(() => {
    hasAutoPlayed.current = false;
    
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/quran/${surahNum}/${ayahNum}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setData(data);
      } catch (err) {
        console.error(err);
        setError('Gagal memuat data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [surahNum, ayahNum]);

  // ===== CHECK BOOKMARK =====
  useEffect(() => {
    const checkBookmark = async () => {
      if (!session || !data?.verse) return;
      try {
        const res = await fetch('/api/bookmarks');
        if (res.ok) {
          const bookmarks = await res.json();
          const found = bookmarks.some((b: any) => b.verseId === data.verse.id);
          setIsBookmarked(found);
        }
      } catch (error) {
        console.error('Error checking bookmark:', error);
      }
    };
    checkBookmark();
  }, [session, data?.verse]);

  // [FITUR BARU] AUTO-SAVE PROGRESS BACA — tiap kali user (yang login) membuka
  // sebuah ayat, posisi ini disimpan sebagai "terakhir dibaca" lewat
  // /api/user/reading-progress. Ini yang membuat widget progress di homepage
  // bisa selalu menunjukkan posisi terbaru. "Fire and forget" — kalau gagal
  // (mis. offline) tidak mengganggu pengalaman baca.
  useEffect(() => {
    if (!session || !data?.verse) return;
    fetch('/api/user/reading-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ surah: data.verse.surah, ayah: data.verse.ayah }),
    }).catch((err) => console.error('Gagal menyimpan progress baca:', err));
  }, [session, data?.verse]);

  // ===== TOGGLE BOOKMARK =====
  const toggleBookmark = async () => {
    if (!session) {
      alert('Login dulu untuk menyimpan bookmark');
      return;
    }
    if (!data?.verse) return;

    setIsBookmarking(true);
    try {
      if (isBookmarked) {
        const res = await fetch('/api/bookmarks', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ verseId: data.verse.id }),
        });
        if (res.ok) setIsBookmarked(false);
        else {
          const result = await res.json();
          alert(result.error || 'Gagal menghapus bookmark');
        }
      } else {
        const res = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ verseId: data.verse.id }),
        });
        if (res.ok) setIsBookmarked(true);
        else {
          const result = await res.json();
          alert(result.error || 'Gagal menyimpan bookmark');
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsBookmarking(false);
    }
  };

  // ===== AUTO-NEXT =====
  const goToNextVerse = () => {
    if (data?.navigation?.next) {
      const { surah, ayah } = data.navigation.next;
      router.push(`/quran/${surah}/${ayah}`);
    }
  };

  // ===== FETCH AUDIO URL =====
  useEffect(() => {
    if (!data) return;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    setAudioState(prev => ({ ...prev, isLoading: true, error: null }));
    
    const fetchAudioUrl = async () => {
      try {
        const apiUrl = `https://equran.id/api/v2/surat/${surahNum}`;
        const response = await fetch(apiUrl, {
          signal: abortControllerRef.current?.signal,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const result = await response.json();
        
        if (result.code === 200 && result.data) {
          const ayahNumber = data.verse.ayah;
          const ayatData = result.data.ayat?.find((a: any) => a.nomorAyat === ayahNumber);
          
          if (ayatData?.audio) {
            const audioKey = selectedReciter.id;
            let url = ayatData.audio[audioKey];
            
            if (!url && Object.keys(ayatData.audio).length > 0) {
              const firstKey = Object.keys(ayatData.audio)[0];
              url = ayatData.audio[firstKey];
            }
            
            if (url) {
              setAudioUrl(url);
              setAudioState(prev => ({ ...prev, isLoading: false }));
            } else {
              throw new Error('Tidak ada audio yang tersedia');
            }
          } else {
            throw new Error(`Ayat ${ayahNumber} tidak ditemukan`);
          }
        } else {
          throw new Error(result.message || 'Gagal memuat data');
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.error('❌ Failed to load audio:', err);
        
        const fallbackUrl = `https://equran.id/api/audio/murottal/Mishary_Rashid_Alafasy/${surahNum}/${data.verse.ayah}`;
        try {
          const headRes = await fetch(fallbackUrl, { method: 'HEAD' });
          if (headRes.ok) {
            setAudioUrl(fallbackUrl);
            setAudioState(prev => ({ ...prev, isLoading: false, error: null }));
            return;
          }
        } catch (e) {}
        
        setAudioState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: err instanceof Error ? err.message : 'Gagal memuat audio' 
        }));
      }
    };
    
    fetchAudioUrl();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [surahNum, ayahNum, selectedReciter, data]);

  // ===== AUDIO EVENT HANDLERS =====
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadStart = () => {
      setAudioState(prev => ({ ...prev, isLoading: true, error: null }));
    };
    
    const handleCanPlay = () => {
      setAudioState(prev => ({ ...prev, isLoading: false, error: null }));
    };
    
    const handleCanPlayThrough = () => {
      setAudioState(prev => ({ ...prev, isLoading: false, error: null }));
    };
    
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
    
    const handleEnded = () => {
      setAudioState(prev => ({ ...prev, isPlaying: false }));
      goToNextVerse();
    };
    
    const handleError = (e: Event) => {
      const audioElement = e.target as HTMLAudioElement;
      let errorMsg = 'Gagal memutar audio. ';
      if (audioElement.error?.code === 4) {
        errorMsg += 'File tidak ditemukan. Coba reciter lain.';
      } else {
        errorMsg += 'Coba reciter lain.';
      }
      
      setAudioState(prev => ({ 
        ...prev, 
        isPlaying: false, 
        isLoading: false, 
        error: errorMsg 
      }));
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    
    audio.volume = audioState.volume;
    audio.muted = audioState.isMuted;
    
    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [data]);

  // ===== LOAD AUDIO =====
  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.load();
      setAudioState(prev => ({ 
        ...prev, 
        isLoading: true, 
        currentTime: 0, 
        duration: 0, 
        isPlaying: false 
      }));
    }
  }, [audioUrl]);

  // ===== AUTO-PLAY =====
  useEffect(() => {
    if (audioUrl && !audioState.isLoading && !hasAutoPlayed.current) {
      console.log('🎵 Auto-play triggered!');
      hasAutoPlayed.current = true;
      
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(err => {
            console.log('Auto-play blocked by browser:', err);
          });
        }
      }, 300);
    }
  }, [audioUrl, audioState.isLoading]);

  // ===== PLAY/PAUSE =====
  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) {
      setAudioState(prev => ({ ...prev, error: 'Audio belum siap' }));
      return;
    }
    
    if (audioState.isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.error('Playback failed:', err);
        setAudioState(prev => ({ 
          ...prev, 
          error: 'Gagal memutar audio. Coba reciter lain.' 
        }));
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
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat ayat...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
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
  <div className="min-h-screen bg-background text-foreground">
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          {/* Tombol Kembali ke Beranda */}
          <Link 
            href="/" 
            className="text-emerald-500 hover:text-emerald-400 text-sm inline-flex items-center gap-1 transition"
          >
            ← Beranda
          </Link>
          <span className="text-muted-foreground/60">|</span>
          <Link 
            href={`/surah/${surahNum}`} 
            className="text-emerald-500 hover:text-emerald-400 text-sm inline-flex items-center gap-1 transition"
          >
            ← Surah {verse.surah_name}
          </Link>
        </div>
        <div className="flex gap-2">
          <button
            onClick={copyToClipboard}
            className="p-2 rounded-full hover:bg-muted transition"
            title="Salin ayat"
          >
            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
          </button>
          <button
            onClick={shareContent}
            className="p-2 rounded-full hover:bg-muted transition"
            title="Bagikan"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={toggleBookmark}
            disabled={isBookmarking}
            className={`p-2 rounded-full hover:bg-muted transition ${
              isBookmarked ? 'text-yellow-500' : 'text-muted-foreground hover:text-yellow-500'
            } ${isBookmarking ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isBookmarked ? 'Hapus bookmark' : 'Simpan bookmark'}
          >
            {isBookmarking ? (
              <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            ) : isBookmarked ? (
              <Bookmark className="w-5 h-5 fill-yellow-500" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

     
        {/* Surah Info */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-500">
            {verse.surah_name}
          </h1>
          <p className="text-muted-foreground">
            Ayat ke-{verse.ayah}
          </p>
          {navigation.next && (
            <p className="text-xs text-emerald-400/60 mt-1">
              🔄 Auto-play: akan lanjut ke ayat berikutnya
            </p>
          )}
        </div>

        {/* Arabic Text */}
        <div className="bg-card rounded-2xl border border-border p-8 mb-6">
          <div className="text-right text-3xl font-arabic leading-loose">
            {verse.arabic}
          </div>
        </div>

        {/* Translation */}
        <div className="bg-emerald-950/30 rounded-2xl border border-emerald-500/20 p-6 mb-6">
          <h3 className="font-semibold text-emerald-500 mb-2">
            📖 Terjemahan
          </h3>
          <p className="text-foreground/80 leading-relaxed">
            {verse.translation}
          </p>
        </div>

        {/* Audio Player */}
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
              onChange={(e) => handleReciterChange(e.target.value)}
              className="px-3 py-1.5 text-sm bg-muted border border-purple-500/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-foreground"
            >
              {reciters.map((reciter) => (
                <option key={reciter.id} value={reciter.id}>
                  {reciter.name}
                </option>
              ))}
            </select>
          </div>

          <audio ref={audioRef} src={audioUrl || undefined} preload="metadata" />

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
                disabled={!navigation.prev}
              >
                <SkipBack className={`w-5 h-5 ${navigation.prev ? 'text-purple-400' : 'text-muted-foreground/50'}`} />
              </button>
              
              <button
                onClick={togglePlay}
                disabled={audioState.isLoading}
                className="w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white flex items-center justify-center transition shadow-lg disabled:cursor-not-allowed"
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
                disabled={!navigation.next}
              >
                <SkipForward className={`w-5 h-5 ${navigation.next ? 'text-purple-400' : 'text-muted-foreground/50'}`} />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground min-w-[36px]">
                {formatTime(audioState.currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={audioState.duration || 100}
                value={audioState.currentTime}
                onChange={(e) => {
                  const time = parseFloat(e.target.value);
                  if (audioRef.current && audioState.duration) {
                    audioRef.current.currentTime = time;
                    setAudioState(prev => ({ ...prev, currentTime: time }));
                  }
                }}
                className="flex-1 h-1.5 rounded-lg appearance-none bg-purple-800 accent-purple-600 cursor-pointer"
                disabled={!audioState.duration}
              />
              <span className="text-xs text-muted-foreground min-w-[36px]">
                {formatTime(audioState.duration)}
              </span>
            </div>

            {/* Volume Control */}
            <div className="flex items-center justify-end gap-2">
              <button 
                onClick={toggleMute} 
                className="p-1 rounded hover:bg-purple-900/50 transition"
                title={audioState.isMuted ? 'Unmute' : 'Mute'}
              >
                {audioState.isMuted ? (
                  <VolumeX className="w-4 h-4 text-purple-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-purple-400" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={audioState.isMuted ? 0 : audioState.volume}
                onChange={handleVolumeChange}
                className="w-24 h-1 rounded-lg appearance-none bg-purple-800 accent-purple-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Tafsir */}
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
              <div className="bg-purple-950/30 rounded-2xl border border-purple-500/20 p-6 max-h-[400px] overflow-y-auto">
                <div className="text-foreground/80 leading-relaxed text-sm whitespace-pre-line">
                  {tafsir[0].content}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between gap-4 mt-8">
          {navigation.prev ? (
            <button
              onClick={() => goTo(navigation.prev!.surah, navigation.prev!.ayah)}
              className="flex items-center gap-2 px-6 py-3 bg-muted rounded-xl hover:bg-muted/70 transition"
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