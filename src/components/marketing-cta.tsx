'use client';

import Link from 'next/link';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ROUTES } from '@/lib/routes';

export function MarketingCTA() {
  const { user, isHydrated } = useCurrentUser();

  if (!isHydrated) {
    return <div className="w-[140px] h-9" />;
  }

  if (user) {
    const userInitial = user.name.charAt(0).toUpperCase();
    return (
      <div className="flex items-center gap-3">
        <Link
          href={ROUTES.HOME}
          className="flex items-center gap-2 px-3 py-1.5 rounded-[10px] transition-all duration-200 hover:bg-[#DDEBD5]"
        >
          <span className="text-sm font-medium" style={{ color: '#2C3E2D' }}>
            Dashboard
          </span>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold"
            style={{ background: '#BA5A5A' }}
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
        className="hidden sm:block px-4 py-2 rounded-[10px] text-sm font-medium transition-all duration-200 hover:bg-[#DDEBD5]"
        style={{ color: '#2C3E2D' }}
      >
        Sign In
      </Link>
      <Link
        href="/register"
        className="px-4 py-2 rounded-[10px] text-sm font-medium text-white transition-all duration-200 hover:opacity-90 active:scale-[0.97]"
        style={{ background: 'linear-gradient(135deg, #BA5A5A 0%, #8A4040 100%)', boxShadow: '0px 2px 8px rgba(186,90,90,0.3)' }}
      >
        Try Now
      </Link>
    </div>
  );
}
