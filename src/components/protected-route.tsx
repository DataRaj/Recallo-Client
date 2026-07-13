/**
 * Protected route wrapper component
 * Redirects unauthenticated users to login
 * Doesn't redirect authenticated users away from auth pages
 */
'use client';

import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { isAuthRoute, ROUTES } from '@/lib/routes';

type ProtectedRouteProps = {
  children: ReactNode;
  requireAuth?: boolean;
};

export function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { user, isLoading, isHydrated } = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isHydrated) {
      return;
    } // Still loading

    if (requireAuth && !user) {
      // User is not authenticated and route requires auth
      router.replace(ROUTES.LOGIN);
    } else if (!requireAuth && user && isAuthRoute(pathname)) {
      // User IS authenticated but on an auth route (login/register)
      // Redirect to home
      router.replace(ROUTES.HOME);
    }
  }, [user, isLoading, isHydrated, router, pathname, requireAuth]);

  // Show loading state while hydrating
  if (!isHydrated || isLoading) {
    return (
      <div
        className="flex min-h-dvh items-center justify-center"
        style={{ background: 'var(--color-bg)' }}
      >
        <div className="flex flex-col items-center gap-5">
          <div
            className="flex size-14 items-center justify-center rounded-[16px] text-xl font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #BA5A5A 0%, #8A4040 100%)' }}
          >
            R
          </div>
          <div className="flex flex-col items-center gap-2">
            <Loader2
              className="animate-spin"
              size={20}
              style={{ color: 'var(--color-accent)' }}
            />
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Loading...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If route requires auth and user is not authenticated, don't render
  if (requireAuth && !user) {
    return null;
  }

  return <>{children}</>;
}
