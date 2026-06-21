'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function EditVersePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    surah: '',
    ayah: '',
    arabic: '',
    translation: '',
  });

  // Fetch data ayat
  useEffect(() => {
    const fetchVerse = async () => {
      try {
        const response = await fetch(`/api/quran/${formData.surah}/${formData.ayah}`);
        if (response.ok) {
          const data = await response.json();
          setFormData({
            surah: data.verse.surah.toString(),
            ayah: data.verse.ayah.toString(),
            arabic: data.verse.arabic,
            translation: data.verse.translation,
          });
        }
      } catch (err) {
        setError('Failed to fetch verse');
      } finally {
        setFetching(false);
      }
    };

    // Alternate: fetch from admin API
    const fetchVerseFromAdmin = async () => {
      try {
        const response = await fetch(`/api/admin/quran`);
        const verses = await response.json();
        const verse = verses.find((v: any) => v.id === parseInt(id));
        if (verse) {
          setFormData({
            surah: verse.surah.toString(),
            ayah: verse.ayah.toString(),
            arabic: verse.arabic,
            translation: verse.translation,
          });
        } else {
          setError('Verse not found');
        }
      } catch (err) {
        setError('Failed to fetch verse');
      } finally {
        setFetching(false);
      }
    };

    fetchVerseFromAdmin();
  }, [id]);

  if (status === 'loading' || fetching) return <div>Loading...</div>;
  if (!session || session.user?.role !== 'admin') return <div>Access Denied</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/quran/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surah: parseInt(formData.surah),
          ayah: parseInt(formData.ayah),
          arabic: formData.arabic,
          translation: formData.translation,
        }),
      });

      if (response.ok) {
        router.push('/admin/quran');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update verse');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Ayat</h1>
        <Link href="/admin/quran" className="text-emerald-600 hover:underline">
          ← Kembali
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Surah *</label>
            <input
              type="number"
              name="surah"
              value={formData.surah}
              onChange={handleChange}
              required
              min="1"
              max="114"
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ayat *</label>
            <input
              type="number"
              name="ayah"
              value={formData.ayah}
              onChange={handleChange}
              required
              min="1"
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Teks Arab *</label>
          <textarea
            name="arabic"
            value={formData.arabic}
            onChange={handleChange}
            required
            rows={3}
            className="w-full border rounded-md px-3 py-2 font-arabic"
            dir="rtl"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Terjemahan *</label>
          <textarea
            name="translation"
            value={formData.translation}
            onChange={handleChange}
            required
            rows={3}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Update'}
          </button>
          <Link
            href="/admin/quran"
            className="bg-muted text-foreground px-4 py-2 rounded-md hover:bg-muted/70"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}