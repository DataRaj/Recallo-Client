'use client';

import React, { useEffect } from 'react';
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
 *  2. POST refresh_token to /api/auth/set-cookie → stores as httpOnly cookie.
 *  3. POST to /api/auth/refresh to get the full user object from the backend.
 *  4. Hydrate Zustand with user + accessToken so the dashboard can render immediately.
 *  5. Replace navigation to /dashboard — no page refresh needed.
 */
function OAuthSuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { setAuth, setHydrated } = useAuthStore();

  useEffect(() => {
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (!accessToken || !refreshToken) {
      toast.error('OAuth authentication failed. Please try again.');
      router.replace('/login');
      return;
    }

    (async () => {
      try {
        // 1. Store refresh_token as httpOnly cookie
        await fetch('/api/auth/set-cookie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        // 2. Use the refresh endpoint to get the full user object
        const meRes = await fetch('/api/auth/refresh', { method: 'POST' });
        if (meRes.ok) {
          const meData = await meRes.json() as {
            success: boolean;
            data: { user: { id: number; name: string; email: string }; access_token: string };
          };
          if (meData.success && meData.data?.user) {
            setAuth(meData.data.user, meData.data.access_token);
            setHydrated(true);
            toast.success(`Welcome, ${meData.data.user.name}!`);
            router.replace('/dashboard');
            return;
          }
        }

        // Fallback: set access token only — dashboard will hydrate user from cookie
        setAuth(null, accessToken);
        setHydrated(false); // let useCurrentUser re-hydrate on dashboard mount
        toast.success('Signed in with GitHub!');
        router.replace('/dashboard');
      } catch {
        toast.error('Failed to complete authentication. Please try again.');
        router.replace('/login');
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="min-h-dvh flex items-center justify-center"
      style={{ background: '#E6F2DD' }}
    >
      <div className="flex flex-col items-center gap-5">
        <div
          className="w-14 h-14 rounded-[16px] flex items-center justify-center text-white text-xl font-semibold"
          style={{ background: 'linear-gradient(135deg, #BA5A5A 0%, #8A4040 100%)' }}
        >
          R
        </div>
        <div className="flex flex-col items-center gap-2">
          <Loader2
            className="animate-spin"
            size={20}
            style={{ color: '#B0BA99' }}
          />
          <p className="text-sm font-medium" style={{ color: '#8D7A7A' }}>
            Completing sign in…
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OAuthSuccessPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center" style={{ background: '#E6F2DD' }}>
        <Loader2 className="animate-spin" size={20} style={{ color: '#B0BA99' }} />
      </div>
    }>
      <OAuthSuccessContent />
    </React.Suspense>
  );
}
