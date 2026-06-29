'use client';

/**
 * ChatMessageInput
 *
 * Rich message composer for the chat conversation page.
 * Features:
 *  - Plain text send on Enter (Shift+Enter = newline)
 *  - GIF picker (Tenor) toggle
 *  - File attachment (image, document, etc.)
 *  - Typing indicator emit via onTyping callback
 */

import {
  useState, useRef, useCallback, KeyboardEvent, ChangeEvent,
} from 'react';
import { Send, Smile, Paperclip, X } from 'lucide-react';
import { GifPicker } from '@/components/chat/gif-picker';
import { prepareFileUpload } from '@/services/chat-service';
import type { GifResult } from '@/services/chat-service';

interface PendingFile {
  name: string;
  size: number;
  mime: string;
  base64: string;
  previewUrl?: string;
}

interface ChatMessageInputProps {
  disabled?: boolean;
  onSendText: (text: string) => void;
  onSendGif: (gif: GifResult) => void;
  onSendFile: (file: PendingFile) => void;
  onTyping?: (isTyping: boolean) => void;
}

export type { PendingFile };

export function ChatMessageInput({
  disabled,
  onSendText,
  onSendGif,
  onSendFile,
  onTyping,
}: ChatMessageInputProps) {
  const [text, setText] = useState('');
  const [showGif, setShowGif] = useState(false);
  const [pendingFile, setPendingFile] = useState<PendingFile | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Typing emit ──────────────────────────────────────────────────────────

  const emitTyping = useCallback(
    (isTyping: boolean) => { onTyping?.(isTyping); },
    [onTyping],
  );

  const handleTextChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    emitTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitTyping(false), 2500);
  }, [emitTyping]);

  // ── Send text ────────────────────────────────────────────────────────────

  const handleSendText = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSendText(trimmed);
    setText('');
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    emitTyping(false);
  }, [text, disabled, onSendText, emitTyping]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  }, [handleSendText]);

  // ── GIF ──────────────────────────────────────────────────────────────────

  const handleGifSelect = useCallback((gif: GifResult) => {
    setShowGif(false);
    if (!disabled) onSendGif(gif);
  }, [disabled, onSendGif]);

  // ── File ─────────────────────────────────────────────────────────────────

  const MAX_FILE_MB = 10;

  const handleFileChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setFileError(`File must be under ${MAX_FILE_MB} MB`);
      return;
    }
    setFileError(null);
    try {
      const prepared = await prepareFileUpload(file);
      const previewUrl = file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : undefined;
      setPendingFile({ ...prepared, previewUrl });
    } catch {
      setFileError('Could not read file');
    }
  }, []);

  const sendPendingFile = useCallback(() => {
    if (!pendingFile || disabled) return;
    onSendFile(pendingFile);
    if (pendingFile.previewUrl) URL.revokeObjectURL(pendingFile.previewUrl);
    setPendingFile(null);
  }, [pendingFile, disabled, onSendFile]);

  const clearPendingFile = useCallback(() => {
    if (pendingFile?.previewUrl) URL.revokeObjectURL(pendingFile.previewUrl);
    setPendingFile(null);
    setFileError(null);
  }, [pendingFile]);

  const canSend = !disabled && (text.trim().length > 0 || pendingFile !== null);

  return (
    <div className="relative">
      {/* GIF Picker */}
      {showGif && (
        <GifPicker onSelect={handleGifSelect} onClose={() => setShowGif(false)} />
      )}

      {/* Pending file preview */}
      {pendingFile && (
        <div
          className="mb-2 flex items-center gap-2 rounded-[10px] px-3 py-2"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {pendingFile.previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={pendingFile.previewUrl}
              alt={pendingFile.name}
              className="h-12 w-12 rounded-lg object-cover"
            />
          ) : (
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white"
              style={{ background: '#273338' }}
            >
              {pendingFile.mime.split('/')[0]?.toUpperCase().slice(0, 3) ?? 'FILE'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-medium" style={{ color: '#FBF5DD' }}>
              {pendingFile.name}
            </p>
            <p className="text-[10px]" style={{ color: 'rgba(251,245,221,0.4)' }}>
              {(pendingFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            onClick={clearPendingFile}
            className="shrink-0 rounded-[6px] p-1 hover:bg-white/10"
            style={{ color: 'rgba(251,245,221,0.5)' }}
          >
            <X size={13} />
          </button>
        </div>
      )}

      {fileError && (
        <p className="mb-1.5 text-[11px]" style={{ color: '#BA5A5A' }}>{fileError}</p>
      )}

      {/* Input row */}
      <div
        className="flex items-end gap-2 rounded-[12px] px-3 py-2"
        style={{ background: '#273338', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Toolbar buttons */}
        <div className="flex shrink-0 items-center gap-1 pb-0.5">
          <button
            type="button"
            onClick={() => setShowGif((v) => !v)}
            className="rounded-[6px] p-1.5 transition-colors hover:bg-white/10"
            style={{ color: showGif ? '#9CC5A1' : 'rgba(251,245,221,0.4)' }}
            title="Send GIF"
          >
            <Smile size={16} />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-[6px] p-1.5 transition-colors hover:bg-white/10"
            style={{ color: 'rgba(251,245,221,0.4)' }}
            title="Attach file"
          >
            <Paperclip size={16} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => void handleFileChange(e)}
            accept="image/*,application/pdf,.doc,.docx,.txt,.zip,.mp4,.mp3"
          />
        </div>

        {/* Textarea */}
        <textarea
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={disabled ? 'Connecting…' : 'Message… (Enter to send, Shift+Enter for newline)'}
          rows={1}
          className="flex-1 resize-none bg-transparent text-[13px] leading-relaxed placeholder:opacity-40 focus:outline-none"
          style={{
            color: '#FBF5DD',
            maxHeight: '120px',
            overflowY: 'auto',
          }}
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = 'auto';
            el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
          }}
        />

        {/* Send button */}
        <button
          type="button"
          onClick={pendingFile ? sendPendingFile : handleSendText}
          disabled={!canSend}
          className="mb-0.5 shrink-0 rounded-[8px] p-2 transition-all disabled:opacity-40"
          style={{ background: canSend ? '#9CC5A1' : 'rgba(255,255,255,0.06)', color: canSend ? '#1C2A2C' : 'rgba(251,245,221,0.4)' }}
          title="Send"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
