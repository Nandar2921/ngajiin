'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Hadith {
  id: number;
  number: number;
  arabic: string;
  translation: string;
  narrator: string;
  grade: string;
  reference: string;
  book_name: string;
  book_id: number;
}

interface Book {
  id: number;
  name: string;
  name_indonesian: string;
  total_hadith: number;
}

export default function AdminHadithPage() {
  const { data: session, status } = useSession();
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list');
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    bookId: '',
    number: '',
    arabic: '',
    translation: '',
    narrator: '',
    grade: 'Shahih',
    reference: '',
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      const [hadithRes, booksRes] = await Promise.all([
        fetch('/api/hadith'),
        fetch('/api/hadith/books')
      ]);
      const hadithData = await hadithRes.json();
      const booksData = await booksRes.json();
      setHadiths(Array.isArray(hadithData) ? hadithData : []);
      setBooks(Array.isArray(booksData) ? booksData : []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setMessage('');

    try {
      const url = editingId 
        ? `/api/admin/hadith/${editingId}` 
        : '/api/admin/hadith';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage(editingId ? '✅ Hadits berhasil diupdate!' : '✅ Hadits berhasil ditambahkan!');
        setEditingId(null);
        setFormData({
          bookId: '',
          number: '',
          arabic: '',
          translation: '',
          narrator: '',
          grade: 'Shahih',
          reference: '',
        });
        fetchData();
        setActiveTab('list');
      } else {
        const error = await res.json();
        setMessage(`❌ Gagal: ${error.error}`);
      }
    } catch (error) {
      setMessage('❌ Terjadi kesalahan');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (hadith: Hadith) => {
    setEditingId(hadith.id);
    setFormData({
      bookId: hadith.book_id.toString(),
      number: hadith.number.toString(),
      arabic: hadith.arabic,
      translation: hadith.translation,
      narrator: hadith.narrator || '',
      grade: hadith.grade || 'Shahih',
      reference: hadith.reference || '',
    });
    setActiveTab('add');
  };

  const handleDelete = async (id: number, number: number) => {
    if (!confirm(`Hapus hadits ke-${number}?`)) return;

    try {
      const res = await fetch(`/api/admin/hadith/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage('✅ Hadits berhasil dihapus!');
        fetchData();
      } else {
        setMessage('❌ Gagal menghapus');
      }
    } catch (error) {
      setMessage('❌ Terjadi kesalahan');
    }
  };

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage('');

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string);
        const res = await fetch('/api/admin/hadith/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hadiths: jsonData, bookId: formData.bookId || 1 }),
        });

        if (res.ok) {
          const data = await res.json();
          setMessage(`✅ Import berhasil! ${data.imported} hadits ditambahkan.`);
          fetchData();
        } else {
          setMessage('❌ Gagal import JSON');
        }
      } catch (error) {
        setMessage('❌ File JSON tidak valid');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsText(file);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      bookId: '',
      number: '',
      arabic: '',
      translation: '',
      narrator: '',
      grade: 'Shahih',
      reference: '',
    });
    setActiveTab('list');
  };

  if (status === 'loading' || loading) return <div className="p-6">Loading...</div>;
  if (session?.user?.role !== 'admin') return <div className="p-6 text-red-600">Access Denied</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📜 Manajemen Hadits</h1>
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
          📋 Daftar Hadits ({hadiths.length})
        </button>
        <button
          onClick={() => { setActiveTab('add'); setEditingId(null); }}
          className={`px-4 py-2 ${activeTab === 'add' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-500'}`}
        >
          {editingId ? '✏️ Edit Hadits' : '➕ Tambah Hadits'}
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`px-4 py-2 ${activeTab === 'import' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-500'}`}
        >
          📤 Import JSON
        </button>
        <button
          onClick={() => setActiveTab('books')}
          className={`px-4 py-2 ${activeTab === 'books' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-500'}`}
        >
          📚 Kitab Hadits
        </button>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
          {message}
        </div>
      )}

      {/* Tab List Hadits */}
      {activeTab === 'list' && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 border">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 border">No</th>
                <th className="px-4 py-2 border">Hadits</th>
                <th className="px-4 py-2 border">Terjemahan</th>
                <th className="px-4 py-2 border">Perawi</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {hadiths.map((hadith) => (
                <tr key={hadith.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-2 border text-center">{hadith.number}</td>
                  <td className="px-4 py-2 border max-w-md">
                    <div className="text-right font-arabic">{hadith.arabic.substring(0, 80)}...</div>
                  </td>
                  <td className="px-4 py-2 border max-w-md">{hadith.translation.substring(0, 60)}...</td>
                  <td className="px-4 py-2 border">{hadith.narrator}</td>
                  <td className="px-4 py-2 border">
                    <span className={`px-2 py-1 rounded text-xs text-white ${
                      hadith.grade === 'Shahih' ? 'bg-green-600' : 
                      hadith.grade === 'Hasan' ? 'bg-blue-600' : 'bg-yellow-600'
                    }`}>
                      {hadith.grade}
                    </span>
                  </td>
                  <td className="px-4 py-2 border text-center whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(hadith)}
                      className="text-blue-600 hover:underline mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(hadith.id, hadith.number)}
                      className="text-red-600 hover:underline"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {hadiths.length === 0 && (
            <div className="text-center py-8 text-gray-500">Belum ada data hadits</div>
          )}
        </div>
      )}

      {/* Tab Tambah/Edit Hadits */}
      {activeTab === 'add' && (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
          {editingId && (
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              ✏️ Sedang mengedit hadits ID: {editingId}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Kitab</label>
              <select
                value={formData.bookId}
                onChange={(e) => setFormData({ ...formData, bookId: e.target.value })}
                required
                className="w-full p-2 border rounded dark:bg-gray-800"
              >
                <option value="">Pilih Kitab</option>
                {books.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.name_indonesian}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nomor Hadits</label>
              <input
                type="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                required
                className="w-full p-2 border rounded dark:bg-gray-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Teks Arab</label>
            <textarea
              value={formData.arabic}
              onChange={(e) => setFormData({ ...formData, arabic: e.target.value })}
              required
              rows={3}
              className="w-full p-2 border rounded font-arabic dark:bg-gray-800"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Terjemahan</label>
            <textarea
              value={formData.translation}
              onChange={(e) => setFormData({ ...formData, translation: e.target.value })}
              required
              rows={3}
              className="w-full p-2 border rounded dark:bg-gray-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Perawi</label>
              <input
                type="text"
                value={formData.narrator}
                onChange={(e) => setFormData({ ...formData, narrator: e.target.value })}
                className="w-full p-2 border rounded dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full p-2 border rounded dark:bg-gray-800"
              >
                <option value="Shahih">Shahih</option>
                <option value="Hasan">Hasan</option>
                <option value="Dhaif">Dhaif</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Referensi</label>
            <input
              type="text"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              className="w-full p-2 border rounded dark:bg-gray-800"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={uploading}
              className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 disabled:opacity-50"
            >
              {uploading ? 'Menyimpan...' : (editingId ? 'Update Hadits' : 'Simpan Hadits')}
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

      {/* Tab Import JSON */}
      {activeTab === 'import' && (
        <div className="space-y-4 max-w-2xl">
          <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">📌 Format JSON yang didukung:</h3>
            <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
{`[
  {
    "number": 1,
    "arabic": "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ",
    "translation": "Sesungguhnya amal itu tergantung pada niatnya",
    "narrator": "Umar bin Khattab",
    "grade": "Shahih",
    "reference": "HR. Bukhari No. 1"
  }
]`}
            </pre>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Pilih Kitab</label>
            <select
              value={formData.bookId}
              onChange={(e) => setFormData({ ...formData, bookId: e.target.value })}
              className="w-full p-2 border rounded dark:bg-gray-800"
            >
              <option value="">Pilih Kitab</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.name_indonesian}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Upload File JSON</label>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              disabled={uploading}
              className="w-full p-2 border rounded dark:bg-gray-800"
            />
          </div>
        </div>
      )}

      {/* Tab Kitab Hadits */}
      {activeTab === 'books' && (
        <div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">📖 Sumber Data Hadits:</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>Shahih Bukhari - 7.563 hadits</li>
              <li>Shahih Muslim - 9.200 hadits</li>
              <li>Sunan Abu Daud - 5.274 hadits</li>
              <li>Sunan Tirmidzi - 3.956 hadits</li>
              <li>Sunan Nasai - 5.761 hadits</li>
              <li>Sunan Ibnu Majah - 4.341 hadits</li>
              <li>Hadits Arbain An-Nawawi - 42 hadits</li>
            </ul>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 border">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 border">ID</th>
                  <th className="px-4 py-2 border">Nama Kitab</th>
                  <th className="px-4 py-2 border">Nama Arab</th>
                  <th className="px-4 py-2 border">Total Hadits</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.id}>
                    <td className="px-4 py-2 border text-center">{book.id}</td>
                    <td className="px-4 py-2 border">{book.name_indonesian}</td>
                    <td className="px-4 py-2 border font-arabic">{book.name}</td>
                    <td className="px-4 py-2 border text-center">{book.total_hadith}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}