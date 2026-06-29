/**
 * Protected route group layout
 * Wraps all protected pages with sidebar and navbar
 */
'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Home, Video, Mic, MessageSquare, FileText, Zap, Settings, Plus, LogOut, Menu, X, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ProtectedRoute } from '@/components/protected-route';
import { ModalProvider, GlobalModals, useModal } from '@/components/providers/modal-provider';
import { WsProvider } from '@/components/providers/ws-provider';
import { ROUTES } from '@/lib/routes';
import Link from 'next/link';

interface NavItem {
  label: string;
  icon: React.ComponentType<{ size: number }>;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', icon: Home, href: ROUTES.HOME },
  { label: 'Meetings', icon: Video, href: ROUTES.MEETINGS },
  { label: 'Webinars', icon: Mic, href: ROUTES.WEBINARS },
  { label: 'Chats', icon: MessageSquare, href: ROUTES.CHATS },
  { label: 'Transcripts', icon: FileText, href: ROUTES.TRANSCRIPTS },
  { label: 'Summaries', icon: Zap, href: ROUTES.SUMMARIES },
  { label: 'Settings', icon: Settings, href: ROUTES.SETTINGS },
];

function SidebarNavItem({ label, icon: Icon, href, isActive }: NavItem & { isActive: boolean }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-[10px] text-[13px] font-medium transition-all duration-150 text-left cursor-pointer"
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

  const userInitial = user?.name.charAt(0).toUpperCase() || 'U';

  const isNavItemActive = (href: string) => {
    const path = pathname.split('/').slice(2).join('/'); // Remove locale prefix
    return path.startsWith(href.replace(/^\//, ''));
  };

  return (
    <div className="min-h-dvh flex" style={{ background: '#E6F2DD' }}>
          {/* Sidebar */}
          <aside
            className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 w-60 flex flex-col shrink-0 transition-transform duration-300 lg:translate-x-0`}
            style={{ background: '#273338' }}
          >
            {/* Logo */}
            <div
              className="flex items-center gap-2.5 px-5 py-[18px] shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div
                className="w-7 h-7 rounded-[9px] flex items-center justify-center text-white text-xs font-semibold shrink-0"
                style={{ background: 'linear-gradient(135deg, #BA5A5A 0%, #8A4040 100%)' }}
              >
                R
              </div>
              <span className="font-semibold text-[15px] tracking-tight" style={{ color: '#FBF5DD' }}>
                Recallo
              </span>
            </div>

            {/* New Meeting Button */}
            <div className="px-4 py-4 shrink-0">
              <button
                onClick={() => openModal('create-room')}
                className="flex items-center justify-center gap-2 w-full h-9 rounded-[10px] text-[13px] font-medium text-white transition-all duration-200 hover:opacity-90 active:scale-[0.97] cursor-pointer"
                style={{ background: '#BA5A5A' }}
              >
                <Plus size={14} />
                New Meeting
              </button>
            </div>

            {/* Navigation */}
            <nav className="px-3 flex flex-col gap-0.5 flex-1 overflow-y-auto">
              <p
                className="px-3 pt-1 pb-2 text-[10px] font-semibold uppercase tracking-widest"
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
              <div className="px-4 py-4 flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0"
                  style={{ background: '#BA5A5A' }}
                >
                  {userInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate" style={{ color: '#FBF5DD' }}>
                    {user?.name || 'User'}
                  </p>
                  <p className="text-[11px] truncate" style={{ color: 'rgba(251,245,221,0.4)' }}>
                    Online
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    className="p-1.5 rounded-[8px] transition-all duration-200 hover:bg-white/10 cursor-pointer"
                    style={{ color: 'rgba(251,245,221,0.4)' }}
                    title="Notifications"
                  >
                    <Bell size={14} />
                  </button>
                  <button
                    onClick={() => void logout()}
                    className="p-1.5 rounded-[8px] transition-all duration-200 hover:bg-white/10 cursor-pointer"
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
              className="sticky top-0 z-30 px-4 py-3 lg:hidden flex items-center justify-between"
              style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.05)' }}
            >
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg transition-all hover:bg-gray-100"
              >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <span className="font-semibold" style={{ color: '#273338' }}>
                Recallo
              </span>
              <div className="w-8" />
            </div>

            {/* Page Content */}
            <div className="overflow-y-auto min-h-dvh">
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
