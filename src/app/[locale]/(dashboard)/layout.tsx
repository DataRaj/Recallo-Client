'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useAuth } from '@/hooks/use-auth';
import {
  LayoutDashboard,
  Users,
  Video,
  MessageSquare,
  Settings,
  LogOut,
  Loader2,
  Send,
  X,
  Plus,
  ChevronRight,
  Calendar,
  Bell,
} from 'lucide-react';

/* ─── Types ─── */
type Msg = { id: number; from: 'me' | 'them'; text: string; ts: string };

/* ─── Mock data ─── */
const MOCK_USERS = [
  { id: 1, name: 'Alex K.', initials: 'AK', online: true, color: '#BA5A5A' },
  { id: 2, name: 'Sarah M.', initials: 'SM', online: true, color: '#B0BA99' },
  { id: 3, name: 'Jordan D.', initials: 'JD', online: false, color: '#8D7A7A' },
];

const INIT_MSGS: Msg[] = [
  { id: 1, from: 'them', text: 'Hey! Are we still on for the standup?', ts: '10:41' },
  { id: 2, from: 'me', text: 'Yes, starting in 5 minutes 👍', ts: '10:42' },
];

/* ─── Nav items ─── */
const NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Meetings', icon: Video, href: '/dashboard' },
  { label: 'Schedule', icon: Calendar, href: '/dashboard' },
  { label: 'Participants', icon: Users, href: '/dashboard' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

const DM_LABEL = 'Direct Messages';

/* ─── Sidebar nav item ─── */
function NavItem({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-[10px] text-[13px] font-medium transition-all duration-150 text-left cursor-pointer"
      style={{
        background: active ? 'rgba(251,245,221,0.1)' : 'transparent',
        color: active ? '#FBF5DD' : 'rgba(251,245,221,0.5)',
      }}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isHydrated } = useCurrentUser();
  const { logout } = useAuth();
  const router = useRouter();

  const [activeNav, setActiveNav] = useState('Dashboard');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatUser, setChatUser] = useState(MOCK_USERS[0]!);
  const [msgs, setMsgs] = useState<Msg[]>(INIT_MSGS);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isHydrated && !user) router.replace('/login');
  }, [isHydrated, user, router]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, typing]);

  const sendMsg = () => {
    if (!input.trim()) return;
    const ts = new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
    setMsgs(m => [...m, { id: Date.now(), from: 'me', text: input, ts }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs(m => [...m, { id: Date.now() + 1, from: 'them', text: 'Got it! See you there.', ts }]);
    }, 1400);
  };

  /* ── Loading state ── */
  if (!isHydrated || isLoading) {
    return (
      <div
        className="min-h-dvh flex items-center justify-center"
        style={{ background: '#E6F2DD' }}
      >
        <div className="flex flex-col items-center gap-5">
          <div
            className="w-14 h-14 rounded-[16px] flex items-center justify-center text-white text-xl font-semibold"
            style={{ background: 'linear-gradient(135deg, #BA5A5A 0%, #8A4040 100%)' }}
          >
            R
          </div>
          <div className="flex flex-col items-center gap-2">
            <Loader2
              className="animate-spin"
              size={20}
              style={{ color: '#B0BA99' }}
            />
            <p
              className="text-sm font-medium"
              style={{ color: '#8D7A7A' }}
            >
              Loading your workspace...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const userInitial = user.name.charAt(0).toUpperCase();

  return (
    <div className="min-h-dvh flex" style={{ background: '#E6F2DD' }}>

      {/* ─── LEFT SIDEBAR ─── */}
      <aside
        className="w-60 flex flex-col fixed inset-y-0 left-0 z-30 shrink-0"
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

        {/* New Meeting CTA */}
        <div className="px-4 py-4 shrink-0">
          <button
            className="flex items-center justify-center gap-2 w-full h-9 rounded-[10px] text-[13px] font-medium text-white transition-all duration-200 hover:opacity-90 active:scale-[0.97] cursor-pointer"
            style={{ background: '#BA5A5A' }}
          >
            <Plus size={14} />
            New Meeting
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-3 flex flex-col gap-0.5 shrink-0">
          <p
            className="px-3 pt-1 pb-2 text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: 'rgba(251,245,221,0.3)' }}
          >
            Main
          </p>
          {NAV.map(item => (
            <NavItem
              key={item.label}
              label={item.label}
              icon={item.icon}
              active={activeNav === item.label}
              onClick={() => setActiveNav(item.label)}
            />
          ))}
        </nav>

        {/* DMs */}
        <div className="px-3 flex flex-col gap-0.5 flex-1 overflow-y-auto mt-4">
          <p
            className="px-3 pt-1 pb-2 text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: 'rgba(251,245,221,0.3)' }}
          >
            {DM_LABEL}
          </p>
          {MOCK_USERS.map(u => {
            const isActive = chatUser.id === u.id && chatOpen;
            return (
              <button
                key={u.id}
                onClick={() => {
                  setChatUser(u);
                  setChatOpen(true);
                  setActiveNav('Chat');
                }}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-[10px] text-[13px] transition-all duration-150 text-left cursor-pointer"
                style={{
                  background: isActive ? 'rgba(251,245,221,0.1)' : 'transparent',
                  color: isActive ? '#FBF5DD' : 'rgba(251,245,221,0.6)',
                }}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-semibold"
                    style={{ background: u.color }}
                  >
                    {u.initials}
                  </div>
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                    style={{
                      background: u.online ? '#9CC5A1' : 'rgba(255,255,255,0.15)',
                      borderColor: '#273338',
                    }}
                  />
                </div>
                <span className="truncate text-[13px]">{u.name}</span>
                {isActive && (
                  <ChevronRight
                    size={12}
                    className="ml-auto shrink-0"
                    style={{ color: 'rgba(251,245,221,0.25)' }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom: Chat + User */}
        <div className="shrink-0">
          {/* Chat shortcut */}
          <div className="px-3 pb-2">
            <button
              onClick={() => setChatOpen(o => !o)}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-[10px] text-[13px] font-medium transition-all duration-150 cursor-pointer"
              style={{
                background: chatOpen ? 'rgba(251,245,221,0.1)' : 'transparent',
                color: chatOpen ? '#FBF5DD' : 'rgba(251,245,221,0.5)',
              }}
            >
              <MessageSquare size={15} />
              Chat
              {chatOpen && (
                <span
                  className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse-dot"
                  style={{ background: '#9CC5A1' }}
                />
              )}
            </button>
          </div>

          {/* User profile */}
          <div
            className="flex items-center gap-2.5 px-4 py-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0"
              style={{ background: '#BA5A5A' }}
            >
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate" style={{ color: '#FBF5DD' }}>
                {user.name}
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
                onClick={logout}
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

      {/* ─── MAIN + CHAT ─── */}
      <div className="flex flex-1 ml-60 min-h-dvh">

        {/* Main content */}
        <main className="flex-1 overflow-y-auto min-h-dvh">
          {children}
        </main>

        {/* ─── CHAT PANE ─── */}
        {chatOpen && (
          <aside
            className="w-80 flex flex-col shrink-0 animate-slide-in-right"
            style={{
              background: '#273338',
              borderLeft: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {/* Chat header */}
            <div
              className="flex items-center justify-between px-4 py-4 shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center gap-2.5">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                    style={{ background: chatUser.color }}
                  >
                    {chatUser.initials}
                  </div>
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                    style={{ background: '#9CC5A1', borderColor: '#273338' }}
                  />
                </div>
                <div>
                  <p className="text-[13px] font-medium" style={{ color: '#FBF5DD' }}>
                    {chatUser.name}
                  </p>
                  <p className="text-[11px]" style={{ color: '#9CC5A1' }}>
                    Active now
                  </p>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="p-1.5 rounded-[8px] transition-all duration-200 hover:bg-white/10 cursor-pointer"
                style={{ color: 'rgba(251,245,221,0.4)' }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {/* Date separator */}
              <div className="flex items-center gap-2 my-1">
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <span className="text-[10px]" style={{ color: 'rgba(251,245,221,0.25)' }}>
                  Today
                </span>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              </div>

              {msgs.map(m => (
                <div
                  key={m.id}
                  className={`flex flex-col gap-1 ${m.from === 'me' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className="max-w-[78%] px-3.5 py-2.5 text-[13px] leading-relaxed"
                    style={{
                      borderRadius: m.from === 'me'
                        ? '14px 14px 4px 14px'
                        : '14px 14px 14px 4px',
                      background: m.from === 'me' ? '#BA5A5A' : '#3C4C52',
                      color: m.from === 'me' ? '#fff' : '#FBF5DD',
                    }}
                  >
                    {m.text}
                  </div>
                  <span className="text-[10px]" style={{ color: 'rgba(251,245,221,0.25)' }}>
                    {m.ts}
                  </span>
                </div>
              ))}

              {/* Typing indicator */}
              {typing && (
                <div className="flex items-start">
                  <div
                    className="px-3.5 py-3 flex items-center gap-1.5"
                    style={{ background: '#3C4C52', borderRadius: '14px 14px 14px 4px' }}
                  >
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full inline-block"
                        style={{
                          background: '#9CC5A1',
                          opacity: 0.7,
                          animation: `recallo-pulse-dot 1.4s ${delay}s ease-in-out infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              className="p-4 shrink-0"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div
                className="flex items-center gap-2 rounded-[12px] px-3.5 py-2.5"
                style={{ background: '#324147' }}
              >
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMsg()}
                  placeholder="Message..."
                  className="flex-1 bg-transparent text-[13px] focus:outline-none placeholder:opacity-40"
                  style={{ color: '#FBF5DD' }}
                />
                <button
                  onClick={sendMsg}
                  disabled={!input.trim()}
                  className="p-1.5 rounded-[8px] transition-all duration-200 disabled:opacity-40 active:scale-[0.9] cursor-pointer"
                  style={{ background: '#BA5A5A', color: '#fff' }}
                >
                  <Send size={12} />
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
