/**
 * Recent-rooms tracker (client-only).
 *
 * The Go backend exposes no "list my rooms / past calls" endpoint, so the
 * dashboard's recent activity is sourced locally: every room the user creates
 * or joins is recorded in localStorage and surfaced via `useRecentRooms`.
 */

export interface RecentRoom {
  id: string;
  title: string;
  type: 'meeting' | 'webinar';
  role: 'host' | 'guest';
  /** Epoch ms of the most recent create/join. */
  at: number;
}

const STORAGE_KEY = 'recallo_recent_rooms';
const MAX_ENTRIES = 20;

/** Dispatched on the window after a write so same-tab listeners can refresh. */
export const RECENT_ROOMS_EVENT = 'recallo:recent-rooms';

export function getRecentRooms(): RecentRoom[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as RecentRoom[]) : [];
  }
  catch {
    return [];
  }
}

/** Record (or refresh) a room the user created or joined. Most-recent first. */
export function recordRecentRoom(entry: Omit<RecentRoom, 'at'>): void {
  if (typeof window === 'undefined') return;
  const next = [
    { ...entry, at: Date.now() },
    ...getRecentRooms().filter(r => r.id !== entry.id),
  ].slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(RECENT_ROOMS_EVENT));
  }
  catch {
    // Ignore quota / serialization errors — recent activity is best-effort.
  }
}
