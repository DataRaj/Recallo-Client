const PALETTE = ['var(--color-text-accent)', 'var(--color-accent)', 'var(--color-text-secondary)', 'var(--color-chat-accent)', '#C5A99C', '#7AA5BA'];
const FALLBACK_COLOR = 'var(--color-chat-accent)';

export function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  if (!first) {
    return '?';
  }
  const last = parts[parts.length - 1];
  if (parts.length === 1 || !last) {
    return first.slice(0, 2).toUpperCase();
  }
  return ((first[0] ?? '') + (last[0] ?? '')).toUpperCase();
}

/** Stable color from a string key (participant identity or name). */
export function colorFor(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length] ?? FALLBACK_COLOR;
}
