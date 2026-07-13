import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { UserMenu } from '@/components/user-menu';

export default async function MarketingLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Docs', href: '#docs' },
    { label: 'Blog', href: '#blog' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#E6F2DD' }}>
      {/* ── Floating Navbar ── */}
      <div className="sticky top-4 z-50 px-10">
        <header className="mx-auto max-h-full">
          <nav
            className="flex items-center justify-between rounded-[18px] px-5 py-2"
            style={{
              background: 'rgba(255,255,255,0.72)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(213,227,204,0.85)',
              boxShadow: '0px 4px 24px rgba(0,0,0,0.06), 0px 1px 0px rgba(255,255,255,0.6) inset',
            }}
          >
            {/* Logo */}
            <Link href="/" className="group flex shrink-0 items-center gap-2.5">
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

            {/* Nav Links */}
            <div className="hidden items-center gap-0.5 md:flex">
              {navLinks.map(link => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="rounded-[10px] px-3.5 py-2 text-sm font-medium text-[#8D7A7A] transition-all duration-200 hover:bg-[#DDEBD5] hover:text-[#2C3E2D]"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* CTA */}
            <UserMenu />
          </nav>
        </header>
      </div>

      {/* Main */}
      <main>{props.children}</main>

      {/* Footer */}
      <footer
        className="mt-24 border-t py-10"
        style={{ borderColor: '#D5E3CC' }}
      >
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <Link href="/" className="group flex items-center gap-2">
            <div
              className="flex size-6 items-center justify-center rounded-[8px] text-[11px] font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #BA5A5A 0%, #8A4040 100%)' }}
            >
              R
            </div>
            <span className="text-sm font-medium" style={{ color: '#2C3E2D' }}>
              Recallo
            </span>
          </Link>

          <p className="text-sm" style={{ color: '#8D7A7A' }}>
            ©
            {' '}
            {new Date().getFullYear()}
            {' '}
            Recallo — Private, fast, beautiful video communication.
          </p>

          <div className="flex items-center gap-5">
            {['Privacy', 'Terms', 'Status', 'Contact'].map(l => (
              <Link
                key={l}
                href="#"
                className="text-sm transition-colors duration-200 hover:text-[#2C3E2D]"
                style={{ color: '#8D7A7A' }}
              >
                {l}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
