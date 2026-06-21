'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Upload,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Search
} from 'lucide-react';

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
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    verseId: '',
    source: 'Ibnu Katsir',
    content: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Import state
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; failed: number; errors: string[] } | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      const [tafsirRes, versesRes] = await Promise.all([
        fetch('/api/admin/tafsir'),
        fetch('/api/quran/verses?limit=500')
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
    setMessageType('info');

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
        setMessageType('success');
        setEditingId(null);
        setFormData({ verseId: '', source: 'Ibnu Katsir', content: '' });
        fetchData();
        setActiveTab('list');
      } else {
        const error = await res.json();
        setMessage(`❌ Gagal: ${error.error}`);
        setMessageType('error');
      }
    } catch (error) {
      setMessage('❌ Terjadi kesalahan');
      setMessageType('error');
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
        setMessageType('success');
        fetchData();
      } else {
        setMessage('❌ Gagal menghapus');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('❌ Terjadi kesalahan');
      setMessageType('error');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ verseId: '', source: 'Ibnu Katsir', content: '' });
    setActiveTab('list');
  };

  // Handle drag & drop for import
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0].type === 'application/json') {
      await handleImport(files[0]);
    } else {
      setMessage('❌ Harap upload file JSON');
      setMessageType('error');
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleImport(files[0]);
    }
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    setImportResult(null);
    setMessage('');
    
    const source = prompt('Masukkan sumber tafsir (contoh: Kemenag, Ibnu Katsir, Al-Jalalain):', 'Kemenag');
    if (!source) {
      setImporting(false);
      return;
    }

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);
      
      // Format data: bisa array langsung atau object dengan key 'data'
      let tafsirListData = Array.isArray(jsonData) ? jsonData : jsonData.data || [];
      
      // Validasi format
      if (!tafsirListData.length) {
        throw new Error('File JSON tidak memiliki data');
      }

      const res = await fetch('/api/admin/tafsir/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tafsirList: tafsirListData, source }),
      });
      
      const result = await res.json();
      
      if (res.ok) {
        setImportResult({ 
          imported: result.imported, 
          failed: result.failed,
          errors: result.errors || []
        });
        setMessage(`✅ Import selesai! ${result.imported} tafsir berhasil ditambahkan. ${result.failed > 0 ? `${result.failed} gagal.` : ''}`);
        setMessageType(result.failed > 0 ? 'info' : 'success');
        fetchData();
      } else {
        throw new Error(result.error || 'Import gagal');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'File JSON tidak valid';
      setMessage(`❌ Import gagal: ${errorMsg}`);
      setMessageType('error');
    } finally {
      setImporting(false);
    }
  };

  const filteredTafsir = tafsirList.filter(tafsir => {
    const search = searchTerm.toLowerCase();
    return (
      tafsir.source?.toLowerCase().includes(search) ||
      `${tafsir.surah}:${tafsir.ayah}`.includes(search) ||
      tafsir.content?.toLowerCase().includes(search)
    );
  });

  const paginatedTafsir = filteredTafsir.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredTafsir.length / itemsPerPage);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (session?.user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⛔</div>
          <h1 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h1>
          <p className="text-muted-foreground">Halaman ini hanya untuk administrator.</p>
          <Link href="/" className="mt-4 inline-block text-emerald-500 hover:text-emerald-400">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const sourcesList = [
    { name: 'Ibnu Katsir', available: true, count: tafsirList.filter(t => t.source === 'Ibnu Katsir').length },
    { name: 'Kemenag', available: true, count: tafsirList.filter(t => t.source === 'Kemenag').length },
    { name: 'Al-Jalalain', available: false, count: 0 },
    { name: 'Al-Muyassar', available: false, count: 0 },
    { name: 'Al-Misbah', available: false, count: 0 },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-emerald-500">📚 Manajemen Tafsir</h1>
            <p className="text-muted-foreground mt-1">Total: {tafsirList.length} tafsir</p>
          </div>
          <Link href="/admin" className="text-muted-foreground hover:text-foreground transition">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            messageType === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
            messageType === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-400' :
            'bg-blue-500/10 border border-blue-500/20 text-blue-400'
          }`}>
            {messageType === 'success' && <CheckCircle className="w-4 h-4" />}
            {messageType === 'error' && <AlertCircle className="w-4 h-4" />}
            {message}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-border mb-6 flex-wrap">
          <button
            onClick={() => { setActiveTab('list'); cancelEdit(); }}
            className={`px-4 py-2 transition ${activeTab === 'list' ? 'border-b-2 border-emerald-500 text-emerald-500' : 'text-muted-foreground hover:text-foreground/80'}`}
          >
            📋 Daftar Tafsir ({tafsirList.length})
          </button>
          <button
            onClick={() => { setActiveTab('add'); setEditingId(null); }}
            className={`px-4 py-2 transition ${activeTab === 'add' ? 'border-b-2 border-emerald-500 text-emerald-500' : 'text-muted-foreground hover:text-foreground/80'}`}
          >
            {editingId ? '✏️ Edit Tafsir' : '➕ Tambah Tafsir'}
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2 transition ${activeTab === 'import' ? 'border-b-2 border-emerald-500 text-emerald-500' : 'text-muted-foreground hover:text-foreground/80'}`}
          >
            📤 Import JSON
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={`px-4 py-2 transition ${activeTab === 'sources' ? 'border-b-2 border-emerald-500 text-emerald-500' : 'text-muted-foreground hover:text-foreground/80'}`}
          >
            📖 Sumber Tafsir
          </button>
        </div>

        {/* Tab List Tafsir */}
        {activeTab === 'list' && (
          <div>
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari tafsir (surah, sumber, isi)..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 pl-10 bg-muted border border-border rounded-lg focus:outline-none focus:border-emerald-500 text-foreground"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-card border border-border rounded-xl">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">QS</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Sumber</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Tafsir</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTafsir.map((tafsir) => (
                    <tr key={tafsir.id} className="border-b border-border/60 hover:bg-white/5">
                      <td className="px-4 py-3 text-sm">{tafsir.id}</td>
                      <td className="px-4 py-3 text-sm font-mono text-emerald-400">
                        {tafsir.surah}:{tafsir.ayah}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded-full text-xs">
                          {tafsir.source}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground max-w-md truncate">
                        {tafsir.content.substring(0, 100)}...
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(tafsir)}
                          className="text-blue-500 hover:text-blue-400 mr-3 transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tafsir.id)}
                          className="text-red-500 hover:text-red-400 transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-6">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-muted hover:bg-muted/70 disabled:opacity-50 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-muted-foreground">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-muted hover:bg-muted/70 disabled:opacity-50 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {tafsirList.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                Belum ada data tafsir. Import JSON untuk menambahkan.
              </div>
            )}
          </div>
        )}

        {/* Tab Tambah/Edit Tafsir */}
        {activeTab === 'add' && (
          <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
            {editingId && (
              <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
                ✏️ Sedang mengedit tafsir ID: {editingId}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Pilih Ayat</label>
              <select
                value={formData.verseId}
                onChange={(e) => setFormData({ ...formData, verseId: e.target.value })}
                required
                className="w-full p-2 bg-muted border border-border rounded-lg focus:outline-none focus:border-emerald-500 text-foreground"
              >
                <option value="">Pilih Ayat</option>
                {verses.map((verse) => (
                  <option key={verse.id} value={verse.id}>
                    QS. {verse.surah}:{verse.ayah} - {verse.translation.substring(0, 60)}...
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Sumber Tafsir</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full p-2 bg-muted border border-border rounded-lg focus:outline-none focus:border-emerald-500 text-foreground"
              >
                <option value="Ibnu Katsir">Ibnu Katsir</option>
                <option value="Kemenag">Tafsir Kemenag</option>
                <option value="Al-Jalalain">Al-Jalalain</option>
                <option value="Al-Muyassar">Al-Muyassar</option>
                <option value="Al-Misbah">Al-Misbah (Quraish Shihab)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Isi Tafsir</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                rows={8}
                className="w-full p-2 bg-muted border border-border rounded-lg focus:outline-none focus:border-emerald-500 text-foreground font-mono text-sm"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
              >
                {submitting ? 'Menyimpan...' : (editingId ? 'Update Tafsir' : 'Simpan Tafsir')}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-muted hover:bg-muted/70 text-foreground px-6 py-2 rounded-lg transition"
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        )}

        {/* Tab Import JSON */}
        {activeTab === 'import' && (
          <div>
            {/* Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition ${
                dragActive 
                  ? 'border-emerald-500 bg-emerald-500/10' 
                  : 'border-gray-600 hover:border-emerald-500/50'
              }`}
            >
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">
                Drag & drop file JSON di sini, atau klik untuk memilih file
              </p>
              <input
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg cursor-pointer transition"
              >
                Pilih File JSON
              </label>
             <p className="text-xs text-muted-foreground/60 mt-3">
  Format JSON: {'[{"surah": 1, "ayah": 1, "content": "tafsir..."}, ...]'}
</p>
            </div>

            {/* Import Progress */}
            {importing && (
              <div className="mt-4 text-center">
                <Loader2 className="w-6 h-6 text-emerald-500 animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Mengimpor tafsir...</p>
              </div>
            )}

            {/* Import Result */}
            {importResult && (
              <div className={`mt-4 p-4 rounded-lg ${
                importResult.failed > 0 
                  ? 'bg-yellow-500/10 border border-yellow-500/20' 
                  : 'bg-emerald-500/10 border border-emerald-500/20'
              }`}>
                <h3 className="font-semibold mb-2">📊 Hasil Import:</h3>
                <p>✅ Berhasil: {importResult.imported} tafsir</p>
                {importResult.failed > 0 && (
                  <>
                    <p>⚠️ Gagal: {importResult.failed} tafsir</p>
                    {importResult.errors.length > 0 && (
                      <details className="mt-2">
                        <summary className="text-sm cursor-pointer text-muted-foreground">Lihat detail error</summary>
                        <ul className="mt-2 text-xs text-red-400 space-y-1">
                          {importResult.errors.slice(0, 5).map((err, i) => (
                            <li key={i}>• {err}</li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab Sumber Tafsir */}
        {activeTab === 'sources' && (
          <div>
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-emerald-500 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" /> Sumber Tafsir
              </h3>
              <div className="space-y-3">
                {sourcesList.map((source, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-border/60">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${source.available ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`}></span>
                      <span className="font-medium">{source.name}</span>
                      {source.available && (
                        <span className="text-xs text-muted-foreground">({source.count} tafsir)</span>
                      )}
                    </div>
                    {source.available ? (
                      <span className="text-xs text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">Tersedia</span>
                    ) : (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">Belum tersedia</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-400">
                💡 Tips: Untuk menambah tafsir, gunakan form "Tambah Tafsir" atau import file JSON.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}