'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  Search, 
  Filter, 
  BookOpen, 
  FileText, 
  MessageCircle, 
  Sparkles,
  Clock,
  TrendingUp,
  AlertCircle,
  Share2,
  Copy,
  Check
} from 'lucide-react';

interface UnifiedResult {
  id: number;
  type: 'quran' | 'hadith' | 'tafsir';
  category: string;
  surah?: number;
  ayah?: number;
  arabic?: string;
  translation: string;
  narrator?: string;
  source?: string;
  content?: string;
  reference: string;
  similarity?: number;
}

interface UnifiedSearchResponse {
  keyword: string;
  total: number;
  results: UnifiedResult[];
  counts: {
    quran: number;
    hadith: number;
    tafsir: number;
  };
  expandedQueries?: string[];
  semanticUsed?: boolean;
}

const SearchSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="p-5 border border-white/10 rounded-xl animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 bg-gray-800 rounded"></div>
          <div className="w-20 h-4 bg-gray-800 rounded"></div>
          <div className="w-32 h-3 bg-gray-800 rounded"></div>
        </div>
        <div className="w-full h-4 bg-gray-800 rounded mb-2"></div>
        <div className="w-3/4 h-4 bg-gray-800 rounded"></div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ query, t }: { query: string; t: any }) => (
  <div className="text-center py-16">
    <div className="text-6xl mb-4">🔍</div>
    <h3 className="text-xl font-semibold text-white mb-2">{t('search.noResults')}</h3>
    <p className="text-gray-500">{t('search.searchFor')} "{query}"</p>
    <p className="text-sm text-gray-600 mt-2">{t('search.tryAgain')}</p>
  </div>
);

const RecentSearches = ({ searches, onSelect, t }: { searches: string[]; onSelect: (q: string) => void; t: any }) => {
  if (searches.length === 0) return null;
  
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-400">{t('search.recent')}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {searches.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(item)}
            className="px-3 py-1.5 bg-gray-800/50 rounded-full text-sm text-gray-300 hover:bg-gray-800 transition"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
};

