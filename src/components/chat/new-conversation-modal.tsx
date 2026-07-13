'use client';

import type { UserSearchResult } from '@/services/chat-service';
import { Loader2, MessageSquare, Search, User, X } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ROUTES } from '@/lib/routes';
import { createConversation, searchUsers } from '@/services/chat-service';

type NewConversationModalProps = {
  open: boolean;
  prefillUserId?: number;
  onClose: () => void;
};

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function userInitials(name: string): string {
  return name.split(' ').map(p => p[0] ?? '').join('').toUpperCase().slice(0, 2);
}

export function NewConversationModal({ open, prefillUserId, onClose }: NewConversationModalProps) {
  const router = useRouter();
  const locale = useLocale();

  const [query, setQuery] = useState(prefillUserId ? String(prefillUserId) : '');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<UserSearchResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (open) {
      setQuery(prefillUserId ? String(prefillUserId) : '');
      setResults([]);
      setSelected(null);
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, prefillUserId]);

  useEffect(() => {
    if (!debouncedQuery.trim() || selected) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setSearching(true);
    searchUsers(debouncedQuery).then((data) => {
      if (!cancelled) {
        setResults(data); setSearching(false);
      }
    }).catch(() => {
      if (!cancelled) {
        setSearching(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, selected]);

  const handleSelect = useCallback((user: UserSearchResult) => {
    setSelected(user);
    setQuery(user.name);
    setResults([]);
    setError(null);
  }, []);

  const handleStart = useCallback(async () => {
    const targetId = selected?.id ?? Number.parseInt(query.trim(), 10);
    if (!selected && (isNaN(targetId) || targetId <= 0)) {
      setError('Select a user or enter a valid numeric ID.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const convo = await createConversation(targetId);
      onClose();
      router.push(`/${locale}${ROUTES.CHAT_CONVERSATION(convo.id)}`);
    } catch (err: unknown) {
      const maybe = err as { response?: { data?: { message?: string } }; message?: string };
      setError(maybe?.response?.data?.message ?? maybe?.message ?? 'Failed to create conversation.');
    } finally {
      setBusy(false);
    }
  }, [selected, query, locale, router, onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const showDropdown = results.length > 0 && !selected;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
        style={{ background: '#1E2E30', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="flex size-8 items-center justify-center rounded-xl"
              style={{ background: 'rgba(156,197,161,0.15)' }}
            >
              <MessageSquare size={15} style={{ color: 'var(--color-chat-accent)' }} />
            </div>
            <h2 className="text-[15px] font-semibold" style={{ color: 'var(--color-chat-text)' }}>
              New Private Chat
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-[8px] p-1.5 transition-colors hover:bg-white/10"
            style={{ color: 'rgba(251,245,221,0.45)' }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="relative">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium" style={{ color: 'rgba(251,245,221,0.5)' }}>
              Search by name, email, or user ID
            </span>
            <div className="relative flex items-center">
              <Search size={13} className="absolute left-3 shrink-0" style={{ color: 'rgba(251,245,221,0.35)' }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value); setSelected(null); setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (results[0] && !selected) {
                      handleSelect(results[0]);
                    } else if (selected || query.trim()) {
                      void handleStart();
                    }
                  }
                }}
                placeholder="e.g. Alex Kim or 42"
                className="w-full rounded-[10px] border py-2.5 pr-3 pl-9 text-[13px] transition-all outline-none focus:ring-1"
                style={{
                  background: 'var(--color-chat-bg)',
                  borderColor: error ? 'var(--color-text-accent)' : 'rgba(255,255,255,0.08)',
                  color: 'var(--color-chat-text)',
                }}
              />
              {searching && (
                <Loader2 size={13} className="absolute right-3 animate-spin" style={{ color: 'rgba(251,245,221,0.4)' }} />
              )}
            </div>
          </label>

          {showDropdown && (
            <div
              className="absolute inset-x-0 top-full z-10 mt-1 overflow-hidden rounded-[12px] shadow-2xl"
              style={{ background: 'var(--color-chat-bg)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {results.map(user => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelect(user)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                >
                  <div
                    className="flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                    style={{ background: 'var(--color-chat-accent)' }}
                  >
                    {user.avatar
                      ? <img src={user.avatar} alt={user.name} className="size-8 rounded-full object-cover" />
                      : userInitials(user.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium" style={{ color: 'var(--color-chat-text)' }}>{user.name}</p>
                    <p className="truncate text-[11px]" style={{ color: 'rgba(251,245,221,0.45)' }}>{user.email}</p>
                  </div>
                  <span
                    className="ml-auto shrink-0 rounded-[8px] px-2.5 py-1 text-[11px] font-medium"
                    style={{ background: 'rgba(156,197,161,0.15)', color: '#9CC5A1' }}
                  >
                    Chat
                  </span>
                </button>
              ))}
            </div>
          )}

          {!showDropdown && !searching && debouncedQuery.trim() && !selected && results.length === 0 && (
            <div className="mt-2 flex items-center gap-2 text-[11px]" style={{ color: 'rgba(251,245,221,0.4)' }}>
              <User size={12} />
              No users found. You can still enter a numeric user ID to start a chat.
            </div>
          )}
        </div>

        {selected && (
          <div
            className="mt-3 flex items-center gap-2.5 rounded-[10px] px-3 py-2.5"
            style={{ background: 'rgba(156,197,161,0.08)', border: '1px solid rgba(156,197,161,0.2)' }}
          >
            <div
              className="flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
              style={{ background: 'var(--color-chat-accent)' }}
            >
              {userInitials(selected.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-medium" style={{ color: 'var(--color-chat-accent)' }}>{selected.name}</p>
              <p className="truncate text-[10px]" style={{ color: 'rgba(156,197,161,0.7)' }}>{selected.email}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelected(null); setQuery('');
              }}
              className="shrink-0 rounded p-0.5 hover:bg-white/10"
              style={{ color: 'rgba(156,197,161,0.7)' }}
            >
              <X size={12} />
            </button>
          </div>
        )}

        {error && (
          <p className="mt-2 text-[11px]" style={{ color: 'var(--color-text-accent)' }}>{error}</p>
        )}

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-[10px] px-4 py-2 text-[13px] font-medium transition-all hover:bg-white/5"
            style={{ color: 'rgba(251,245,221,0.5)' }}
          >
            Cancel
          </button>
          <button
            onClick={() => void handleStart()}
            disabled={busy || (!selected && !query.trim())}
            className="flex items-center gap-2 rounded-[10px] px-4 py-2 text-[13px] font-medium transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--color-chat-accent)', color: '#1E2E30' }}
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />}
            {busy ? 'Opening…' : 'Start Chat'}
          </button>
        </div>
      </div>
    </div>
  );
}
