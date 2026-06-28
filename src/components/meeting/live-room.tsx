'use client';

import { memo, useCallback } from 'react';
import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react';
import { toast } from 'sonner';
import { MeetingHeader } from '@/components/meeting/meeting-header';
import { MeetingStage } from '@/components/meeting/meeting-stage';
import { ControlsDock } from '@/components/meeting/controls-dock';
import { SidebarSlot } from '@/components/meeting/sidebar-slot';
import { ConnectionOverlay } from '@/components/meeting/connection-overlay';
import { useHandRaiseSync } from '@/hooks/use-hand-raise';
import { useChatReceiver } from '@/hooks/use-meeting-chat';
import type { Room } from '@/types/room';
import type { LobbyConfig } from '@/types/meeting';

/** Mounts room-wide data-channel listeners exactly once (chat + hand-raise). */
function RoomSignals() {
  useChatReceiver();
  useHandRaiseSync();
  return null;
}

interface LiveRoomProps {
  token: string;
  serverUrl: string;
  lobby: LobbyConfig;
  room: Room;
  isHost: boolean;
  guestId: string;
  mode?: 'meeting' | 'webinar';
  onLeave: () => void;
  onRoomChanged: () => void;
}

function LiveRoomImpl({
  token, serverUrl, lobby, room, isHost, guestId, mode = 'meeting', onLeave, onRoomChanged,
}: LiveRoomProps) {
  const handleError = useCallback((err: Error) => {
    toast.error(err.message || 'A media error occurred');
  }, []);

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect
      audio={lobby.micEnabled}
      video={lobby.camEnabled}
      onError={handleError}
      onDisconnected={onLeave}
      className="relative flex h-dvh flex-col overflow-hidden"
      style={{ background: '#141E1F' }}
    >
      <RoomAudioRenderer />
      <RoomSignals />
      <ConnectionOverlay />
      <MeetingHeader room={room} mode={mode} />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-hidden p-3 sm:p-4">
          <MeetingStage />
          <ControlsDock
            room={room}
            isHost={isHost}
            guestId={guestId}
            mode={mode}
            onLeave={onLeave}
            onRoomChanged={onRoomChanged}
          />
        </main>
        <SidebarSlot />
      </div>
    </LiveKitRoom>
  );
}

export const LiveRoom = memo(LiveRoomImpl);
