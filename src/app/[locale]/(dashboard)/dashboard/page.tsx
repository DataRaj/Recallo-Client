'use client';

import {
  ArrowRight,
  Calendar,
  Clock,
  FileText,
  Mic,
  Plus,
  TrendingUp,
  Users,
  Video,
} from 'lucide-react';
import Link from 'next/link';
import { useRecentRooms } from '@/hooks/use-recent-rooms';
import { ROUTES } from '@/lib/routes';
import { useAuthStore } from '@/stores/use-auth-store';

const QUICK_ACTIONS = [
  {
    title: 'New Meeting',
    desc: 'Start an instant video call right now',
    icon: Video,
    accent: 'var(--color-text-accent)',
  },
  {
    title: 'Schedule Meeting',
    desc: 'Plan a session for a future time',
    icon: Calendar,
    accent: 'var(--color-accent)',
  },
  {
    title: 'Host Webinar',
    desc: 'Broadcast to your audience at scale',
    icon: Mic,
    accent: 'var(--color-text-secondary)',
  },
];

/* ─── Helpers ─── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) {
    return 'Good morning';
  }
  if (h < 17) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

function relativeTime(ms: number): string {
  const mins = Math.round((Date.now() - ms) / 60000);
  if (mins < 1) {
    return 'just now';
  }
  if (mins < 60) {
    return `${mins}m ago`;
  }
  const hours = Math.round(mins / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.round(hours / 24);
  return days === 1 ? 'yesterday' : `${days}d ago`;
}

/* ─── Component ─── */
export default function DashboardPage() {
  const user = useAuthStore(s => s.user);
  const recentRooms = useRecentRooms();

  const now = new Date();
  const meetingsThisMonth = recentRooms.filter((r) => {
    const d = new Date(r.at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const STATS = [
    { label: 'Meetings This Month', value: String(meetingsThisMonth), icon: Video, color: 'var(--color-text-accent)' },
    { label: 'Participants', value: '0', icon: Users, color: 'var(--color-accent)' },
    { label: 'Hours Connected', value: '0h', icon: Clock, color: 'var(--color-text-secondary)' },
    { label: 'Recordings', value: '0', icon: FileText, color: 'var(--color-chat-accent)' },
  ];

  return (
    <div className="flex w-full flex-col gap-8 px-20 py-10">

      {/* ── Welcome ── */}
      <div className="animate-fade-up">
        <p className="mb-1 text-sm font-medium" style={{ color: 'var(--color-accent)' }}>
          {getGreeting()}
        </p>
        <h1
          className="text-4xl font-semibold tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {user?.name ?? 'Welcome'}
        </h1>
        <p className="mt-1.5 text-[15px]" style={{ color: 'var(--color-text-secondary)' }}>
          Your Recallo workspace is ready. Start or schedule a meeting.
        </p>
      </div>

      {/* ── Stats ── */}
      <div className="animate-fade-up grid grid-cols-2 gap-4 lg:grid-cols-4" style={{ animationDelay: '0.05s' }}>
        {STATS.map(stat => (
          <div
            key={stat.label}
            className="cursor-default rounded-[16px] p-5 transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: '0px 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <div
              className="mb-4 flex size-9 items-center justify-center rounded-[10px]"
              style={{ background: `${stat.color}18`, color: stat.color }}
            >
              <stat.icon size={18} />
            </div>
            <p
              className="mb-1.5 text-[30px] leading-none font-semibold tracking-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {stat.value}
            </p>
            <p className="text-xs leading-tight" style={{ color: 'var(--color-text-secondary)' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="mb-4 text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {QUICK_ACTIONS.map(action => (
            <button
              key={action.title}
              className="group flex cursor-pointer flex-col gap-4 rounded-[16px] p-5 text-left transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                boxShadow: '0px 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <div
                className="flex size-10 items-center justify-center rounded-[12px] transition-transform duration-200 group-hover:scale-110"
                style={{ background: `${action.accent}18`, color: action.accent }}
              >
                <action.icon size={20} />
              </div>
              <div>
                <p className="text-[13px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {action.title}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {action.desc}
                </p>
              </div>
              <ArrowRight
                size={15}
                className="transition-transform duration-200 group-hover:translate-x-1"
                style={{ color: action.accent }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div className="animate-fade-up" style={{ animationDelay: '0.15s' }}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Recent Activity
          </h2>
          <button
            className="text-xs font-medium transition-colors hover:underline"
            style={{ color: 'var(--color-text-accent)' }}
          >
            View all
          </button>
        </div>

        {recentRooms.length === 0
          ? (
              <div
                className="flex flex-col items-center justify-center rounded-[16px] py-16 text-center"
                style={{
                  background: 'var(--color-surface)',
                  border: '1px dashed var(--color-border)',
                }}
              >
                <div
                  className="mb-4 flex size-12 items-center justify-center rounded-[14px]"
                  style={{ background: 'rgba(176,186,153,0.18)', color: 'var(--color-accent)' }}
                >
                  <TrendingUp size={22} />
                </div>
                <p className="mb-1.5 font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  No meetings yet
                </p>
                <p className="max-w-xs text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Start your first meeting to see your activity here.
                </p>
                <button
                  className="mt-6 flex items-center gap-2 rounded-[10px] px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:opacity-90 active:scale-[0.97]"
                  style={{ background: 'linear-gradient(135deg, #BA5A5A 0%, #8A4040 100%)' }}
                >
                  <Plus size={14} />
                  New Meeting
                </button>
              </div>
            )
          : (
              <div className="flex flex-col gap-2">
                {recentRooms.map(item => (
                  <Link
                    key={item.id}
                    href={item.type === 'webinar' ? ROUTES.WEBINAR_DETAIL(item.id) : ROUTES.MEETING_DETAIL(item.id)}
                    className="group flex items-center gap-4 rounded-[12px] p-4 transition-all duration-150 hover:bg-[var(--color-surface-hover)]"
                    style={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <div
                      className="flex size-9 shrink-0 items-center justify-center rounded-[10px]"
                      style={{ background: 'rgba(186,90,90,0.1)', color: '#BA5A5A' }}
                    >
                      {item.type === 'webinar' ? <Mic size={16} /> : <Video size={16} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {item.title || `Room ${item.id}`}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {item.role === 'host' ? 'Hosted' : 'Joined'}
                        {' '}
                        ·
                        {relativeTime(item.at)}
                      </p>
                    </div>
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" style={{ color: 'var(--color-accent)' }} />
                  </Link>
                ))}
              </div>
            )}
      </div>
    </div>
  );
}
