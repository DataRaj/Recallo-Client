'use client';

import { useState, useEffect, use } from 'react';
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    MonitorUp,
    MessageSquare,
    Users,
    Settings,
    PhoneOff,
    Hand,
    Disc3,
    MoreHorizontal,
    Maximize2,
    Signal,
    Wifi,
    X,
    FileText,
    Zap,
    MessageCircle,
    Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ROUTES } from '@/lib/routes';
import { getRoom, getRoomToken, extendRoomSession, endRoom } from '@/services/room-service';
import { getOrCreateGuestId } from '@/utils/guest';
import type { Room } from '@/types/room';

type PageProps = {
  params: Promise<{
    roomId: string;
    locale: string;
  }>;
};

/* ─── Mock participants ─── */
const PARTICIPANTS = [
    { id: 1, initials: 'AK', name: 'Alex K.', speaking: true, video: true, color: '#BA5A5A' },
    { id: 2, initials: 'SM', name: 'Sarah M.', speaking: false, video: true, color: '#B0BA99' },
    { id: 3, initials: 'JD', name: 'Jordan D.', speaking: false, video: false, color: '#8D7A7A' },
    { id: 4, initials: 'ME', name: 'You', speaking: false, video: true, color: '#9CC5A1', isYou: true },
];

/* ─── Chat messages ─── */
const CHAT_MSGS = [
    {
        id: 1,
        from: 'Alex K.',
        text: 'Can everyone see my screen?',
        ts: '10:42',
        initials: 'AK',
        color: '#BA5A5A',
    },
    {
        id: 2,
        from: 'Sarah M.',
        text: 'Yes! Looks great 👍',
        ts: '10:42',
        initials: 'SM',
        color: '#B0BA99',
    },
];

/* ─── Control button ─── */
function ControlBtn({
    icon: Icon,
    label,
    active = true,
    danger = false,
    onClick,
}: {
    icon: React.ComponentType<{ size?: number }>;
    label: string;
    active?: boolean;
    danger?: boolean;
    onClick?: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="group flex shrink-0 flex-col items-center gap-1 cursor-pointer"
            title={label}
            type="button"
        >
            <div
                className="flex h-10 w-10 items-center justify-center rounded-[12px] transition-all duration-200 group-hover:scale-105 group-active:scale-95"
                style={{
                    background: danger
                        ? '#BA5A5A'
                        : active
                            ? 'rgba(255,255,255,0.15)'
                            : 'rgba(255,255,255,0.07)',
                    color: danger
                        ? '#fff'
                        : active
                            ? '#FBF5DD'
                            : 'rgba(251,245,221,0.45)',
                }}
            >
                <Icon size={17} />
            </div>

            <span
                className="text-[9px] leading-none"
                style={{ color: 'rgba(251,245,221,0.45)' }}
            >
                {label}
            </span>
        </button>
    );
}

/* ─── Video tile ─── */
function VideoTile({ p }: { p: (typeof PARTICIPANTS)[number] }) {
    return (
        <div
            className="relative flex h-full min-h-0 min-w-0 items-center justify-center overflow-hidden rounded-[12px] transition-all duration-200"
            style={{
                background: p.speaking ? 'rgba(156,197,161,0.1)' : '#1E2C2E',
                border: p.speaking
                    ? '2px solid #9CC5A1'
                    : '1px solid rgba(255,255,255,0.06)',
                boxShadow: p.speaking
                    ? '0 0 0 1px rgba(156,197,161,0.3)'
                    : 'none',
            }}
        >
            {p.video ? (
                <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                        background: `radial-gradient(ellipse at center, ${p.color}22 0%, #1a2627 100%)`,
                    }}
                >
                    <div
                        className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-white sm:h-14 sm:w-14 sm:text-base"
                        style={{ background: p.color }}
                    >
                        {p.initials}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-2">
                    <div
                        className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-white sm:h-12 sm:w-12"
                        style={{ background: p.color }}
                    >
                        {p.initials}
                    </div>

                    <div
                        className="rounded-full px-2 py-0.5 text-[9px]"
                        style={{
                            background: 'rgba(255,255,255,0.08)',
                            color: 'rgba(251,245,221,0.5)',
                        }}
                    >
                        Camera off
                    </div>
                </div>
            )}

            {/* Name */}
            <div
                className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-[7px] px-2 py-1"
                style={{
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(8px)',
                }}
            >
                {p.speaking && (
                    <div className="flex items-end gap-[2px]">
                        {[3, 5, 4].map((h, index) => (
                            <div
                                key={index}
                                className="w-[2px] rounded-full"
                                style={{ height: h, background: '#9CC5A1' }}
                            />
                        ))}
                    </div>
                )}

                <span className="text-[10px] font-medium text-white/90 sm:text-[11px]">
                    {p.name}
                    {p.isYou && ' (You)'}
                </span>
            </div>

            {/* Mic state */}
            {!p.speaking && (
                <div
                    className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full"
                    style={{ background: 'rgba(0,0,0,0.5)' }}
                >
                    <MicOff size={10} style={{ color: 'rgba(255,255,255,0.5)' }} />
                </div>
            )}
        </div>
    );
}

