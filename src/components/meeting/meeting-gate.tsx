
'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, X } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useMeetingConnection } from '@/hooks/use-meeting-connection';
import { useMeetingStore } from '@/stores/use-meeting-store';
import { PreJoinLobby } from '@/components/meeting/pre-join-lobby';
import { LiveRoom } from '@/components/meeting/live-room';
import type { LobbyConfig, MeetingConnection } from '@/types/meeting';

interface MeetingGateProps {
    roomId: string;
    mode?: 'meeting' | 'webinar';
}

function FullScreen({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-dvh w-full flex-col items-center justify-center gap-4 px-4 text-center" style={{ background: '#141E1F', color: '#FBF5DD' }}>
            {children}
        </div>
    );
}

export function MeetingGate({ roomId, mode = 'meeting' }: MeetingGateProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isHydrated } = useCurrentUser();
    const resetStore = useMeetingStore(s => s.reset);

    const { room, isLoading, error, isHost, guestId, defaultName, fetchToken, refetch }
        = useMeetingConnection(roomId);

    const [phase, setPhase] = useState<'lobby' | 'live'>('lobby');
    const [connection, setConnection] = useState<MeetingConnection | null>(null);
    const [lobby, setLobby] = useState<LobbyConfig | null>(null);

    // Auth guard: redirect unauthenticated users to login with a return path.
    useEffect(() => {
        if (isHydrated && !user) {
            router.replace(`${ROUTES.LOGIN}?returnUrl=${encodeURIComponent(pathname)}`);
        }
    }, [isHydrated, user, router, pathname]);

    // Clear chat/unread state when leaving the room.
    useEffect(() => () => resetStore(), [resetStore]);

    const handleJoin = useCallback(
        async (config: LobbyConfig) => {
            const conn = await fetchToken(config.displayName);
            setConnection(conn);
            setLobby(config);
            setPhase('live');
        },
        [fetchToken],
    );

    const handleLeave = useCallback(() => {
        resetStore();
        router.push(ROUTES.HOME);
    }, [resetStore, router]);

    // Still hydrating auth, or redirecting an unauthenticated user.
    if (!isHydrated || !user) {
        return (
            <FullScreen>
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#9CC5A1' }} />
            </FullScreen>
        );
    }

    if (isLoading) {
        return (
            <FullScreen>
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#9CC5A1' }} />
                <p className="text-sm font-medium">Loading room…</p>
            </FullScreen>
        );
    }

    if (error || !room) {
        return (
            <FullScreen>
                <div className="rounded-full p-4" style={{ background: 'rgba(186,90,90,0.1)', color: '#BA5A5A' }}>
                    <X size={32} />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-bold">Failed to Join Room</h2>
                    <p className="max-w-md text-sm text-white/60">{error ?? 'Room not found'}</p>
                </div>
                <Link
                    href={ROUTES.HOME}
                    className="rounded-xl px-5 py-2.5 font-semibold transition-all hover:opacity-95"
                    style={{ background: '#9CC5A1', color: '#141E1F' }}
                >
                    Return to Dashboard
                </Link>
            </FullScreen>
        );
    }

    if (phase === 'live' && connection && lobby) {
        return (
            <LiveRoom
                token={connection.token}
                serverUrl={connection.serverUrl}
                lobby={lobby}
                room={room}
                isHost={isHost}
                guestId={guestId}
                mode={mode}
                onLeave={handleLeave}
                onRoomChanged={refetch}
            />
        );
    }

    return (
        <PreJoinLobby
            roomTitle={room.title || (mode === 'webinar' ? 'Webinar' : 'Meeting')}
            defaultName={defaultName}
            isHost={isHost}
            mode={mode}
            onJoin={handleJoin}
        />
    );
}
