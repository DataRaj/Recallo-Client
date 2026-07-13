'use client';

/**
 * GifPicker — Tenor GIF search + trending picker.
 * Shows a masonry-style grid of GIF previews.
 * Calls onSelect with the full GIF URL to embed in a message.
 */

import type { GifResult } from '@/services/chat-service';
import { Loader2, Search, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounced-value';
import { getTrendingGifs, searchGifs } from '@/services/chat-service';

type GifPickerProps = {
  onSelect: (gif: GifResult) => void;
  onClose: () => void;
};

export function GifPicker({ onSelect, onClose }: GifPickerProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 350);
  const [gifs, setGifs] = useState<GifResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const results = q.trim() ? await searchGifs(q.trim()) : await getTrendingGifs();
      setGifs(results);
    } catch {
      setError('Failed to load GIFs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(debouncedQuery);
  }, [debouncedQuery, load]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      ref={containerRef}
      className="absolute bottom-full left-0 mb-2 flex w-80 flex-col overflow-hidden rounded-2xl shadow-2xl"
      style={{
        background: '#1C2A2C',
        border: '1px solid rgba(255,255,255,0.08)',
        maxHeight: '360px',
        zIndex: 50,
      }}
    >
      {/* Header */}
      <div
        className="flex shrink-0 items-center justify-between px-3 py-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <span className="text-[12px] font-semibold" style={{ color: 'var(--color-chat-text)' }}>GIFs</span>
        <button
          onClick={onClose}
          className="rounded-[6px] p-1 transition-colors hover:bg-white/10"
          style={{ color: 'rgba(251,245,221,0.45)' }}
          aria-label="Close GIF picker"
        >
          <X size={13} />
        </button>
      </div>

      {/* Search */}
      <div className="shrink-0 p-2">
        <div className="flex items-center gap-2 rounded-[8px] px-2.5 py-1.5" style={{ background: 'var(--color-chat-bg)' }}>
          <Search size={12} style={{ color: 'rgba(251,245,221,0.4)' }} />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search GIFs…"
            className="flex-1 bg-transparent text-[12px] placeholder:opacity-40 focus:outline-none"
            style={{ color: 'var(--color-chat-text)' }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ color: 'rgba(251,245,221,0.4)' }}>
              <X size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {loading && (
          <div className="flex h-24 items-center justify-center">
            <Loader2 size={20} className="animate-spin" style={{ color: 'var(--color-chat-accent)' }} />
          </div>
        )}
        {!loading && error && (
          <p className="py-4 text-center text-[11px]" style={{ color: 'rgba(251,245,221,0.35)' }}>{error}</p>
        )}
        {!loading && !error && gifs.length === 0 && (
          <p className="py-4 text-center text-[11px]" style={{ color: 'rgba(251,245,221,0.35)' }}>
            {query ? 'No results' : 'Trending GIFs'}
          </p>
        )}
        {!loading && !error && gifs.length > 0 && (
          <div className="columns-2 gap-1.5">
            {gifs.map(gif => (
              <button
                key={gif.id}
                onClick={() => onSelect(gif)}
                className="mb-1.5 block w-full overflow-hidden rounded-[8px] transition-opacity hover:opacity-80 focus:ring-1 focus:ring-[var(--color-chat-accent)] focus:outline-none"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={gif.previewUrl}
                  alt={gif.title}
                  loading="lazy"
                  className="h-auto w-full object-cover"
                  style={{ maxHeight: '120px' }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Powered by Tenor */}
      <div
        className="flex shrink-0 items-center justify-center py-1.5"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(251,245,221,0.2)' }}>Powered by Tenor</span>
      </div>
    </div>
  );
}
