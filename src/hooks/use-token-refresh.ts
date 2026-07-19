'use client';

/**
 * useTokenRefresh — Proactively refresh the JWT token before it expires.
 *
 * Tokens expire in 30 minutes. This hook refreshes every 20 minutes to ensure
 * the token never expires while the user has the app open.
 * When the token is refreshed, the WebSocket hook detects the new accessToken
 * in the auth store and automatically reconnects.
 */

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/use-auth-store';

export function useTokenRefresh() {
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { accessToken, setAuth, user } = useAuthStore();

  useEffect(() => {
    if (!accessToken || !user) {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      return;
    }

    const refreshToken = async () => {
      try {
        const res = await fetch('/api/auth/refresh', { method: 'POST' });
        if (!res.ok) return;

        const data = (await res.json()) as {
          success: boolean;
          data?: { user: typeof user; access_token: string };
        };

        if (data.success && data.data?.access_token && data.data?.user) {
          setAuth(data.data.user, data.data.access_token);
        }
      } catch {
        // Silently fail — next scheduled refresh will retry
      }
    };

    // Start refresh immediately on mount if this is not the first token
    refreshToken();

    // Then set up periodic refresh every 20 minutes (tokens last 30 min)
    refreshTimerRef.current = setInterval(refreshToken, 20 * 60 * 1000);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [accessToken, user, setAuth]);
}
