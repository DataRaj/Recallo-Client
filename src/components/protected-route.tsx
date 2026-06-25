/**
 * Protected route wrapper component
 * Redirects unauthenticated users to login
 * Doesn't redirect authenticated users away from auth pages
 */
'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ROUTES, isAuthRoute } from '@/lib/routes';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { user, isLoading, isHydrated } = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isHydrated) return; // Still loading

    if (requireAuth && !user) {
      // User is not authenticated and route requires auth
      router.replace(ROUTES.LOGIN);
    }
    else if (!requireAuth && user && isAuthRoute(pathname)) {
      // User IS authenticated but on an auth route (login/register)
      // Redirect to home
      router.replace(ROUTES.HOME);
    }
  }, [user, isLoading, isHydrated, router, pathname, requireAuth]);

  // Show loading state while hydrating
  if (!isHydrated || isLoading) {
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
            <p
              className="text-sm font-medium"
              style={{ color: '#8D7A7A' }}
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