export default function SearchContent() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get('q');
  
  const [unifiedData, setUnifiedData] = useState<UnifiedSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [useSemantic, setUseSemantic] = useState(true);
  const [searchInput, setSearchInput] = useState(q || '');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'latest'>('relevance');
  
  const inputRef = useRef<HTMLInputElement>(null);

  const saveSearchHistory = useCallback(async (keyword: string) => {
    if (!session || !keyword || keyword.trim().length < 2) return;
    try {
      await fetch('/api/search-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keyword.trim() }),
      });
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }, [session]);

  useEffect(() => {
    const saved = localStorage.getItem('recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      } catch (e) {}
    }
  }, []);

  const saveRecentSearch = useCallback((keyword: string) => {
    if (!keyword || keyword.length < 2) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s !== keyword);
      const newSearches = [keyword, ...filtered].slice(0, 5);
      localStorage.setItem('recent_searches', JSON.stringify(newSearches));
      return newSearches;
    });
  }, []);

  const highlightText = (text: string, keyword: string) => {
    if (!keyword || keyword.length < 2 || !text) return text;
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedKeyword})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-600/70 text-white font-semibold rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const copyToClipboard = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  useEffect(() => {
    if (!q || q.length < 2) {
      setUnifiedData(null);
      setLoading(false);
      return;
    }
    
    saveRecentSearch(q);
    saveSearchHistory(q);
    
    setLoading(true);
    setError(null);
    
    const params = new URLSearchParams();
    params.set('q', q);
    params.set('semantic', useSemantic.toString());
    params.set('limit', '50');
    
    fetch(`/api/search/unified?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setUnifiedData(data);
      })
      .catch((err) => {
        console.error('Search error:', err);
        setError(err.message || t('search.error'));
      })
      .finally(() => setLoading(false));
  }, [q, useSemantic, saveRecentSearch, saveSearchHistory, t]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput)}`);
    }
  };

  const handleRecentSelect = (keyword: string) => {
    setSearchInput(keyword);
    router.push(`/search?q=${encodeURIComponent(keyword)}`);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quran': return <BookOpen className="w-5 h-5 text-emerald-500" />;
      case 'hadith': return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'tafsir': return <FileText className="w-5 h-5 text-purple-500" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'quran': return 'border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-950/20';
      case 'hadith': return 'border-blue-500/30 hover:border-blue-500/60 bg-blue-950/20';
      case 'tafsir': return 'border-purple-500/30 hover:border-purple-500/60 bg-purple-950/20';
      default: return 'border-gray-500/30 hover:border-gray-500/60 bg-gray-950/20';
    }
  };

  if (!q || q.length < 2) {
    return (
      <div className="min-h-screen bg-[#0b1120]">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/10 rounded-2xl mb-4">
              <Search className="w-10 h-10 text-emerald-500" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">{t('search.title')}</h1>
            <p className="text-gray-500">{t('search.subtitle')}</p>
          </div>
          
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t('search.placeholder')}
                className="w-full px-6 py-4 pr-24 text-lg border border-gray-800 rounded-2xl bg-gray-900/50 text-white focus:border-emerald-500 focus:outline-none transition"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl transition flex items-center gap-2"
              >
                <Search className="w-4 h-4" /> {t('common.search')}
              </button>
            </div>
          </form>

          <RecentSearches searches={recentSearches} onSelect={handleRecentSelect} t={t} />

          <div className="mt-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-400">{t('search.popular')}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['niat', 'qurban', 'riba', 'shalat', 'puasa', 'zakat', 'haji', 'sabar', 'syukur', 'tawakkal'].map((topic) => (
                <button
                  key={topic}
                  onClick={() => handleRecentSelect(topic)}
                  className="px-3 py-1.5 bg-gray-800/50 rounded-full text-sm text-gray-300 hover:bg-gray-800 transition"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <SearchSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{t('search.error')}: {error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition">
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  if (!unifiedData || unifiedData.total === 0) {
    return <EmptyState query={q} t={t} />;
  }

  let results = [...unifiedData.results];
  if (sortBy === 'latest') {
    results = results.reverse();
  }

  const filteredResults = activeTab === 'all' 
    ? results 
    : results.filter(r => r.type === activeTab);

  return (
    <div className="min-h-screen bg-[#0b1120]">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Link href="/" className="text-emerald-500 hover:text-emerald-400 text-sm inline-flex items-center gap-1 mb-4 transition">
            ← {t('nav.home')}
          </Link>
          
          <form onSubmit={handleSearch} className="relative mb-4">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full px-5 py-3 pr-24 text-base border border-gray-800 rounded-xl bg-gray-900/50 text-white focus:border-emerald-500 focus:outline-none transition"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 transform -translate-y-1/2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg transition text-sm flex items-center gap-1"
            >
              <Search className="w-4 h-4" /> {t('common.search')}
            </button>
          </form>
          
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-white">
                {t('search.resultsFor')}: <span className="text-emerald-500">"{q}"</span>
              </h1>
              <p className="text-sm text-gray-500">
                {t('search.found')} {unifiedData.total} {t('search.results')}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'relevance' | 'latest')}
                className="px-3 py-1.5 text-sm border border-gray-800 rounded-lg bg-gray-900 text-gray-300 focus:border-emerald-500 focus:outline-none"
              >
                <option value="relevance">{t('search.sortRelevance')}</option>
                <option value="latest">{t('search.sortLatest')}</option>
              </select>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg border transition ${showFilters ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-800 hover:bg-gray-800'}`}
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 p-2 bg-gray-900/50 rounded-xl border border-gray-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-gray-400">{t('search.mode')}:</span>
            <button
              onClick={() => setUseSemantic(false)}
              className={`px-3 py-1 text-sm rounded-full transition ${!useSemantic ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              📖 {t('search.modeExact')}
            </button>
            <button
              onClick={() => setUseSemantic(true)}
              className={`px-3 py-1 text-sm rounded-full transition ${useSemantic ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              🧠 {t('search.modeSemantic')}
            </button>
          </div>
          <div className="text-xs text-gray-500">
            {useSemantic ? t('search.modeSemanticDesc') : t('search.modeExactDesc')}
          </div>
        </div>

        {useSemantic && unifiedData.expandedQueries && unifiedData.expandedQueries.length > 1 && (
          <div className="mb-4 p-2 bg-purple-950/30 rounded-lg border border-purple-800">
            <p className="text-xs text-purple-400">
              🔍 {t('search.expanded')}: {unifiedData.expandedQueries.join(', ')}
            </p>
          </div>
        )}

        <div className="flex gap-1 border-b border-gray-800 mb-6 overflow-x-auto">
          {[
            { key: 'all', label: t('search.all'), count: unifiedData.total, icon: '📋' },
            { key: 'quran', label: t('search.quran'), count: unifiedData.counts.quran, icon: '📖' },
            { key: 'hadith', label: t('search.hadith'), count: unifiedData.counts.hadith, icon: '📜' },
            { key: 'tafsir', label: t('search.tafsir'), count: unifiedData.counts.tafsir, icon: '📚' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium transition whitespace-nowrap ${activeTab === tab.key ? 'border-b-2 border-emerald-500 text-emerald-500' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {tab.icon} {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredResults.map((result, idx) => {
            let href = '';
            if (result.type === 'quran') href = `/quran/${result.surah}/${result.ayah}`;
            else if (result.type === 'hadith') href = `/hadith/${result.id}`;
            else href = `/tafsir/${result.id}`;
            
            let displayText = result.type === 'tafsir' ? result.content || '' : result.translation || '';
            let similarity = result.similarity ? Math.round(result.similarity * 100) : null;
            
            return (
              <div key={idx} className="group relative">
                <Link href={href}>
                  <div className={`p-5 border-l-4 rounded-xl transition-all hover:shadow-lg bg-gray-900/30 border ${getTypeColor(result.type)}`}>
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(result.type)}
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">{result.category}</span>
                        <span className="text-xs text-gray-600">{result.reference}</span>
                      </div>
                      {similarity && (
                        <span className="text-xs text-emerald-500 bg-emerald-950/50 px-2 py-0.5 rounded-full">
                          {similarity}% {t('search.relevant')}
                        </span>
                      )}
                    </div>
                    
                    {result.arabic && (
                      <div className="text-right text-base font-arabic mb-2 text-gray-400">
                        {result.arabic.length > 120 ? result.arabic.substring(0, 120) + '...' : result.arabic}
                      </div>
                    )}
                    
                    <div className="text-gray-300 leading-relaxed text-sm">
                      {highlightText(displayText, q)}
                    </div>
                    
                    {result.narrator && (
                      <div className="text-xs text-gray-600 mt-2">{t('hadith.narrator')}: {result.narrator}</div>
                    )}
                    
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-emerald-500 font-medium">{t('common.readMore')} →</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={(e) => { e.preventDefault(); copyToClipboard(displayText, result.id); }}
                          className="p-1.5 rounded-lg hover:bg-gray-800 transition"
                          title={t('common.copy')}
                        >
                          {copiedId === result.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            if (navigator.share) {
                              navigator.share({
                                title: `SiKAJI - ${result.reference}`,
                                text: displayText.substring(0, 200),
                                url: window.location.href,
                              });
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-gray-800 transition"
                          title={t('common.share')}
                        >
                          <Share2 className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {filteredResults.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            {t('search.noResultsInCategory')} "<span className="font-semibold">{q}</span>"
          </div>
        )}
      </div>
    </div>
  );
}