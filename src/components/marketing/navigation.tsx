'use client';

import { Menu, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { RecalloWordmark } from '@/components/recallo-wordmark';
import { Link } from '@/libs/i18n-navigation';
import { AccountNavigation, CreateRoomAction, JoinMeetingAction } from './actions';
import { marketingLinks } from './example';

export function MarketingNavigation() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !document.querySelector('dialog[open]')) {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [open]);

  return (
    <header className="mk-header mk-container">
      <div className="mk-header-bar">
        <Link href="/" className="mk-brand" aria-label="Recallo home">
          <RecalloWordmark aria-hidden="true" />
        </Link>
        <nav className="mk-desktop-nav" aria-label="Main navigation">
          {marketingLinks.map(link => <a key={link.href} href={link.href}>{link.label}</a>)}
        </nav>
        <div className="mk-desktop-actions">
          <AccountNavigation />
          <JoinMeetingAction textOnly />
          <CreateRoomAction compact />
        </div>
        <div className="mk-compact-actions">
          <JoinMeetingAction textOnly />
          <button
            ref={trigger}
            type="button"
            className="mk-menu-toggle"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? 'Close navigation' : 'Open navigation'}
            onClick={() => setOpen(value => !value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setOpen(false);
              }
            }}
          >
            {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>
      <nav
        id={menuId}
        className="mk-mobile-nav"
        aria-label="Mobile navigation"
        hidden={!open}
      >
        {marketingLinks.map(link => <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>)}
        <AccountNavigation />
        <div className="mk-mobile-create"><CreateRoomAction /></div>
      </nav>
    </header>
  );
}
