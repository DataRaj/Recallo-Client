'use client';

/**
 * NewConversationModal
 *
 * Simple modal to start a private conversation by numeric user id
 * (no user-search endpoint exists yet on the backend).
 *
 * Can be opened programmatically from the chat layout header "+".
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import { X, MessageSquare, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createConversation } from '@/services/chat-service';
import { ROUTES } from '@/lib/routes';
import { useLocale } from 'next-intl';

interface NewConversationModalProps {
  /** When non-null, the modal is open. */
  open: boolean;
  /** Pre-fill with a user id. */
  prefillUserId?: number;
  onClose: () => void;
}

export function NewConversationModal({
  open,
  prefillUserId,
  onClose,
}: NewConversationModalProps) {
  const router = useRouter();
  const locale = useLocale();
  const [userId, setUserId] = useState(prefillUserId ? String(prefillUserId) : '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setUserId(prefillUserId ? String(prefillUserId) : '');
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, prefillUserId]);

  const handleSubmit = useCallback(async () => {
    const id = parseInt(userId.trim(), 10);
    if (isNaN(id) || id <= 0) {
      setError('Enter a valid numeric user ID.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const convo = await createConversation(id);
      onClose();
      router.push(`/${locale}${ROUTES.CHAT_CONVERSATION(convo.id)}`);
    } catch (err: unknown) {
      const maybe = err as { response?: { data?: { message?: string } }; message?: string };
      setError(maybe?.response?.data?.message ?? maybe?.message ?? 'Failed to create conversation.');
    } finally {
      setBusy(false);
    }
  }, [userId, locale, router, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
        style={{ background: '#1E2E30', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{ background: 'rgba(156,197,161,0.15)' }}
            >
              <MessageSquare size={15} style={{ color: '#9CC5A1' }} />
            </div>
            <h2 className="text-[15px] font-semibold" style={{ color: '#FBF5DD' }}>
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

        <p className="mb-4 text-[12px] leading-relaxed" style={{ color: 'rgba(251,245,221,0.55)' }}>
          Enter the numeric user ID of the person you want to message. You can find this in their
          profile or from the meeting participants list.
        </p>

        {/* Input */}
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-medium" style={{ color: 'rgba(251,245,221,0.5)' }}>
            User ID
          </span>
          <input
            ref={inputRef}
            type="number"
            min={1}
            value={userId}
            onChange={(e) => { setUserId(e.target.value); setError(null); }}
            onKeyDown={(e) => { if (e.key === 'Enter') void handleSubmit(); }}
            placeholder="e.g. 42"
            className="w-full rounded-[10px] border px-3 py-2.5 text-[13px] outline-none transition-all focus:ring-1"
            style={{
              background: '#273338',
              borderColor: error ? '#BA5A5A' : 'rgba(255,255,255,0.08)',
              color: '#FBF5DD',
            }}
          />
          {error && (
            <p className="mt-1.5 text-[11px]" style={{ color: '#BA5A5A' }}>{error}</p>
          )}
        </label>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-[10px] px-4 py-2 text-[13px] font-medium transition-all hover:bg-white/5"
            style={{ color: 'rgba(251,245,221,0.5)' }}
          >
            Cancel
          </button>
          <button
            onClick={() => void handleSubmit()}
            disabled={busy || !userId.trim()}
            className="flex items-center gap-2 rounded-[10px] px-4 py-2 text-[13px] font-medium transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: '#9CC5A1', color: '#1E2E30' }}
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />}
            {busy ? 'Opening…' : 'Start Chat'}
          </button>
        </div>
      </div>
    </div>
  );
}
