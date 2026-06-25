import Link from 'next/link';
import { ProtectedRoute } from '@/components/protected-route';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth={false}>
      <div
        className="min-h-dvh flex flex-col"
        style={{ background: '#E6F2DD' }}
      >
        {/* Top bar */}
        <div className="py-5 px-6">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div
              className="w-7 h-7 rounded-[9px] flex items-center justify-center text-white text-xs font-semibold"
              style={{ background: 'linear-gradient(135deg, #BA5A5A 0%, #8A4040 100%)' }}
            >
              R
            </div>
            <span
              className="font-semibold text-[15px] tracking-tight"
              style={{ color: '#2C3E2D' }}
            >
              Recallo
            </span>
          </Link>
        </div>

        {/* Content */}
        <main className="flex-1 flex items-center justify-center p-6">
          {children}
        </main>

        {/* Bottom */}
        <div className="py-5 px-6 text-center">
          <p className="text-xs" style={{ color: '#8D7A7A' }}>
            © {new Date().getFullYear()} Recallo. All rights reserved.
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
