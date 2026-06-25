/**
 * useCurrentUser — Hydrates the auth store on mount.
 *
 * Strategy:
 *  1. If Zustand already has a user (set by login/register/OAuth in this session),
 *     mark as hydrated immediately — no network call needed.
 *  2. Otherwise, call POST /api/auth/refresh which reads the httpOnly cookie,
 *     calls the Go backend, and returns a fresh access_token + user.
 *  3. On failure, clear auth state.
 */
'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/use-auth-store';
import type { AuthUser } from '@/types/auth';

interface MeResponse {
  success: boolean;
  data: { user: AuthUser; access_token: string };
}

async function fetchCurrentUser(): Promise<MeResponse> {
  const res = await fetch('/api/auth/refresh', { method: 'POST' });
  if (!res.ok) throw new Error('Unauthenticated');
  return res.json() as Promise<MeResponse>;
}

export function useCurrentUser() {
  const { setAuth, setHydrated, clearAuth } = useAuthStore();
  const storeUser = useAuthStore(s => s.user);
  const isHydrated = useAuthStore(s => s.isHydrated);
  const queryClient = useQueryClient();

  // If we already have a user in memory (from fresh login/register/OAuth),
  // mark as hydrated immediately without a network round-trip.
  useEffect(() => {
    if (storeUser && !isHydrated) {
      setHydrated(true);
      // Cancel any in-flight refresh query to avoid clobbering the fresh state
      queryClient.cancelQueries({ queryKey: ['auth', 'me'] });
    }
  }, [storeUser, isHydrated, setHydrated, queryClient]);

  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchCurrentUser,
    retry: false,
    staleTime: 4 * 60 * 1000, // Re-fetch after 4 min (access token lifetime)
    // Skip the network call if we already have a user
    enabled: !storeUser,
  });

  useEffect(() => {
    if (query.isSuccess && query.data) {
      setAuth(query.data.data.user, query.data.data.access_token);
      setHydrated(true);
    }
    if (query.isError) {
      clearAuth();
      setHydrated(true);
    }
  }, [query.isSuccess, query.isError, query.data, setAuth, setHydrated, clearAuth]);

  return {
    user: storeUser,
    isLoading: query.isLoading && !storeUser,
    isHydrated,
  };
}

/**
 * Call this after login/register/OAuth to invalidate the cached query
 * so the next time useCurrentUser runs, it will re-fetch if needed.
 */
export function invalidateAuthQuery(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
}
