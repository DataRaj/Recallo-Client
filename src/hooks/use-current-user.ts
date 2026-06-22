/**
 * useCurrentUser — Hydrates the auth store on mount.
 *
 * Called once in the dashboard layout (or app shell). It hits /api/auth/me,
 * which reads the httpOnly cookie and calls the Go backend. On success it
 * populates the Zustand store with the user + a fresh access token obtained
 * via /api/auth/refresh.
 *
 * If the cookie is absent or the refresh fails, auth state is cleared.
 */
'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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

  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchCurrentUser,
    retry: false,
    staleTime: 4 * 60 * 1000, // Re-fetch after 4 minutes (access token is short-lived)
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
    user: useAuthStore(s => s.user),
    isLoading: query.isLoading,
    isHydrated: useAuthStore(s => s.isHydrated),
  };
}
