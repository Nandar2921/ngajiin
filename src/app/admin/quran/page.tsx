'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Verse {
  id: number;
  surah: number;
  ayah: number;
  arabic: string;
  translation: string;
}

export default function AdminQuranPage() {
  const { data: session, status } = useSession();
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVerses = async () => {
    try {
      const response = await fetch('/api/admin/quran');
      const data = await response.json();
      setVerses(data);
    } catch (error) {
      console.error('Error fetching verses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchVerses();
    }
  }, [session]);

  const handleDelete = async (id: number, surah: number, ayah: number) => {
    if (!confirm(`Hapus QS. ${surah}:${ayah}?`)) return;

    try {
      const response = await fetch(`/api/admin/quran/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Ayat berhasil dihapus');
        fetchVerses(); // Refresh list
      } else {
        alert('Gagal menghapus ayat');
      }
    } catch (error) {
      console.error('Error deleting verse:', error);
      alert('Terjadi kesalahan');
    }
  };

  if (status === 'loading' || loading) return <div>Loading...</div>;
  if (!session || session.user?.role !== 'admin') return <div>Access Denied</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Quran</h1>
        <Link href="/admin/quran/new" className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700">
          + Tambah Ayat
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-muted">
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Surah</th>
              <th className="px-4 py-2 border">Ayat</th>
              <th className="px-4 py-2 border">Terjemahan</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {verses.map((verse) => (
              <tr key={verse.id}>
                <td className="px-4 py-2 border text-center">{verse.id}</td>
                <td className="px-4 py-2 border text-center">{verse.surah}</td>
                <td className="px-4 py-2 border text-center">{verse.ayah}</td>
                <td className="px-4 py-2 border">{verse.translation.substring(0, 50)}...</td>
                <td className="px-4 py-2 border text-center">
                  <Link
                    href={`/admin/quran/${verse.id}/edit`}
                    className="text-blue-600 hover:underline mr-3"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(verse.id, verse.surah, verse.ayah)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}