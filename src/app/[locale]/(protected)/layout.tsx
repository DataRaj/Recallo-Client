/**
 * Protected route group layout
 * Wraps all protected pages with sidebar and navbar
 */
'use client';

import { Bell, FileText, Home, LogOut, Menu, MessageSquare, Mic, Plus, Settings, Video, X, Zap } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { GlobalModals, ModalProvider, useModal } from '@/components/providers/modal-provider';
import { WsProvider } from '@/components/providers/ws-provider';
import { useAuth } from '@/hooks/use-auth';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ROUTES } from '@/lib/routes';

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
  const path = pathname.replace(/^\/[a-z]{2}(-[a-z]{2})?(?=\/|$)/i, '') || '/';
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

function SidebarNavItem({ label, icon: Icon, href, isActive }: NavItem & { isActive: boolean }) {
  return (
    <Link
      href={href}
      className="flex w-full cursor-pointer items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-[13px] font-medium transition-all duration-150"
      style={{
        background: isActive ? 'rgba(251,245,221,0.1)' : 'transparent',
        color: isActive ? '#FBF5DD' : 'rgba(251,245,221,0.5)',
      }}
    >
      <Icon size={15} />
      {label}
    </Link>
  );
}

function ProtectedLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { openModal } = useModal();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isSidebarOpen]);

  const userInitial = user?.name.charAt(0).toUpperCase() || 'U';
  const feature = featureForPath(pathname);

  const isNavItemActive = (href: string) => {
    const path = pathname.split('/').slice(2).join('/'); // Remove locale prefix
    return path.startsWith(href.replace(/^\//, ''));
  };

  return (
    <div className="flex min-h-dvh" style={{ background: 'var(--color-bg)' }}>
      {/* Sidebar */}
      <aside
        className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 flex w-60 shrink-0 flex-col transition-transform duration-300 lg:translate-x-0`}
        style={{ background: '#273338' }}
      >
        {/* Logo */}
        <div
          className="flex shrink-0 items-center gap-2.5 px-5 py-[18px]"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div
            className="flex size-7 shrink-0 items-center justify-center rounded-[9px] text-xs font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #BA5A5A 0%, #8A4040 100%)' }}
          >
            R
          </div>
          <span className="text-[15px] font-semibold tracking-tight" style={{ color: '#FBF5DD' }}>
            Recallo
          </span>
        </div>

        {/* New Meeting Button */}
        <div className="shrink-0 p-4">
          <button
            onClick={() => openModal('create-room')}
            className="flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] text-[13px] font-medium text-white transition-all duration-200 hover:opacity-90 active:scale-[0.97]"
            style={{ background: '#BA5A5A' }}
          >
            <Plus size={14} />
            New Meeting
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3">
          <p
            className="px-3 pt-1 pb-2 text-[10px] font-semibold tracking-widest uppercase"
            style={{ color: 'rgba(251,245,221,0.3)' }}
          >
            Main
          </p>
          {NAV_ITEMS.map(item => (
            <SidebarNavItem
              key={item.label}
              {...item}
              isActive={isNavItemActive(item.href)}
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
              style={{ background: '#BA5A5A' }}
            >
              {userInitial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium" style={{ color: '#FBF5DD' }}>
                {user?.name || 'User'}
              </p>
              <p className="truncate text-[11px]" style={{ color: 'rgba(251,245,221,0.4)' }}>
                Online
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                className="cursor-pointer rounded-[8px] p-1.5 transition-all duration-200 hover:bg-white/10"
                style={{ color: 'rgba(251,245,221,0.4)' }}
                title="Notifications"
              >
                <Bell size={14} />
              </button>
              <button
                onClick={() => void logout()}
                className="cursor-pointer rounded-[8px] p-1.5 transition-all duration-200 hover:bg-white/10"
                style={{ color: 'rgba(251,245,221,0.4)' }}
                title="Sign out"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-60">
        {/* Top Bar with Mobile Toggle */}
        <div
          className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 lg:hidden"
          style={{ background: '#1C2A2C', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="rounded-lg p-2 transition-all hover:bg-white/10"
            style={{ color: 'rgba(251,245,221,0.7)' }}
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="font-semibold" style={{ color: '#FBF5DD' }}>
            Recallo
          </span>
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
        <div
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
