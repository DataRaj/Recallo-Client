'use client';

import { ArrowUpRight, ChevronDown, Plus } from 'lucide-react';
import { createContext, use, useCallback, useEffect, useRef, useState } from 'react';
import { CreateRoomModal } from '@/components/modals/create-room-modal';
import { JoinRoomModal } from '@/components/modals/join-room-modal';
import { useAuth } from '@/hooks/use-auth';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ROUTES } from '@/lib/routes';
import { Link } from '@/libs/i18n-navigation';

type ActionsContext = {
  signedIn: boolean;
  openCreate: () => void;
  openJoin: () => void;
};

const Context = createContext<ActionsContext | null>(null);

export function MarketingActionsProvider({ children }: { children: React.ReactNode }) {
  const { user, isHydrated } = useCurrentUser();
  const [modal, setModal] = useState<'create' | 'join' | null>(null);
  const close = useCallback(() => setModal(null), []);
  const openCreate = useCallback(() => setModal('create'), []);
  const openJoin = useCallback(() => setModal('join'), []);

  return (
    <Context value={{ signedIn: isHydrated && !!user, openCreate, openJoin }}>
      {children}
      {modal === 'create' && <CreateRoomModal isOpen onClose={close} instantOnly />}
      {modal === 'join' && <JoinRoomModal isOpen onClose={close} />}
    </Context>
  );
}

function useActions() {
  const context = use(Context);
  if (!context) {
    throw new Error('Marketing actions require MarketingActionsProvider');
  }
  return context;
}

export function CreateRoomAction({ compact = false }: { compact?: boolean }) {
  const { signedIn, openCreate } = useActions();
  const className = `mk-button mk-button-primary${compact ? ' mk-button-compact' : ''}`;
  const content = (
    <>
      <Plus size={16} aria-hidden="true" />
      Create a room
    </>
  );
  return signedIn
    ? <button type="button" className={className} onClick={openCreate}>{content}</button>
    : <Link href={ROUTES.REGISTER} className={className}>{content}</Link>;
}

export function JoinMeetingAction({ textOnly = false }: { textOnly?: boolean }) {
  const { openJoin } = useActions();
  return (
    <button type="button" className={textOnly ? 'mk-text-action' : 'mk-button mk-button-secondary'} onClick={openJoin}>
      Join a meeting
      <ArrowUpRight size={16} aria-hidden="true" />
    </button>
  );
}

export function AccountLink({ onClick }: { onClick?: () => void }) {
  const { signedIn } = useActions();
  return <Link className="mk-account-link" href={signedIn ? ROUTES.HOME : ROUTES.LOGIN} onClick={onClick}>{signedIn ? 'Dashboard' : 'Sign in'}</Link>;
}

/** Keep dashboard, settings, appearance and logout available on the public page. */
export function AccountNavigation() {
  const { signedIn } = useActions();
  const { logout } = useAuth();
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !detailsRef.current?.contains(event.target) && detailsRef.current) {
        detailsRef.current.open = false;
      }
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && detailsRef.current && !document.querySelector('dialog[open]')) {
        detailsRef.current.open = false;
        detailsRef.current.querySelector('summary')?.focus();
      }
    };
    document.addEventListener('pointerdown', onOutside);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('pointerdown', onOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, [open]);

  if (!signedIn) {
    return <AccountLink />;
  }
  const close = () => {
    if (detailsRef.current) {
      detailsRef.current.open = false;
    }
  };

  return (
    <details className="mk-account" ref={detailsRef} onToggle={event => setOpen(event.currentTarget.open)}>
      <summary className="mk-account-summary">
        Account
        <ChevronDown size={14} aria-hidden="true" />
      </summary>
      <div className="mk-account-options">
        <Link href={ROUTES.HOME} onClick={close}>Dashboard</Link>
        <Link href={ROUTES.SETTINGS} onClick={close}>Settings</Link>
        <Link href={`${ROUTES.SETTINGS}#appearance`} onClick={close}>Appearance</Link>
        <button
          type="button"
          onClick={() => {
            close();
            // The existing logout hook clears local auth and redirects even if its request fails.
            void logout().catch(() => undefined);
          }}
        >
          Sign out
        </button>
      </div>
    </details>
  );
}

export function ActionPair({ helper = false }: { helper?: boolean }) {
  const { signedIn } = useActions();
  return (
    <div>
      <div className="mk-actions">
        <CreateRoomAction />
        <JoinMeetingAction />
      </div>
      {helper && (
        <p className="mk-caption mk-action-helper">
          {signedIn ? 'Start a conversation or join one you’ve been invited to.' : 'Create an account to start. Join with your room ID or link.'}
        </p>
      )}
    </div>
  );
}
