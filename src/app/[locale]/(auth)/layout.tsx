import Link from 'next/link';
import { ProtectedRoute } from '@/components/protected-route';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth={false}>
      <div
        className="flex min-h-dvh flex-col"
        style={{ background: '#E6F2DD' }}
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
              style={{ color: '#2C3E2D' }}
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
          <p className="text-xs" style={{ color: '#8D7A7A' }}>
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
