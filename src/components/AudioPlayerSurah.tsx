'use client';

import { useState, useRef, useEffect } from 'react';

interface AudioPlayerSurahProps {
  surah: number;
  surahName: string;
  totalAyah: number;
}

export default function AudioPlayerSurah({ surah, surahName, totalAyah }: AudioPlayerSurahProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAyah, setCurrentAyah] = useState(0);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Coba beberapa sumber audio alternatif
  const getAudioUrl = () => {
    // Sumber 1: dari islamic.network (sering bekerja)
    return `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${surah}.mp3`;
  };

  const audioUrl = getAudioUrl();

  useEffect(() => {
    // Cleanup
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
      setProgress(0);
      setCurrentAyah(0);
    }
  }, [surah]);

  useEffect(() => {
    if (!audioRef.current) return;

    const updateProgress = () => {
      const duration = audioRef.current?.duration;
      const currentTime = audioRef.current?.currentTime;
      if (duration && currentTime && duration > 0) {
        setProgress((currentTime / duration) * 100);
        const estimatedAyah = Math.floor((currentTime / duration) * totalAyah) + 1;
        setCurrentAyah(Math.min(estimatedAyah, totalAyah));
      }
    };
    
    audioRef.current.ontimeupdate = updateProgress;
    audioRef.current.onended = () => {
      setIsPlaying(false);
      setCurrentAyah(0);
      setProgress(0);
    };
    audioRef.current.onerror = () => {
      setIsLoading(false);
      setIsPlaying(false);
      alert('Gagal memuat audio surah. Coba refresh halaman.');
    };
  }, [totalAyah]);

  const togglePlay = () => {
    if (!audioRef.current) {
      const audio = new Audio(audioUrl);
      audio.onloadstart = () => setIsLoading(true);
      audio.oncanplay = () => setIsLoading(false);
      audioRef.current = audio;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((err) => {
        console.error('Play error:', err);
        alert('Gagal memutar audio. Coba lagi nanti.');
        setIsLoading(false);
      });
      setIsPlaying(true);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentAyah(0);
      setProgress(0);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm transition disabled:opacity-50 ${
            isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Memuat...
            </>
          ) : isPlaying ? (
            <>
              ⏸️ Pause Surah
            </>
          ) : (
            <>
              🎵 Play Full Surah
            </>
          )}
        </button>
        
        {isPlaying && (
          <button
            onClick={stopAudio}
            className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm"
          >
            ⏹️ Stop
          </button>
        )}
      </div>
      
      {isPlaying && (
        <div className="w-full">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>🎧 {surahName}</span>
            <span>Ayat {currentAyah} / {totalAyah}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}