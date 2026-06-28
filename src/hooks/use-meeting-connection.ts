'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getRoom, getRoomToken } from '@/services/room-service';
import { getMeetingIdentity } from '@/utils/identity';
import { useAuthStore } from '@/stores/use-auth-store';
import type { Room } from '@/types/room';
import type { MeetingConnection } from '@/types/meeting';

const DISPLAY_NAME_KEY = 'recallo_display_name';

/** Ensure the LiveKit server URL is a ws(s):// URL for SDK connect. */
function normalizeServerUrl(host: string): string {
  if (host.startsWith('ws://') || host.startsWith('wss://')) return host;
  if (host.startsWith('http://')) return `ws://${host.slice('http://'.length)}`;
  if (host.startsWith('https://')) return `wss://${host.slice('https://'.length)}`;
  return `wss://${host}`;
}

function errorMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null) {
    const maybe = err as { response?: { data?: { error?: string } }; message?: string };
    return maybe.response?.data?.error ?? maybe.message ?? fallback;
  }
  return fallback;
}

interface UseMeetingConnectionResult {
  room: Room | null;
  isLoading: boolean;
  error: string | null;
  isHost: boolean;
  guestId: string;
  defaultName: string;
  fetchToken: (displayName: string) => Promise<MeetingConnection>;
  /** Re-fetch room state (e.g. after extending the session). */
  refetch: () => Promise<void>;
}

export function useMeetingConnection(roomId: string): UseMeetingConnectionResult {
  const user = useAuthStore(s => s.user);
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [defaultName, setDefaultName] = useState('Guest');

  // Stable meeting identity (`u<id>` when authed, else guest UUID).
  const guestIdRef = useRef<string>('');
  if (!guestIdRef.current) guestIdRef.current = getMeetingIdentity();

  const load = useCallback(
    async (signal?: { aborted: boolean }) => {
      try {
        const guestId = guestIdRef.current;
        const fetched = await getRoom(roomId);
        if (signal?.aborted) return;

        const host = fetched.host_guest_id === guestId;
        const savedName
          = user?.name
          ?? (typeof window !== 'undefined' ? localStorage.getItem(DISPLAY_NAME_KEY) : null)
          ?? (host ? 'Host' : 'Guest');

        setRoom(fetched);
        setIsHost(host);
        setDefaultName(savedName);
      }
      catch (err: unknown) {
        if (signal?.aborted) return;
        setError(errorMessage(err, 'Failed to connect to room'));
      }
      finally {
        if (!signal?.aborted) setIsLoading(false);
      }
    },
    [roomId, user?.name],
  );

  useEffect(() => {
    const signal = { aborted: false };
    setIsLoading(true);
    setError(null);
    void load(signal);
    return () => {
      signal.aborted = true;
    };
  }, [load]);

  const refetch = useCallback(async () => {
    await load();
  }, [load]);

  const fetchToken = useCallback(
    async (displayName: string): Promise<MeetingConnection> => {
      const guestId = guestIdRef.current;
      const resp = await getRoomToken(roomId, guestId, displayName, isHost);
      if (typeof window !== 'undefined') {
        localStorage.setItem(DISPLAY_NAME_KEY, displayName);
      }
      return {
        token: resp.token,
        serverUrl: normalizeServerUrl(resp.livekit_host),
        displayName,
      };
    },
    [roomId, isHost],
  );

  return {
    room,
    isLoading,
    error,
    isHost,
    guestId: guestIdRef.current,
    defaultName,
    fetchToken,
    refetch,
  };
}
