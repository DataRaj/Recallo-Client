/**
 * useCurrentUser — Hydrates the auth store on mount.
 *
 * Strategy:
 *  1. If Zustand already has a user (set by login/register/OAuth in this session),
 *     it is already hydrated (setAuth now sets isHydrated=true atomically) — no network call needed.
 *  2. Otherwise, call POST /api/auth/refresh which reads the httpOnly cookie,
 *     calls the Go backend, and returns a fresh access_token + user.
 *  3. On failure, clear auth state and mark hydrated so the auth guard can redirect.
 */
'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/use-auth-store';
import type { AuthUser } from '@/types/auth';

interface RefreshResponse {
  success: boolean;
  data: { user: AuthUser; access_token: string; refresh_token: string };
}

/** Safely parse the JSON body from a Response; throws if parse fails or data is malformed. */
async function fetchCurrentUser(): Promise<RefreshResponse> {
  const res = await fetch('/api/auth/refresh', { method: 'POST' });
  if (!res.ok) throw new Error('Unauthenticated');

  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON from refresh endpoint');
  }

  const data = json as RefreshResponse | null;
  if (!data?.success || !data.data?.access_token || !data.data?.user) {
    throw new Error('Unauthenticated');
  }
  return data;
}

export function useCurrentUser() {
  const { setAuth, setHydrated, clearAuth } = useAuthStore();
  const storeUser = useAuthStore(s => s.user);
  const isHydrated = useAuthStore(s => s.isHydrated);

  // Skip the network call entirely if we already have a user in memory.
  // setAuth() now atomically sets isHydrated=true, so once a user is present
  // the store is always hydrated.
  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchCurrentUser,
    retry: false,
    staleTime: 4 * 60 * 1000, // 4 min — matches typical access token lifetime
    enabled: !storeUser && !isHydrated, // only fetch when we have NO user in memory
  });

  useEffect(() => {
    if (query.isSuccess && query.data) {
      // setAuth also sets isHydrated=true
      setAuth(query.data.data.user, query.data.data.access_token);
    }
    if (query.isError) {
      clearAuth();
      setHydrated(true); // mark as done so the auth guard can redirect
    }
  }, [query.isSuccess, query.isError, query.data, setAuth, setHydrated, clearAuth]);

  return {
    user: storeUser,
    // isLoading is true only during the initial network hydration attempt, never after login
    isLoading: query.isLoading && !storeUser,
    isHydrated,
  };
}
