'use client';

import { useAuthStore } from '@/stores/use-auth-store';
import {
    Video,
    Users,
    Clock,
    FileText,
    Plus,
    ArrowRight,
    Mic,
    Calendar,
    TrendingUp,
} from 'lucide-react';

/* ─── Data ─── */
const STATS = [
    { label: 'Meetings This Month', value: '0', icon: Video, color: '#BA5A5A' },
    { label: 'Participants', value: '0', icon: Users, color: '#B0BA99' },
    { label: 'Hours Connected', value: '0h', icon: Clock, color: '#8D7A7A' },
    { label: 'Recordings', value: '0', icon: FileText, color: '#9CC5A1' },
];

const QUICK_ACTIONS = [
    {
        title: 'New Meeting',
        desc: 'Start an instant video call right now',
        icon: Video,
        accent: '#BA5A5A',
    },
    {
        title: 'Schedule Meeting',
        desc: 'Plan a session for a future time',
        icon: Calendar,
        accent: '#B0BA99',
    },
    {
        title: 'Host Webinar',
        desc: 'Broadcast to your audience at scale',
        icon: Mic,
        accent: '#8D7A7A',
    },
];

const RECENT: { label: string; time: string; participants: number }[] = [];

/* ─── Helpers ─── */
function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
}

/* ─── Component ─── */
export default function DashboardPage() {
    const user = useAuthStore(s => s.user);

    return (
        <div className="px-20 py-10 flex flex-col gap-8 w-full">

            {/* ── Welcome ── */}
            <div className="animate-fade-up">
                <p className="text-sm font-medium mb-1" style={{ color: '#B0BA99' }}>
                    {getGreeting()}
                </p>
                <h1
                    className="text-4xl font-semibold tracking-tight"
                    style={{ color: '#2C3E2D' }}
                >
                    {user?.name ?? 'Welcome'}
                </h1>
                <p className="mt-1.5 text-[15px]" style={{ color: '#8D7A7A' }}>
                    Your Recallo workspace is ready. Start or schedule a meeting.
                </p>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up" style={{ animationDelay: '0.05s' }}>
                {STATS.map(stat => (
                    <div
                        key={stat.label}
                        className="p-5 rounded-[16px] transition-all duration-200 hover:-translate-y-0.5 cursor-default"
                        style={{
                            background: '#F3F8EF',
                            border: '1px solid #D5E3CC',
                            boxShadow: '0px 2px 8px rgba(0,0,0,0.04)',
                        }}
                    >
                        <div
                            className="w-9 h-9 rounded-[10px] flex items-center justify-center mb-4"
                            style={{ background: `${stat.color}18`, color: stat.color }}
                        >
                            <stat.icon size={18} />
                        </div>
                        <p
                            className="text-[30px] font-semibold tracking-tight leading-none mb-1.5"
                            style={{ color: '#2C3E2D' }}
                        >
                            {stat.value}
                        </p>
                        <p className="text-xs leading-tight" style={{ color: '#8D7A7A' }}>
                            {stat.label}
                        </p>
                    </div>
                ))}
            </div>

            {/* ── Quick Actions ── */}
            <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
                <h2 className="text-base font-semibold mb-4" style={{ color: '#2C3E2D' }}>
                    Quick Actions
                </h2>
                <div className="grid sm:grid-cols-3 gap-4">
                    {QUICK_ACTIONS.map(action => (
                        <button
                            key={action.title}
                            className="group p-5 rounded-[16px] text-left transition-all duration-200 hover:-translate-y-0.5 flex flex-col gap-4 cursor-pointer"
                            style={{
                                background: '#F3F8EF',
                                border: '1px solid #D5E3CC',
                                boxShadow: '0px 2px 8px rgba(0,0,0,0.04)',
                            }}
                        >
                            <div
                                className="w-10 h-10 rounded-[12px] flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                                style={{ background: `${action.accent}18`, color: action.accent }}
                            >
                                <action.icon size={20} />
                            </div>
                            <div>
                                <p className="font-semibold text-[13px]" style={{ color: '#2C3E2D' }}>
                                    {action.title}
                                </p>
                                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#8D7A7A' }}>
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
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold" style={{ color: '#2C3E2D' }}>
                        Recent Activity
                    </h2>
                    <button
                        className="text-xs font-medium hover:underline transition-colors"
                        style={{ color: '#BA5A5A' }}
                    >
                        View all
                    </button>
                </div>

                {RECENT.length === 0
                    ? (
                        <div
                            className="rounded-[16px] py-16 flex flex-col items-center justify-center text-center"
                            style={{
                                background: '#F3F8EF',
                                border: '1px dashed #D5E3CC',
                            }}
                        >
                            <div
                                className="w-12 h-12 rounded-[14px] flex items-center justify-center mb-4"
                                style={{ background: 'rgba(176,186,153,0.18)', color: '#B0BA99' }}
                            >
                                <TrendingUp size={22} />
                            </div>
                            <p className="font-medium mb-1.5" style={{ color: '#2C3E2D' }}>
                                No meetings yet
                            </p>
                            <p className="text-sm max-w-xs" style={{ color: '#8D7A7A' }}>
                                Start your first meeting to see your activity here.
                            </p>
                            <button
                                className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-sm font-medium text-white transition-all duration-200 hover:opacity-90 active:scale-[0.97]"
                                style={{ background: 'linear-gradient(135deg, #BA5A5A 0%, #8A4040 100%)' }}
                            >
                                <Plus size={14} />
                                New Meeting
                            </button>
                        </div>
                    )
                    : (
                        <div className="flex flex-col gap-2">
                            {RECENT.map((item, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-4 p-4 rounded-[12px] transition-all duration-150 hover:bg-[#DDEBD5] cursor-default"
                                    style={{
                                        background: '#F3F8EF',
                                        border: '1px solid #D5E3CC',
                                    }}
                                >
                                    <div
                                        className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                                        style={{ background: 'rgba(186,90,90,0.1)', color: '#BA5A5A' }}
                                    >
                                        <Video size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate" style={{ color: '#2C3E2D' }}>
                                            {item.label}
                                        </p>
                                        <p className="text-xs" style={{ color: '#8D7A7A' }}>
                                            {item.time} · {item.participants} participants
                                        </p>
                                    </div>
                                    <ArrowRight size={14} style={{ color: '#B0BA99' }} />
                                </div>
                            ))}
                        </div>
                    )}
            </div>
        </div>
    );
}
