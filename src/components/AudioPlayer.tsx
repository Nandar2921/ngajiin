'use client';

import { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
  surah: number;
  ayah: number;
}

export default function AudioPlayer({ surah, ayah }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getAudioUrl = (surah: number, ayah: number) => {
    const surahStr = surah.toString().padStart(3, '0');
    const ayahStr = ayah.toString().padStart(3, '0');
    return `https://everyayah.com/data/Alafasy_64kbps/${surahStr}${ayahStr}.mp3`;
  };

  const audioUrl = getAudioUrl(surah, ayah);

  useEffect(() => {
    // Cleanup ketika surah/ayah berubah
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
  }, [surah, ayah]);

  const togglePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onloadstart = () => setIsLoading(true);
      audioRef.current.oncanplay = () => setIsLoading(false);
      audioRef.current.onerror = () => {
        setIsLoading(false);
        alert('Gagal memuat audio. Coba lagi nanti.');
      };
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => alert('Gagal memutar audio'));
      setIsPlaying(true);
    }
  };

  return (
    <button
      onClick={togglePlay}
      disabled={isLoading}
      className="flex items-center gap-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm transition disabled:opacity-50"
      title={`Putar QS. ${surah}:${ayah}`}
    >
      {isLoading ? (
        <span>⏳ Memuat...</span>
      ) : isPlaying ? (
        <span>⏸️ Pause</span>
      ) : (
        <span>🔊 Play</span>
      )}
    </button>
  );
}