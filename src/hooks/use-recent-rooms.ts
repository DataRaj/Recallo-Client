'use client';

import { useEffect, useState } from 'react';
import { getRecentRooms, RECENT_ROOMS_EVENT, type RecentRoom } from '@/utils/recent-rooms';

/**
 * Reactive view of the locally-tracked recent rooms.
 * Refreshes on same-tab writes (custom event) and cross-tab writes (storage).
 */
export function useRecentRooms(): RecentRoom[] {
  const [rooms, setRooms] = useState<RecentRoom[]>([]);

  useEffect(() => {
    const sync = () => setRooms(getRecentRooms());
    sync();
    window.addEventListener(RECENT_ROOMS_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(RECENT_ROOMS_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return rooms;
}
