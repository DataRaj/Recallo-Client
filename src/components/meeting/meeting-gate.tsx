'use client';

import type { LobbyConfig } from '@/types/meeting';
import { Loader2, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import { LiveRoom } from '@/components/meeting/live-room';
import { PreJoinLobby } from '@/components/meeting/pre-join-lobby';
import { useActiveMeeting } from '@/components/providers/active-meeting-provider';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useMeetingConnection } from '@/hooks/use-meeting-connection';
import { ROUTES } from '@/lib/routes';

type MeetingGateProps = {
  roomId: string;
  mode?: 'meeting' | 'webinar';
};

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

  const { room, isLoading, error, isHost, guestId, defaultName, fetchToken, refetch }
    = useMeetingConnection(roomId);

  const { status, session, connect, leave } = useActiveMeeting();

  // This gate is showing the meeting we're actually connected to.
  const isActiveHere = session?.roomId === roomId && status !== 'idle';
  // Track whether we ever joined this room, so an ended/left session redirects home.
  const joinedRef = useRef(false);
  if (isActiveHere) {
    joinedRef.current = true;
  }

  // Auth guard: redirect unauthenticated users to login with a return path.
  useEffect(() => {
    if (isHydrated && !user) {
      router.replace(`${ROUTES.LOGIN}?returnUrl=${encodeURIComponent(pathname)}`);
    }
  }, [isHydrated, user, router, pathname]);

  // If the session ended (host ended / left / disconnected) while we're on the
  // meeting route, send the user back to the dashboard.
  useEffect(() => {
    if (joinedRef.current && !isActiveHere) {
      router.push(ROUTES.HOME);
    }
  }, [isActiveHere, router]);

  const handleJoin = useCallback(
    async (config: LobbyConfig) => {
      const conn = await fetchToken(config.displayName);
      if (!room) {
        throw new Error('Room is not ready');
      }
      await connect({
        roomId,
        token: conn.token,
        serverUrl: conn.serverUrl,
        lobby: config,
        roomMeta: room,
        isHost,
        guestId,
        mode,
      });
    },
    [fetchToken, connect, room, roomId, isHost, guestId, mode],
  );

  const handleLeave = useCallback(() => {
    leave();
    router.push(ROUTES.HOME);
  }, [leave, router]);

  // Still hydrating auth, or redirecting an unauthenticated user.
  if (!isHydrated || !user) {
    return (
      <FullScreen>
        <Loader2 className="size-8 animate-spin" style={{ color: '#9CC5A1' }} />
      </FullScreen>
    );
  }

  // Already connected to this room (fresh join or returned from PiP) → full screen.
  if (isActiveHere && room) {
    return (
      <LiveRoom
        room={room}
        isHost={isHost}
        guestId={guestId}
        mode={mode}
        onLeave={handleLeave}
        onRoomChanged={refetch}
      />
    );
  }

  if (isLoading) {
    return (
      <FullScreen>
        <Loader2 className="size-8 animate-spin" style={{ color: '#9CC5A1' }} />
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
