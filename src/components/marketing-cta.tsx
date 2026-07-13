'use client';

import Link from 'next/link';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ROUTES } from '@/lib/routes';

export function MarketingCTA() {
  const { user, isHydrated } = useCurrentUser();

  if (!isHydrated) {
    return <div className="h-9 w-[140px]" />;
  }

  if (user) {
    const userInitial = user.name.charAt(0).toUpperCase();
    return (
      <div className="flex items-center gap-3">
        <Link
          href={ROUTES.HOME}
          className="flex items-center gap-2 rounded-[10px] px-3 py-1.5 transition-all duration-200 hover:bg-[var(--color-surface-hover)]"
        >
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            Dashboard
          </span>
          <div
            className="flex size-7 items-center justify-center rounded-full text-xs font-semibold text-white"
            style={{ background: 'var(--color-text-accent)' }}
          >
            {userInitial}
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className="hidden rounded-[10px] px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-[var(--color-surface-hover)] sm:block"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Sign In
      </Link>
      <Link
        href="/register"
        className="rounded-[10px] px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:opacity-90 active:scale-[0.97]"
        style={{ background: 'linear-gradient(135deg, #BA5A5A 0%, #8A4040 100%)', boxShadow: '0px 2px 8px rgba(186,90,90,0.3)' }}
      >
        Try Now
      </Link>
    </div>
  );
}
