'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Loader2 } from 'lucide-react';

/**
 * Dashboard layout — guards all /dashboard routes.
 *
 * On mount it triggers useCurrentUser which refreshes the access token via
 * the httpOnly cookie. If the cookie is absent or expired, the hook clears
 * the store and we redirect to /login.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isHydrated } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && !user) {
      router.replace('/login');
    }
  }, [isHydrated, user, router]);

  if (!isHydrated || isLoading) {
    return (
      <div className="recallo-auth-page">
        <div className="recallo-oauth-loading">
          <Loader2 className="animate-spin recallo-oauth-spinner" />
          <p className="recallo-oauth-loading-text">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  if (!user) return null; // redirect in progress

  return (
    <div className="recallo-dashboard-shell">
      {/* Sidebar */}
      <aside className="recallo-sidebar">
        <div className="recallo-sidebar-brand">
          <div className="recallo-auth-logo" style={{ width: 32, height: 32, fontSize: '0.9rem' }}>
            <span>R</span>
          </div>
          <span className="recallo-sidebar-name">Recallo</span>
        </div>
        <nav className="recallo-sidebar-nav">
          <a href="/dashboard" className="recallo-sidebar-link recallo-sidebar-link--active">
            Dashboard
          </a>
        </nav>
        <div className="recallo-sidebar-footer">
          <div className="recallo-sidebar-user">
            <div className="recallo-sidebar-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="recallo-sidebar-user-info">
              <p className="recallo-sidebar-user-name">{user.name}</p>
              <p className="recallo-sidebar-user-email">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <main className="recallo-dashboard-main">
        {children}
      </main>
    </div>
  );
}
