'use client';

/**
 * useTokenRefresh — Proactively refresh the JWT token before it expires.
 *
 * Tokens expire in 30 minutes; refresh every 20. The interval is created once
 * (empty deps) and reads auth state via getState() at fire time — depending on
 * `accessToken` here would re-run the effect after every setAuth and cause an
 * infinite refresh loop (each refresh rotates the token, retriggering the
 * effect). Refresh-on-mount is also intentionally omitted: the app already
 * refreshes on load via /api/auth/refresh, and an extra immediate call races
 * that one against server-side token rotation.
 */

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/use-auth-store';

const REFRESH_INTERVAL_MS = 20 * 60 * 1000;

export function useTokenRefresh() {
  useEffect(() => {
    const timer = setInterval(async () => {
      const { accessToken, user, setAuth } = useAuthStore.getState();
      if (!accessToken || !user) {
        return;
      }

      try {
        const res = await fetch('/api/auth/refresh', { method: 'POST' });
        if (!res.ok) {
          return;
        }

        const data = (await res.json()) as {
          success: boolean;
          data?: { user: NonNullable<typeof user>; access_token: string };
        };

        if (data.success && data.data?.access_token && data.data?.user) {
          setAuth(data.data.user, data.data.access_token);
        }
      } catch {
        // Silently fail — next scheduled refresh will retry.
      }
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);
}
