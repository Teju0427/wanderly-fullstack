import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useToast } from './ToastContext';
import { api } from '../lib/api';

const WishlistContext = createContext(null);
const STORAGE_KEY = 'wanderly:wishlist';

function readStored() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Wishlist is stored in Azure SQL (per anonymous visitor) and mirrored to
 * localStorage so it renders instantly and still works if the API is down.
 */
export function WishlistProvider({ children }) {
  const [ids, setIds] = useState(readStored);
  const idsRef = useRef(ids);
  const onlineRef = useRef(false);
  const { showToast } = useToast();

  useEffect(() => {
    idsRef.current = ids;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // storage unavailable
    }
  }, [ids]);

  // Load from the server once; push up anything saved locally before the backend existed.
  useEffect(() => {
    let cancelled = false;
    api('/wishlist')
      .then(async ({ items }) => {
        if (cancelled) return;
        onlineRef.current = true;
        const serverIds = items.map((i) => i.itemId);
        const localOnly = idsRef.current.filter((id) => !serverIds.includes(id));
        await Promise.allSettled(localOnly.map((itemId) => api('/wishlist', { method: 'POST', body: { itemId } })));
        if (!cancelled) setIds([...serverIds, ...localOnly]);
      })
      .catch(() => {
        onlineRef.current = false; // offline mode: localStorage only
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const isWishlisted = (id) => ids.includes(id);

  const toggleWishlist = (id, label) => {
    const exists = idsRef.current.includes(id);
    setIds((prev) => (exists ? prev.filter((x) => x !== id) : prev.includes(id) ? prev : [...prev, id]));
    showToast(exists ? `Removed ${label ?? 'item'} from wishlist` : `Saved ${label ?? 'item'} to wishlist`);

    if (!onlineRef.current) return;
    const request = exists
      ? api(`/wishlist/${encodeURIComponent(id)}`, { method: 'DELETE' })
      : api('/wishlist', { method: 'POST', body: { itemId: id } });
    request.catch(() => showToast('Saved on this device — we’ll sync when the server is back'));
  };

  return (
    <WishlistContext.Provider value={{ ids, isWishlisted, toggleWishlist, count: ids.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
