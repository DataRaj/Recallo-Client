import { ProtectedRoute } from '@/components/protected-route';
import { RecalloWordmark } from '@/components/recallo-wordmark';
import { Link } from '@/libs/i18n-navigation';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth={false}>
      <div
        data-theme="light"
        className="app-auth flex min-h-dvh flex-col"
        style={{ background: 'var(--color-bg)' }}
      >
        {/* Top bar */}
        <div className="px-6 py-5">
          <Link href="/" aria-label="Recallo home" className="inline-flex text-[var(--color-text-primary)]">
            <RecalloWordmark aria-hidden="true" />
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
