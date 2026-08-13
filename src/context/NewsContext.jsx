import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';

// import.meta.env.VITE_API_URL is empty by default (see .env.example) —
// both `vercel dev` locally and a real Vercel deployment serve the
// frontend and /api functions from the same origin, so a relative path
// works everywhere without configuration. It's only needed if the
// frontend is ever hosted separately from the API.
const API_BASE = import.meta.env.VITE_API_URL || '';
const API_URL = `${API_BASE}/api/notices`;

const POLL_INTERVAL_MS = 10000;

const NewsContext = createContext(null);

export function NewsProvider({ children }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Only show the full-page loading state on the very first fetch, not on
  // every background poll.
  const hasLoadedOnce = useRef(false);

  const fetchNews = useCallback(async () => {
    try {
      // Sorting is done server-side now (see api/notices.js) — JSON
      // Server's _sort/_order query params don't apply to our own API.
      const res = await axios.get(API_URL);
      setNews(res.data);
      setError(null);
    } catch (err) {
      setError('Could not reach the API. If running locally, make sure `npm run dev` (vercel dev) is running.');
    } finally {
      hasLoadedOnce.current = true;
      setLoading(false);
    }
  }, []);

  // Public submission — the server always forces status to "pending"
  // regardless of what's sent (see api/notices.js), so this doesn't need
  // to set it client-side.
  const submitNews = useCallback(async (entry) => {
    await axios.post(API_URL, entry);
    await fetchNews();
  }, [fetchNews]);

  // Shared by Approve/Reject — PATCH just the status field rather than
  // resending the whole record.
  const updateStatus = useCallback(async (id, status) => {
    await axios.patch(`${API_URL}/${id}`, { status });
    await fetchNews();
  }, [fetchNews]);

  const deleteNews = useCallback(async (id) => {
    // Optimistic: drop it from local state immediately, only a delete
    // has no server-generated fields we'd need to reconcile.
    setNews((prev) => prev.filter((n) => n.id !== id));
    try {
      await axios.delete(`${API_URL}/${id}`);
    } catch (err) {
      await fetchNews(); // restore if the server-side delete actually failed
      throw err;
    }
  }, [fetchNews]);

  useEffect(() => {
    fetchNews();
    const intervalId = setInterval(fetchNews, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [fetchNews]);

  const value = {
    news,
    loading: loading && !hasLoadedOnce.current,
    error,
    submitNews,
    updateStatus,
    deleteNews,
  };

  return <NewsContext.Provider value={value}>{children}</NewsContext.Provider>;
}

export function useNews() {
  const ctx = useContext(NewsContext);
  if (!ctx) {
    throw new Error('useNews must be used inside a NewsProvider');
  }
  return ctx;
}
