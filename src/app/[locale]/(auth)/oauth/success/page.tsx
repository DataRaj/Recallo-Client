'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/use-auth-store';
import { Loader2 } from 'lucide-react';

/**
 * OAuth Success landing page.
 *
 * The Go backend redirects here after GitHub auth:
 *   /oauth/success?access_token=<JWT>&refresh_token=<REFRESH>
 *
 * Steps:
 *  1. Parse access_token and refresh_token from URL params.
 *  2. POST refresh_token to /api/auth/set-cookie → stores it as httpOnly cookie.
 *  3. Store access_token in Zustand RAM store (user hydrated by useCurrentUser).
 *  4. Replace navigation to /dashboard.
 */
export default function OAuthSuccessPage() {
  const params = useSearchParams();
  const router = useRouter();
  const setAuth = useAuthStore(s => s.setAuth);

  useEffect(() => {
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (!accessToken || !refreshToken) {
      toast.error('OAuth authentication failed. Please try again.');
      router.replace('/login');
      return;
    }

    fetch('/api/auth/set-cookie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
      .then(() => {
        // User data will be hydrated via useCurrentUser in the dashboard layout.
        setAuth(null, accessToken);
        toast.success('Signed in with GitHub!');
        router.replace('/dashboard');
      })
      .catch(() => {
        toast.error('Failed to complete authentication. Please try again.');
        router.replace('/login');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="recallo-auth-page">
      <div className="recallo-oauth-loading">
        <Loader2 className="animate-spin recallo-oauth-spinner" />
        <p className="recallo-oauth-loading-text">Completing sign in…</p>
      </div>
    </div>
  );
}
