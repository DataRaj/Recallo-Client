'use client';

/**
 * ChatThemePicker — compact popover to switch the chat palette.
 *
 * Writes through ThemeProvider.setChatTheme, which toggles `data-chat-theme`
 * on <html> and drives the [data-chat-theme] token overrides in global.css.
 */

import type { ChatThemeKey } from '@/components/providers/theme-provider';
import { Check, Palette } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CHAT_THEMES, useTheme } from '@/components/providers/theme-provider';

export function ChatThemePicker() {
  const { chatTheme, setChatTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onEsc);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="rounded-lg p-2 transition-colors hover:bg-white/5"
        style={{ color: 'var(--color-chat-accent)' }}
        title="Chat theme"
      >
        <Palette size={18} />
      </button>

      {open && (
        <div
          className="animate-slide-down absolute top-full right-0 z-50 mt-1 w-44 rounded-xl p-1.5 shadow-2xl"
          style={{ background: 'var(--color-chat-surface)', border: '1px solid var(--color-border)' }}
        >
          {(Object.keys(CHAT_THEMES) as ChatThemeKey[]).map(key => (
            <button
              key={key}
              onClick={() => {
                setChatTheme(key); setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-white/10"
            >
              <span
                className="size-4 shrink-0 rounded-full"
                style={{ background: CHAT_THEMES[key].swatch, boxShadow: '0 0 0 1px rgba(255,255,255,0.15)' }}
              />
              <span className="flex-1 text-[12px]" style={{ color: 'var(--color-chat-text)' }}>
                {CHAT_THEMES[key].label}
              </span>
              {chatTheme === key && <Check size={13} style={{ color: 'var(--color-chat-accent)' }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