export default function MeetingPage({ params }: PageProps) {
    const { roomId } = use(params);
    const router = useRouter();

    const [room, setRoom] = useState<Room | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [livekitHost, setLivekitHost] = useState<string | null>(null);
    const [isHost, setIsHost] = useState(false);
    const [displayName, setDisplayName] = useState('Guest');

    const [micOn, setMicOn] = useState(true);
    const [videoOn, setVideoOn] = useState(true);
    const [chatOpen, setChatOpen] = useState(false);
    const [peopleOpen, setPeopleOpen] = useState(false);
    const [handRaised, setHandRaised] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState(CHAT_MSGS);
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

    const [isExtending, setIsExtending] = useState(false);
    const [isEnding, setIsEnding] = useState(false);

    useEffect(() => {
        if (token && livekitHost) {
            console.log(`Connected as ${displayName} to LiveKit room:`, { livekitHost, token });
        }
    }, [token, livekitHost, displayName]);

    useEffect(() => {
        let active = true;
        const fetchRoomDetails = async () => {
            try {
                const guestId = getOrCreateGuestId();
                const r = await getRoom(roomId);
                if (!active) return;
                setRoom(r);

                const currentIsHost = r.host_guest_id === guestId;
                setIsHost(currentIsHost);

                const savedName = localStorage.getItem('recallo_display_name') || (currentIsHost ? 'Host' : 'Guest');
                setDisplayName(savedName);

                // Fetch LiveKit Token
                const tokenResp = await getRoomToken(roomId, guestId, savedName, currentIsHost);
                if (!active) return;
                setToken(tokenResp.token);
                setLivekitHost(tokenResp.livekit_host);
                
                setIsLoading(false);
            } catch (err: any) {
                if (!active) return;
                console.error(err);
                setError(err.response?.data?.error || err.message || 'Failed to connect to room');
                setIsLoading(false);
            }
        };

        fetchRoomDetails();
        return () => {
            active = false;
        };
    }, [roomId]);

    useEffect(() => {
        if (!room) return;
        
        if (room.status === 'pending') {
            setTimeRemaining((room.session_duration_mins || 30) * 60);
            return;
        }

        if (room.status === 'ended') {
            setTimeRemaining(0);
            return;
        }

        const interval = setInterval(() => {
            const startedTime = room.startedAt ? new Date(room.startedAt).getTime() : room.createdAt.getTime();
            const durationMins = room.session_duration_mins ?? 30;
            const endTime = startedTime + durationMins * 60 * 1000;
            const remainingMs = endTime - Date.now();
            
            if (remainingMs <= 0) {
                clearInterval(interval);
                setTimeRemaining(0);
                toast.error('Session expired!');
                router.push(ROUTES.HOME);
            } else {
                setTimeRemaining(Math.floor(remainingMs / 1000));
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [room, router]);

    const formatTime = (seconds: number | null): string => {
        if (seconds === null) return '--:--';
        if (seconds <= 0) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleExtend = async () => {
        if (!room || isExtending) return;
        setIsExtending(true);
        try {
            const guestId = getOrCreateGuestId();
            const result = await extendRoomSession(room.id, guestId);
            toast.success(result.message || 'Session extended by 15 minutes');
            // Refresh room data
            const updatedRoom = await getRoom(room.id);
            setRoom(updatedRoom);
        } catch (err: any) {
            toast.error(err.response?.data?.error || err.message || 'Failed to extend session');
        } finally {
            setIsExtending(false);
        }
    };

    const handleEnd = async () => {
        if (!room || isEnding) return;
        if (!confirm('Are you sure you want to end this meeting for everyone?')) return;
        setIsEnding(true);
        try {
            const guestId = getOrCreateGuestId();
            await endRoom(room.id, guestId);
            toast.success('Room ended');
            router.push(ROUTES.HOME);
        } catch (err: any) {
            toast.error(err.response?.data?.error || err.message || 'Failed to end room');
        } finally {
            setIsEnding(false);
        }
    };

    const sendChat = () => {
        if (!chatInput.trim()) return;

        const ts = new Date().toLocaleTimeString('en', {
            hour: '2-digit',
            minute: '2-digit',
        });

        setMessages(current => [
            ...current,
            {
                id: Date.now(),
                from: 'You',
                text: chatInput,
                ts,
                initials: 'ME',
                color: '#9CC5A1',
            },
        ]);

        setChatInput('');
    };

    if (isLoading) {
        return (
            <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#141E1F] text-[#FBF5DD] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-[#9CC5A1]" />
                <p className="text-sm font-medium">Connecting to room...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#141E1F] text-[#FBF5DD] gap-6 px-4 text-center">
                <div className="rounded-full bg-[#BA5A5A]/10 p-4 text-[#BA5A5A]">
                    <X size={32} />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-bold">Failed to Join Room</h2>
                    <p className="text-sm text-white/60 max-w-md">{error}</p>
                </div>
                <Link href={ROUTES.HOME} className="px-5 py-2.5 rounded-xl bg-[#9CC5A1] text-[#141E1F] font-semibold hover:bg-opacity-95 transition-all">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div
            className="flex h-dvh min-h-dvh flex-col overflow-hidden"
            style={{ background: '#141E1F' }}
        >
            {/* ─── Header ─── */}
            <header
                className="flex h-[56px] shrink-0 items-center justify-between gap-3 px-3 sm:px-4"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
                <div className="flex min-w-0 items-center gap-2.5">
                    <Link href={ROUTES.HOME} className="flex shrink-0 items-center">
                        <div
                            className="flex h-6 w-6 items-center justify-center rounded-[7px] text-[11px] font-semibold text-white"
                            style={{
                                background: 'linear-gradient(135deg, #BA5A5A, #8A4040)',
                            }}
                        >
                            R
                        </div>
                    </Link>

                    <div
                        className="h-4 w-px shrink-0"
                        style={{ background: 'rgba(255,255,255,0.12)' }}
                    />

                    <div className="min-w-0">
                        <p
                            className="truncate text-[12px] font-medium sm:text-[13px]"
                            style={{ color: '#FBF5DD' }}
                        >
                            {room?.title || 'Morning Standup'}
                        </p>

                        <div className="flex items-center gap-1.5">
                            <span
                                className="h-1.5 w-1.5 shrink-0 rounded-full"
                                style={{ background: timeRemaining !== null && timeRemaining < 300 ? '#BA5A5A' : '#9CC5A1' }}
                            />
                            <span
                                className="text-[10px]"
                                style={{ color: timeRemaining !== null && timeRemaining < 300 ? '#BA5A5A' : 'rgba(251,245,221,0.4)' }}
                            >
                                {formatTime(timeRemaining)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                    <div
                        className="hidden items-center gap-1.5 rounded-[8px] px-2 py-1 sm:flex"
                        style={{
                            background: 'rgba(156,197,161,0.12)',
                            color: '#9CC5A1',
                        }}
                    >
                        <Wifi size={12} />
                        <span className="text-[10px] font-medium">HD</span>
                    </div>

                    <div
                        className="flex items-center gap-1.5 rounded-[8px] px-2 py-1"
                        style={{
                            background: 'rgba(255,255,255,0.06)',
                            color: 'rgba(251,245,221,0.6)',
                        }}
                    >
                        <Users size={12} />
                        <span className="text-[10px]">{PARTICIPANTS.length}</span>
                    </div>

                    <button
                        type="button"
                        className="cursor-pointer rounded-[7px] p-1.5 transition-all duration-200 hover:bg-white/10"
                        style={{ color: 'rgba(251,245,221,0.5)' }}
                        title="Fullscreen"
                    >
                        <Maximize2 size={14} />
                    </button>

                    <button
                        type="button"
                        className="cursor-pointer rounded-[7px] p-1.5 transition-all duration-200 hover:bg-white/10"
                        style={{ color: 'rgba(251,245,221,0.5)' }}
                        title="More options"
                    >
                        <MoreHorizontal size={14} />
                    </button>
                </div>
            </header>

            {/* ─── Meeting workspace ─── */}
            <div className="flex min-h-0 flex-1 overflow-hidden">
                {/* ─── Main meeting stage ─── */}
                <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-hidden p-3 sm:p-4">
                    {/* Video area: takes remaining available height */}
                    <section className="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
                        <div
                            className={`grid h-full w-full max-w-6xl gap-2.5 ${PARTICIPANTS.length === 1
                                ? 'grid-cols-1'
                                : PARTICIPANTS.length === 2
                                    ? 'grid-cols-1 sm:grid-cols-2'
                                    : 'grid-cols-2 grid-rows-2'
                                }`}
                        >
                            {PARTICIPANTS.map(participant => (
                                <VideoTile key={participant.id} p={participant} />
                            ))}
                        </div>
                    </section>

                    {/* ─── Controls dock ─── */}
                    <section className="flex shrink-0 justify-center">
                        <div
                            className="max-w-full overflow-x-auto"
                            style={{ scrollbarWidth: 'none' }}
                        >
                            <div
                                className="flex min-w-max items-center gap-2 rounded-[16px] px-3 py-2"
                                style={{
                                    background: 'rgba(255,255,255,0.06)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    boxShadow: '0px 8px 32px rgba(0,0,0,0.3)',
                                }}
                            >
                                <ControlBtn
                                    icon={micOn ? Mic : MicOff}
                                    label={micOn ? 'Mute' : 'Unmute'}
                                    active={micOn}
                                    onClick={() => setMicOn(value => !value)}
                                />

                                <ControlBtn
                                    icon={videoOn ? Video : VideoOff}
                                    label={videoOn ? 'Stop Video' : 'Start Video'}
                                    active={videoOn}
                                    onClick={() => setVideoOn(value => !value)}
                                />

                                <div
                                    className="mx-0.5 h-7 w-px"
                                    style={{ background: 'rgba(255,255,255,0.08)' }}
                                />

                                <ControlBtn icon={MonitorUp} label="Share" />
                                
                                {isHost && !room?.extend_used && (
                                    <ControlBtn 
                                        icon={Zap} 
                                        label={isExtending ? 'Extending...' : 'Extend'} 
                                        onClick={handleExtend}
                                        active={!isExtending}
                                    />
                                )}
                                
                                <ControlBtn icon={Disc3} label="Record" />
                                <ControlBtn icon={FileText} label="Transcript" />
                                <ControlBtn icon={Zap} label="Summary" />

                                <ControlBtn
                                    icon={Hand}
                                    label={handRaised ? 'Lower' : 'Raise'}
                                    active={!handRaised}
                                    onClick={() => setHandRaised(value => !value)}
                                />

                                <div
                                    className="mx-0.5 h-7 w-px"
                                    style={{ background: 'rgba(255,255,255,0.08)' }}
                                />

                                <ControlBtn
                                    icon={MessageSquare}
                                    label="Chat"
                                    active={!chatOpen}
                                    onClick={() => {
                                        setChatOpen(value => !value);
                                        if (!chatOpen) setPeopleOpen(false);
                                    }}
                                />

                                <div className="hidden sm:block">
                                    <ControlBtn 
                                        icon={Users} 
                                        label="People" 
                                        active={!peopleOpen}
                                        onClick={() => {
                                            setPeopleOpen(value => !value);
                                            if (!peopleOpen) setChatOpen(false);
                                        }}
                                    />
                                </div>

                                <div className="hidden md:block">
                                    <ControlBtn icon={Settings} label="Settings" />
                                </div>

                                <div
                                    className="mx-0.5 h-7 w-px"
                                    style={{ background: 'rgba(255,255,255,0.08)' }}
                                />

                                {isHost ? (
                                    <ControlBtn icon={PhoneOff} label="End Room" danger onClick={handleEnd} />
                                ) : (
                                    <Link href={ROUTES.HOME}>
                                        <ControlBtn icon={PhoneOff} label="Leave" danger />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </section>
                </main>

                {/* ─── Chat sidebar ─── */}
                {chatOpen && (
                    <aside
                        className="flex min-h-0 w-[290px] shrink-0 flex-col sm:w-[310px]"
                        style={{
                            background: '#1C2A2C',
                            borderLeft: '1px solid rgba(255,255,255,0.06)',
                        }}
                    >
                        {/* Chat header */}
                        <div
                            className="flex shrink-0 items-center justify-between px-3 py-2.5"
                            style={{
                                borderBottom: '1px solid rgba(255,255,255,0.06)',
                            }}
                        >
                            <div>
                                <p
                                    className="text-[12px] font-medium"
                                    style={{ color: '#FBF5DD' }}
                                >
                                    In-meeting Chat
                                </p>
                                <p
                                    className="mt-0.5 text-[10px]"
                                    style={{ color: 'rgba(251,245,221,0.35)' }}
                                >
                                    {PARTICIPANTS.length} participants
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setChatOpen(false)}
                                className="cursor-pointer rounded-[6px] p-1.5 hover:bg-white/10"
                                style={{ color: 'rgba(251,245,221,0.45)' }}
                                title="Close chat"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        {/* Only chat messages can scroll */}
                        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3">
                            {messages.map(message => (
                                <div key={message.id} className="flex gap-2.5">
                                    <div
                                        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                                        style={{ background: message.color }}
                                    >
                                        {message.initials}
                                    </div>

                                    <div className="min-w-0">
                                        <div className="flex items-baseline gap-1.5">
                                            <span
                                                className="text-[11px] font-semibold"
                                                style={{ color: message.color }}
                                            >
                                                {message.from}
                                            </span>

                                            <span
                                                className="text-[10px]"
                                                style={{
                                                    color: 'rgba(251,245,221,0.3)',
                                                }}
                                            >
                                                {message.ts}
                                            </span>
                                        </div>

                                        <p
                                            className="mt-0.5 break-words text-[12px] leading-relaxed"
                                            style={{ color: '#FBF5DD' }}
                                        >
                                            {message.text}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Chat input */}
                        <div
                            className="shrink-0 p-3"
                            style={{
                                borderTop: '1px solid rgba(255,255,255,0.06)',
                            }}
                        >
                            <div
                                className="flex items-center gap-2 rounded-[9px] px-3 py-2"
                                style={{ background: '#273338' }}
                            >
                                <input
                                    value={chatInput}
                                    onChange={event => setChatInput(event.target.value)}
                                    onKeyDown={event => {
                                        if (event.key === 'Enter') sendChat();
                                    }}
                                    placeholder="Send a message..."
                                    className="min-w-0 flex-1 bg-transparent text-[12px] placeholder:opacity-40 focus:outline-none"
                                    style={{ color: '#FBF5DD' }}
                                />

                                <button
                                    type="button"
                                    onClick={sendChat}
                                    className="shrink-0 cursor-pointer rounded-[6px] p-1"
                                    style={{ color: '#9CC5A1' }}
                                    title="Send message"
                                >
                                    <Signal size={12} />
                                </button>
                            </div>
                        </div>
                    </aside>
                )}

                {/* ─── People sidebar ─── */}
                {peopleOpen && (
                    <aside
                        className="flex min-h-0 w-[290px] shrink-0 flex-col sm:w-[310px]"
                        style={{
                            background: '#1C2A2C',
                            borderLeft: '1px solid rgba(255,255,255,0.06)',
                        }}
                    >
                        <div
                            className="flex shrink-0 items-center justify-between px-3 py-2.5"
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                        >
                            <div>
                                <p className="text-[12px] font-medium" style={{ color: '#FBF5DD' }}>
                                    Participants
                                </p>
                                <p className="mt-0.5 text-[10px]" style={{ color: 'rgba(251,245,221,0.35)' }}>
                                    {PARTICIPANTS.length} people in room
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPeopleOpen(false)}
                                className="cursor-pointer rounded-[6px] p-1.5 hover:bg-white/10"
                                style={{ color: 'rgba(251,245,221,0.45)' }}
                            >
                                <X size={14} />
                            </button>
                        </div>
                        
                        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3">
                            {PARTICIPANTS.map(p => (
                                <div key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                                            style={{ background: p.color }}
                                        >
                                            {p.initials}
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-medium text-[#FBF5DD]">
                                                {p.name} {p.isYou && '(You)'}
                                            </p>
                                        </div>
                                    </div>
                                    {!p.isYou && (
                                        <Link 
                                            href={ROUTES.CHAT_CONVERSATION(p.id.toString())}
                                            target="_blank"
                                            title="Send private message"
                                            className="p-1.5 rounded-md hover:bg-white/10 text-[#9CC5A1]"
                                        >
                                            <MessageCircle size={16} />
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
}
