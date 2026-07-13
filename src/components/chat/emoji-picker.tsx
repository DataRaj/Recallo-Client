'use client';

/**
 * EmojiPicker — lightweight, dependency-free emoji popover.
 *
 * A curated, categorised grid plus a persisted "recents" row. Themed with the
 * chat CSS custom properties so it adapts to the active chat palette.
 */

import { X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type EmojiPickerProps = {
  onSelect: (emoji: string) => void;
  onClose: () => void;
};

const RECENTS_KEY = 'recallo-emoji-recents';
const MAX_RECENTS = 24;

const CATEGORIES: { id: string; label: string; emojis: string[] }[] = [
  {
    id: 'smileys',
    label: '😊',
    emojis: '😀 😃 😄 😁 😆 😅 😂 🤣 😊 🙂 🙃 😉 😌 😍 🥰 😘 😗 😙 😚 😋 😛 😝 😜 🤪 🤨 🧐 🤓 😎 🥳 🤩 😏 😒 😞 😔 😟 😕 🙁 😣 😖 😫 😩 🥺 😢 😭 😤 😠 😡 🤬 🤯 😳 🥵 🥶 😱 😨 😰 😥 😓 🤔 🤗 🤭 🥱 😴'.split(' '),
  },
  {
    id: 'gestures',
    label: '👍',
    emojis: '👍 👎 👌 🤌 🤏 ✌️ 🤞 🤟 🤘 🤙 👈 👉 👆 👇 ☝️ 👋 🤚 🖐️ ✋ 🖖 👏 🙌 🤝 🙏 💪 🫶 👀 🧠 🫡 🤷 🤦'.split(' '),
  },
  {
    id: 'hearts',
    label: '❤️',
    emojis: '❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝 ✨ 🔥 ⭐ 🌟 💫 💯 🎉 🎊'.split(' '),
  },
  {
    id: 'animals',
    label: '🐶',
    emojis: '🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🐔 🐧 🐦 🦆 🦉 🦄 🐝 🦋 🐢 🐙 🐬 🐳 🌍 🌸 🌺 🌻 🌈'.split(' '),
  },
  {
    id: 'food',
    label: '🍕',
    emojis: '🍏 🍎 🍊 🍋 🍌 🍉 🍇 🍓 🫐 🍒 🥭 🍍 🥥 🍅 🥑 🌽 🌶️ 🍔 🍟 🍕 🌭 🥪 🌮 🍜 🍝 🍣 🍩 🍪 🎂 🍰 ☕ 🍺 🍷 🥂'.split(' '),
  },
  {
    id: 'activities',
    label: '⚽',
    emojis: '⚽ 🏀 🏈 ⚾ 🎾 🏐 🎱 🏓 🏸 🥅 🏆 🥇 🎮 🎲 🎯 🎸 🎧 🎤 🎬 ✈️ 🚀 🚗 🏝️ 🎡 💻 📱 📷 💡 🔑 🎁 📌 ✅'.split(' '),
  },
];

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const [active, setActive] = useState(CATEGORIES[0]!.id);
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENTS_KEY);
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      if (Array.isArray(parsed)) {
        setRecents(parsed.filter((e): e is string => typeof e === 'string'));
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const pickerRef = useRef<HTMLDivElement>(null);

  const handlePick = useCallback((emoji: string) => {
    onSelect(emoji);
    setRecents((prev) => {
      const next = [emoji, ...prev.filter(e => e !== emoji)].slice(0, MAX_RECENTS);
      try {
        localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
      } catch { /* ignore */ }
      return next;
    });
  }, [onSelect]);

  const activeEmojis = useMemo(
    () => CATEGORIES.find(c => c.id === active)?.emojis ?? [],
    [active],
  );

  return (
    <div
      ref={pickerRef}
      className="absolute bottom-full left-0 mb-2 flex w-72 flex-col overflow-hidden rounded-2xl shadow-2xl"
      style={{
        background: 'var(--color-chat-surface)',
        border: '1px solid var(--color-border)',
        maxHeight: '320px',
        zIndex: 50,
      }}
    >
      {/* Header */}
      <div
        className="flex shrink-0 items-center justify-between px-3 py-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <span className="text-[12px] font-semibold" style={{ color: 'var(--color-chat-text)' }}>Emoji</span>
        <button
          onClick={onClose}
          className="rounded-[6px] p-1 transition-colors hover:bg-white/10"
          style={{ color: 'var(--color-chat-text-2)' }}
          aria-label="Close emoji picker"
        >
          <X size={13} />
        </button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-2">
        {recents.length > 0 && (
          <>
            <p className="px-1 pb-1 text-[9px] font-semibold tracking-wide uppercase" style={{ color: 'var(--color-chat-text-2)' }}>
              Recent
            </p>
            <div className="mb-2 grid grid-cols-8 gap-0.5">
              {recents.map((emoji, i) => (
                <EmojiButton key={`r-${i}`} emoji={emoji} onClick={() => handlePick(emoji)} />
              ))}
            </div>
          </>
        )}
        <div className="grid grid-cols-8 gap-0.5">
          {activeEmojis.map((emoji, i) => (
            <EmojiButton key={`${active}-${i}`} emoji={emoji} onClick={() => handlePick(emoji)} />
          ))}
        </div>
      </div>

      {/* Category tabs */}
      <div
        className="flex shrink-0 items-center justify-around p-1"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActive(cat.id)}
            className="rounded-[8px] px-1.5 py-1 text-base transition-all hover:scale-110"
            style={{ opacity: active === cat.id ? 1 : 0.5 }}
            title={cat.id}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function EmojiButton({ emoji, onClick }: { emoji: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex size-8 items-center justify-center rounded-[8px] text-lg transition-all hover:scale-110 hover:bg-white/10"
    >
      {emoji}
    </button>
  );
}
