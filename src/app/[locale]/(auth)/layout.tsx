import Link from 'next/link';
import { ProtectedRoute } from '@/components/protected-route';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth={false}>
      <div
        data-theme="light"
        className="flex min-h-dvh flex-col"
        style={{ background: 'var(--color-bg)' }}
      >
        {/* Top bar */}
        <div className="px-6 py-5">
          <Link href="/" className="group inline-flex items-center gap-2">
            <div
              className="flex size-7 items-center justify-center rounded-[9px] text-xs font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #BA5A5A 0%, #8A4040 100%)' }}
            >
              R
            </div>
            <span
              className="text-[15px] font-semibold tracking-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Recallo
            </span>
          </Link>
        </div>

        {/* Content */}
        <main className="flex flex-1 items-center justify-center p-6">
          {children}
        </main>

        {/* Bottom */}
        <div className="px-6 py-5 text-center">
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            ©
            {' '}
            {new Date().getFullYear()}
            {' '}
            Recallo. All rights reserved.
            {' · '}
            <Link href="#" className="hover:underline">Privacy</Link>
            {' · '}
            <Link href="#" className="hover:underline">Terms</Link>
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
