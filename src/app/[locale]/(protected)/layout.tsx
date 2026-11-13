/**
 * Protected route group layout
 * Wraps all protected pages with sidebar and navbar
 */
'use client';

import { motion } from 'framer-motion';

import { Bell, FileText, Home, LogOut, Menu, MessageSquare, Mic, Plus, Settings, Video, X, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { GlobalModals, ModalProvider, useModal } from '@/components/providers/modal-provider';
import { WsProvider } from '@/components/providers/ws-provider';
import { RecalloWordmark } from '@/components/recallo-wordmark';
import { useAuth } from '@/hooks/use-auth';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { ROUTES } from '@/lib/routes';
import { Link, usePathname } from '@/libs/i18n-navigation';

type NavItem = {
  label: string;
  icon: React.ComponentType<{ size: number }>;
  href: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', icon: Home, href: ROUTES.HOME },
  { label: 'Meetings', icon: Video, href: ROUTES.MEETINGS },
  { label: 'Webinars', icon: Mic, href: ROUTES.WEBINARS },
  { label: 'Chats', icon: MessageSquare, href: ROUTES.CHATS },
  { label: 'Transcripts', icon: FileText, href: ROUTES.TRANSCRIPTS },
  { label: 'Summaries', icon: Zap, href: ROUTES.SUMMARIES },
  { label: 'Settings', icon: Settings, href: ROUTES.SETTINGS },
];

type Feature = 'dashboard' | 'meeting' | 'chat' | 'archive';

/** Map the active pathname (locale-stripped) to a feature theme atmosphere. */
function featureForPath(pathname: string): Feature {
  const path = pathname.replace(/^\/[a-z]{2}(?:-[a-z]{2})?(?=\/|$)/i, '') || '/';
  if (path.startsWith('/chat')) {
    return 'chat';
  }
  if (path.startsWith('/meetings') || path.startsWith('/webinars')) {
    return 'meeting';
  }
  if (path.startsWith('/transcripts') || path.startsWith('/summaries')) {
    return 'archive';
  }
  return 'dashboard';
}

function SidebarNavItem({ label, icon: Icon, href, isActive, onNavigate }: NavItem & { isActive: boolean; onNavigate: () => void }) {
  const reducedMotion = useReducedMotion();
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={isActive ? 'page' : undefined}
      className="relative isolate flex w-full cursor-pointer items-center gap-3 rounded-[6px] px-3 py-2.5 text-left text-[13px] font-medium transition-all duration-150"
      style={{
        color: isActive ? 'var(--color-brand-ink)' : 'var(--color-chat-text-2)',
      }}
    >
      {isActive && <motion.span layoutId="app-active-navigation" className="absolute inset-0 -z-10 rounded-[6px] bg-[var(--color-brand)]" transition={{ duration: reducedMotion ? 0 : 0.2, ease: 'easeOut' }} />}
      <Icon size={15} />
      {label}
    </Link>
  );
}

function ProtectedLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const sidebarRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const { openModal } = useModal();

  const isSidebarOpenRef = useRef(isSidebarOpen);
  useEffect(() => {
    isSidebarOpenRef.current = isSidebarOpen;
  }, [isSidebarOpen]);

  useEffect(() => {
    if (!isSidebarOpen || isDesktop) {
      return;
    }
    const panel = sidebarRef.current;
    const toggle = menuRef.current;
    const controls = panel?.querySelectorAll<HTMLElement>('a[href], button:not(:disabled)');
    controls?.[0]?.focus();
    const containFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || controls == null || controls.length === 0) {
        return;
      }
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    panel?.addEventListener('keydown', containFocus);
    return () => {
      panel?.removeEventListener('keydown', containFocus);
      toggle?.focus();
    };
  }, [isSidebarOpen, isDesktop]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Never intercept keyboard events when the user is typing in an input.
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        return;
      }
      if (e.key === 'Escape' && isSidebarOpenRef.current) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
    // Run once on mount — the ref keeps the sidebar state fresh.
  }, []);

  const userInitial = user?.name.charAt(0).toUpperCase() ?? 'U';
  const feature = featureForPath(pathname);

  const isNavItemActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="app-shell flex min-h-dvh" style={{ background: 'var(--color-bg)' }}>
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        id="application-navigation"
        aria-label="Application navigation"
        inert={!isSidebarOpen && !isDesktop}
        className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 flex w-60 shrink-0 flex-col transition-transform duration-300 lg:translate-x-0`}
        style={{ background: 'var(--color-chat-bg)' }}
      >
        {/* Logo */}
        <div
          className="flex shrink-0 items-center gap-2.5 px-5 py-[18px]"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <RecalloWordmark className="app-brand-wordmark" />
          <button type="button" aria-label="Close navigation" onClick={() => setIsSidebarOpen(false)} className="ml-auto p-2 text-[var(--color-chat-text)] lg:hidden"><X size={18} /></button>
        </div>

        {/* New Meeting Button */}
        <div className="shrink-0 p-4">
          <button
            onClick={() => openModal('create-room')}
            className="flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] text-[13px] font-medium text-white transition-all duration-200 hover:opacity-90 active:scale-[0.97]"
            style={{ background: 'var(--color-action)' }}
          >
            <Plus size={14} />
            New Meeting
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3">
          <p
            className="px-3 pt-1 pb-2 text-[10px] font-semibold tracking-widest uppercase"
            style={{ color: 'var(--color-chat-text-2)' }}
          >
            Main
          </p>
          {NAV_ITEMS.map(item => (
            <SidebarNavItem
              key={item.label}
              {...item}
              isActive={isNavItemActive(item.href)}
              onNavigate={() => setIsSidebarOpen(false)}
            />
          ))}
        </nav>

        {/* Bottom: User Profile */}
        <div
          className="shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-2.5 p-4">
            <div
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ background: 'var(--color-action)' }}
            >
              {userInitial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium" style={{ color: 'var(--color-chat-text)' }}>
                {user?.name ?? 'User'}
              </p>
              <p className="truncate text-[11px]" style={{ color: 'var(--color-chat-text-2)' }}>
                Online
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                className="cursor-pointer rounded-[8px] p-1.5 transition-all duration-200 hover:bg-white/10"
                style={{ color: 'var(--color-chat-text-2)' }}
                title="Notifications"
              >
                <Bell size={14} />
              </button>
              <button
                onClick={() => void logout()}
                className="cursor-pointer rounded-[8px] p-1.5 transition-all duration-200 hover:bg-white/10"
                style={{ color: 'var(--color-chat-text-2)' }}
                title="Sign out"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-w-0 flex-1 lg:ml-60" inert={isSidebarOpen && !isDesktop}>
        {/* Top Bar with Mobile Toggle */}
        <div
          className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 lg:hidden"
          style={{ background: 'var(--color-room-surface)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <button
            ref={menuRef}
            aria-controls="application-navigation"
            aria-label={isSidebarOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={isSidebarOpen}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="rounded-lg p-2 transition-all hover:bg-white/10"
            style={{ color: 'var(--color-chat-text-2)' }}
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <RecalloWordmark className="app-brand-wordmark" />
          <div className="w-8" />
        </div>

        {/* Page Content — feature attribute diverts the theme atmosphere */}
        <div
          data-feature={feature}
          className="min-h-dvh overflow-y-auto"
          style={{ background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}
        >
          {children}
        </div>
      </main>

      {/* Modals */}
      <GlobalModals />

      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <ModalProvider>
        <WsProvider>
          <ProtectedLayoutContent>
            {children}
          </ProtectedLayoutContent>
        </WsProvider>
      </ModalProvider>
    </ProtectedRoute>
  );
}
