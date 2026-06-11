'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Tafsir {
  id: number;
  verseId: number;
  source: string;
  content: string;
  createdAt: string;
  surah?: number;
  ayah?: number;
  translation?: string;
}

interface Verse {
  id: number;
  surah: number;
  ayah: number;
  translation: string;
}

export default function AdminTafsirPage() {
  const { data: session, status } = useSession();
  const [tafsirList, setTafsirList] = useState<Tafsir[]>([]);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list');
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    verseId: '',
    source: 'Ibnu Katsir',
    content: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      const [tafsirRes, versesRes] = await Promise.all([
        fetch('/api/admin/tafsir'),
        fetch('/api/quran/verses?limit=100')
      ]);
      const tafsirData = await tafsirRes.json();
      const versesData = await versesRes.json();
      setTafsirList(Array.isArray(tafsirData) ? tafsirData : []);
      setVerses(Array.isArray(versesData) ? versesData : []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const url = editingId 
        ? `/api/admin/tafsir/${editingId}` 
        : '/api/admin/tafsir';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage(editingId ? '✅ Tafsir berhasil diupdate!' : '✅ Tafsir berhasil ditambahkan!');
        setEditingId(null);
        setFormData({ verseId: '', source: 'Ibnu Katsir', content: '' });
        fetchData();
        setActiveTab('list');
      } else {
        const error = await res.json();
        setMessage(`❌ Gagal: ${error.error}`);
      }
    } catch (error) {
      setMessage('❌ Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (tafsir: Tafsir) => {
    setEditingId(tafsir.id);
    setFormData({
      verseId: tafsir.verseId.toString(),
      source: tafsir.source,
      content: tafsir.content,
    });
    setActiveTab('add');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus tafsir ini?')) return;

    try {
      const res = await fetch(`/api/admin/tafsir/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage('✅ Tafsir berhasil dihapus!');
        fetchData();
      } else {
        setMessage('❌ Gagal menghapus');
      }
    } catch (error) {
      setMessage('❌ Terjadi kesalahan');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ verseId: '', source: 'Ibnu Katsir', content: '' });
    setActiveTab('list');
  };

  if (status === 'loading' || loading) return <div className="p-6">Loading...</div>;
  if (session?.user?.role !== 'admin') return <div className="p-6 text-red-600">Access Denied</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📚 Manajemen Tafsir</h1>
        <Link href="/admin" className="text-emerald-600 hover:underline">
          ← Kembali ke Dashboard
        </Link>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b mb-6 flex-wrap">
        <button
          onClick={() => { setActiveTab('list'); cancelEdit(); }}
          className={`px-4 py-2 ${activeTab === 'list' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-500'}`}
        >
          📋 Daftar Tafsir ({tafsirList.length})
        </button>
        <button
          onClick={() => { setActiveTab('add'); setEditingId(null); }}
          className={`px-4 py-2 ${activeTab === 'add' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-500'}`}
        >
          {editingId ? '✏️ Edit Tafsir' : '➕ Tambah Tafsir'}
        </button>
        <button
          onClick={() => setActiveTab('sources')}
          className={`px-4 py-2 ${activeTab === 'sources' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-500'}`}
        >
          📖 Sumber Tafsir
        </button>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
          {message}
        </div>
      )}

      {/* Tab List Tafsir */}
      {activeTab === 'list' && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 border">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">QS</th>
                <th className="px-4 py-2 border">Sumber</th>
                <th className="px-4 py-2 border">Tafsir</th>
                <th className="px-4 py-2 border">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {tafsirList.map((tafsir) => (
                <tr key={tafsir.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-2 border text-center">{tafsir.id}</td>
                  <td className="px-4 py-2 border text-center">
                    {tafsir.surah}:{tafsir.ayah}
                  </td>
                  <td className="px-4 py-2 border">{tafsir.source}</td>
                  <td className="px-4 py-2 border max-w-md">
                    {tafsir.content.substring(0, 100)}...
                  </td>
                  <td className="px-4 py-2 border text-center whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(tafsir)}
                      className="text-blue-600 hover:underline mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(tafsir.id)}
                      className="text-red-600 hover:underline"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tafsirList.length === 0 && (
            <div className="text-center py-8 text-gray-500">Belum ada data tafsir</div>
          )}
        </div>
      )}

      {/* Tab Tambah/Edit Tafsir */}
      {activeTab === 'add' && (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
          {editingId && (
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              ✏️ Sedang mengedit tafsir ID: {editingId}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Pilih Ayat</label>
            <select
              value={formData.verseId}
              onChange={(e) => setFormData({ ...formData, verseId: e.target.value })}
              required
              className="w-full p-2 border rounded dark:bg-gray-800"
            >
              <option value="">Pilih Ayat</option>
              {verses.map((verse) => (
                <option key={verse.id} value={verse.id}>
                  QS. {verse.surah}:{verse.ayah} - {verse.translation.substring(0, 50)}...
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sumber Tafsir</label>
            <select
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className="w-full p-2 border rounded dark:bg-gray-800"
            >
              <option value="Ibnu Katsir">Ibnu Katsir</option>
              <option value="Al-Jalalain">Al-Jalalain</option>
              <option value="Al-Muyassar">Al-Muyassar</option>
              <option value="Tafsir Kemenag">Tafsir Kemenag</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Isi Tafsir</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={6}
              className="w-full p-2 border rounded dark:bg-gray-800"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : (editingId ? 'Update Tafsir' : 'Simpan Tafsir')}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Batal
              </button>
            )}
          </div>
        </form>
      )}

      {/* Tab Sumber Tafsir */}
      {activeTab === 'sources' && (
        <div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">📖 Sumber Tafsir Tersedia:</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                <span>Ibnu Katsir - Tersedia</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-600">⏳</span>
                <span>Al-Jalalain - Bisa ditambahkan</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-600">⏳</span>
                <span>Al-Muyassar - Bisa ditambahkan</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-600">⏳</span>
                <span>Tafsir Ringkas Kemenag - Bisa ditambahkan</span>
              </li>
            </ul>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 Tips: Untuk menambah tafsir, gunakan form "Tambah Tafsir" di tab sebelumnya.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}