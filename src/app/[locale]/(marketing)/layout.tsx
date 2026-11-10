import { setRequestLocale } from 'next-intl/server';
import { AccountLink, MarketingActionsProvider } from '@/components/marketing/actions';
import { marketingDisplay, marketingSans } from '@/components/marketing/fonts';
import { MarketingNavigation } from '@/components/marketing/navigation';
import { Link } from '@/libs/i18n-navigation';
import '@/styles/marketing.css';

export default async function MarketingLayout({ children, params }: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div data-theme="light" lang="en" className={`recallo-marketing ${marketingDisplay.variable} ${marketingSans.variable}`}>
      <MarketingActionsProvider>
        <a className="mk-skip-link" href="#marketing-main">Skip to content</a>
        <MarketingNavigation />
        <main id="marketing-main" tabIndex={-1}>{children}</main>
        <footer className="mk-footer mk-container">
          <div>
            <Link href="/" className="mk-brand">
              <span className="mk-brand-mark" aria-hidden="true">R</span>
              Recallo
            </Link>
            <p>Meetings, with context to return to.</p>
          </div>
          <nav aria-label="Footer navigation">
            <a href="#how-it-works">How it works</a>
            <a href="#the-record">The record</a>
            <AccountLink />
          </nav>
          <span className="mk-copyright">
            ©
            {new Date().getFullYear()}
            {' '}
            Recallo
          </span>
        </footer>
      </MarketingActionsProvider>
    </div>
  );
}
