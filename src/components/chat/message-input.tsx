'use client';

/**
 * ChatMessageInput
 *
 * Production-grade message composer for the chat conversation page.
 * Features:
 *  - Auto-expanding glassmorphic input dock (CSS-variable themed)
 *  - Plain text send on Enter (Shift+Enter = newline)
 *  - Markdown toolbar shortcuts (bold / italic / code / list)
 *  - Emoji picker + GIF picker (Tenor)
 *  - Multi-file attachment queue with previews + drag-and-drop overlay
 *  - Typing indicator emit + active-typing pulse glow
 */

import {
  useState, useRef, useCallback, useEffect, KeyboardEvent, ChangeEvent,
} from 'react';
import {
  Send, Smile, Paperclip, X, Bold, Italic, Code, List, Film, File as FileIcon, UploadCloud,
} from 'lucide-react';
import { GifPicker } from '@/components/chat/gif-picker';
import { EmojiPicker } from '@/components/chat/emoji-picker';
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

const MAX_FILE_MB = 10;
const MAX_TEXTAREA_PX = 160;

type Popover = 'none' | 'gif' | 'emoji';

export function ChatMessageInput({
  disabled,
  onSendText,
  onSendGif,
  onSendFile,
  onTyping,
}: ChatMessageInputProps) {
  const [text, setText] = useState('');
  const [popover, setPopover] = useState<Popover>('none');
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Typing emit ──────────────────────────────────────────────────────────

  const emitTyping = useCallback(
    (typing: boolean) => {
      setIsTyping(typing);
      onTyping?.(typing);
    },
    [onTyping],
  );

  const autoGrow = useCallback((el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_PX)}px`;
  }, []);

  const handleTextChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    autoGrow(e.target);
    emitTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitTyping(false), 2500);
  }, [emitTyping, autoGrow]);

  // ── File queue ─────────────────────────────────────────────────────────────

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;
    setFileError(null);

    for (const file of list) {
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        setFileError(`${file.name} is over ${MAX_FILE_MB} MB`);
        continue;
      }
      try {
        const prepared = await prepareFileUpload(file);
        const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
        setPendingFiles(prev => [...prev, { ...prepared, previewUrl }]);
      }
      catch {
        setFileError(`Could not read ${file.name}`);
      }
    }
  }, []);

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) void addFiles(e.target.files);
    e.target.value = '';
  }, [addFiles]);

  const removeFile = useCallback((index: number) => {
    setPendingFiles(prev => {
      const target = prev[index];
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  // ── Drag & drop over the whole window ──────────────────────────────────────

  useEffect(() => {
    let depth = 0;
    const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes('Files');

    const onDragEnter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      depth += 1;
      setIsDragging(true);
    };
    const onDragOver = (e: DragEvent) => { if (hasFiles(e)) e.preventDefault(); };
    const onDragLeave = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      depth = Math.max(0, depth - 1);
      if (depth === 0) setIsDragging(false);
    };
    const onDrop = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth = 0;
      setIsDragging(false);
      if (e.dataTransfer?.files) void addFiles(e.dataTransfer.files);
    };

    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragenter', onDragEnter);
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('drop', onDrop);
    };
  }, [addFiles]);

  // Revoke any object URLs still around on unmount.
  useEffect(() => () => {
    pendingFiles.forEach(f => { if (f.previewUrl) URL.revokeObjectURL(f.previewUrl); });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Send (text + all queued files) ─────────────────────────────────────────

  const canSend = !disabled && (text.trim().length > 0 || pendingFiles.length > 0);

  const handleSend = useCallback(() => {
    if (disabled) return;
    const trimmed = text.trim();
    if (!trimmed && pendingFiles.length === 0) return;

    if (trimmed) onSendText(trimmed);
    pendingFiles.forEach(file => {
      onSendFile(file);
      if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
    });

    setText('');
    setPendingFiles([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    emitTyping(false);
  }, [disabled, text, pendingFiles, onSendText, onSendFile, emitTyping]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // ── Markdown helpers ───────────────────────────────────────────────────────

  const applyWrap = useCallback((token: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e, value } = el;
    const selected = value.slice(s, e) || 'text';
    const next = `${value.slice(0, s)}${token}${selected}${token}${value.slice(e)}`;
    setText(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + token.length, s + token.length + selected.length);
      autoGrow(el);
    });
  }, [autoGrow]);

  const applyList = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: s, value } = el;
    const lineStart = value.lastIndexOf('\n', s - 1) + 1;
    const next = `${value.slice(0, lineStart)}- ${value.slice(lineStart)}`;
    setText(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + 2, s + 2);
      autoGrow(el);
    });
  }, [autoGrow]);

  const insertAtCursor = useCallback((snippet: string) => {
    const el = textareaRef.current;
    if (!el) {
      setText(prev => prev + snippet);
      return;
    }
    const { selectionStart: s, selectionEnd: e, value } = el;
    const next = value.slice(0, s) + snippet + value.slice(e);
    setText(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + snippet.length, s + snippet.length);
      autoGrow(el);
    });
  }, [autoGrow]);

  // ── Sub-actions ────────────────────────────────────────────────────────────

  const handleGifSelect = useCallback((gif: GifResult) => {
    setPopover('none');
    if (!disabled) onSendGif(gif);
  }, [disabled, onSendGif]);

  const handleEmojiSelect = useCallback((emoji: string) => {
    insertAtCursor(emoji);
  }, [insertAtCursor]);

  return (
    <div className="relative">
      {/* Drag-and-drop overlay */}
      {isDragging && (
        <div
          className="animate-fade-in fixed inset-0 z-[60] flex items-center justify-center"
          style={{ background: 'rgba(10,14,16,0.55)', backdropFilter: 'blur(6px)' }}
        >
          <div
            className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed px-10 py-8"
            style={{ borderColor: 'var(--color-chat-accent)', background: 'rgba(255,255,255,0.04)' }}
          >
            <UploadCloud size={40} style={{ color: 'var(--color-chat-accent)' }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--color-chat-text)' }}>
              Drop files here to attach to DM
            </p>
          </div>
        </div>
      )}

      {/* Pickers */}
      {popover === 'gif' && (
        <GifPicker onSelect={handleGifSelect} onClose={() => setPopover('none')} />
      )}
      {popover === 'emoji' && (
        <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setPopover('none')} />
      )}

      {/* Attachment queue */}
      {pendingFiles.length > 0 && (
        <div className="mb-2 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
          {pendingFiles.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="relative flex w-40 shrink-0 items-center gap-2 rounded-[10px] px-2.5 py-2"
              style={{ background: 'var(--color-chat-bubble)', border: '1px solid var(--color-border)' }}
            >
              {file.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={file.previewUrl} alt={file.name} className="h-10 w-10 shrink-0 rounded-lg object-cover" />
              ) : (
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: 'var(--color-chat-surface)', color: 'var(--color-chat-accent)' }}
                >
                  <FileIcon size={16} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-medium" style={{ color: 'var(--color-chat-text)' }}>{file.name}</p>
                <p className="text-[9px]" style={{ color: 'var(--color-chat-text-2)' }}>{(file.size / 1024).toFixed(0)} KB</p>
              </div>
              <button
                onClick={() => removeFile(i)}
                className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full text-white shadow"
                style={{ background: 'var(--color-danger)' }}
                aria-label={`Remove ${file.name}`}
              >
                <X size={9} />
              </button>
            </div>
          ))}
        </div>
      )}

      {fileError && (
        <p className="mb-1.5 text-[11px]" style={{ color: 'var(--color-danger)' }}>{fileError}</p>
      )}

      {/* Input dock */}
      <div
        className={`flex flex-col gap-1.5 rounded-[16px] px-2.5 pb-2 pt-1.5 ${isTyping ? 'animate-input-pulse' : ''}`}
        style={{
          background: 'var(--color-chat-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        {/* Markdown toolbar */}
        <div className="flex items-center gap-0.5 px-1">
          <ToolbarButton title="Bold" onClick={() => applyWrap('**')}><Bold size={13} /></ToolbarButton>
          <ToolbarButton title="Italic" onClick={() => applyWrap('*')}><Italic size={13} /></ToolbarButton>
          <ToolbarButton title="Code" onClick={() => applyWrap('`')}><Code size={13} /></ToolbarButton>
          <ToolbarButton title="Bullet list" onClick={applyList}><List size={13} /></ToolbarButton>
        </div>

        {/* Input row */}
        <div className="flex items-end gap-1.5">
          <div className="flex shrink-0 items-center gap-0.5 pb-1">
            <IconButton
              title="Emoji"
              active={popover === 'emoji'}
              onClick={() => setPopover(p => (p === 'emoji' ? 'none' : 'emoji'))}
            >
              <Smile size={17} />
            </IconButton>
            <IconButton
              title="GIF"
              active={popover === 'gif'}
              onClick={() => setPopover(p => (p === 'gif' ? 'none' : 'gif'))}
            >
              <Film size={17} />
            </IconButton>
            <IconButton title="Attach files" onClick={() => fileInputRef.current?.click()}>
              <Paperclip size={17} />
            </IconButton>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              accept="image/*,application/pdf,.doc,.docx,.txt,.zip,.mp4,.mp3"
            />
          </div>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={disabled ? 'Connecting…' : 'Message… (Enter to send, Shift+Enter for newline)'}
            rows={1}
            className="flex-1 resize-none bg-transparent py-1.5 text-[13px] leading-relaxed placeholder:opacity-40 focus:outline-none"
            style={{ color: 'var(--color-chat-text)', maxHeight: `${MAX_TEXTAREA_PX}px`, overflowY: 'auto' }}
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            className={`mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-200 disabled:opacity-40 ${canSend ? 'scale-100 animate-send-glow' : 'scale-90'}`}
            style={{
              background: canSend ? 'var(--color-chat-accent)' : 'rgba(255,255,255,0.06)',
              color: canSend ? '#12181B' : 'var(--color-chat-text-2)',
            }}
            title="Send"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="rounded-[6px] p-1 transition-colors hover:bg-white/10"
      style={{ color: 'var(--color-chat-text-2)' }}
    >
      {children}
    </button>
  );
}

function IconButton({ title, active, onClick, children }: { title: string; active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="rounded-[8px] p-1.5 transition-colors hover:bg-white/10"
      style={{ color: active ? 'var(--color-chat-accent)' : 'var(--color-chat-text-2)' }}
    >
      {children}
    </button>
  );
}
