'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function TestBookmarkPage() {
  const { data: session, status } = useSession();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/bookmarks')
        .then(res => res.json())
        .then(data => setBookmarks(data))
        .catch(err => console.error(err));
    }
  }, [status]);

  const addBookmark = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verseId: 1 }),
      });
      const data = await res.json();
      console.log('Add result:', data);
      alert(JSON.stringify(data));
    } catch (err) {
      console.error(err);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') return <div>Loading session...</div>;
  if (!session) return <div>Not logged in. Please login first.</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Test Bookmark</h1>
      <p>Logged in as: {session.user?.email}</p>
      <p>User ID: {session.user?.id}</p>
      
      <button
        onClick={addBookmark}
        disabled={loading}
        className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded"
      >
        {loading ? 'Loading...' : 'Add Bookmark (Verse 1)'}
      </button>
      
      <h2 className="text-xl font-bold mt-6 mb-2">Current Bookmarks:</h2>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(bookmarks, null, 2)}
      </pre>
    </div>
  );
}