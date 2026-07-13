'use client';

import type { Room } from '@/types/room';
import { memo } from 'react';
import { ConnectionOverlay } from '@/components/meeting/connection-overlay';
import { ControlsDock } from '@/components/meeting/controls-dock';
import { MeetingHeader } from '@/components/meeting/meeting-header';
import { MeetingStage } from '@/components/meeting/meeting-stage';
import { SidebarSlot } from '@/components/meeting/sidebar-slot';

type LiveRoomProps = {
  room: Room;
  isHost: boolean;
  guestId: string;
  mode?: 'meeting' | 'webinar';
  onLeave: () => void;
  onRoomChanged: () => void;
};

/**
 * Full-screen meeting presentation.
 *
 * The LiveKit connection is owned by `ActiveMeetingProvider` and shared via
 * `RoomContext`, so this component only renders the meeting UI and reads the
 * room through the standard `@livekit/components-react` hooks. It carries no
 * connection lifecycle of its own — unmounting it (e.g. navigating to another
 * page) does NOT drop the call; the provider keeps it alive for the PiP.
 */
function LiveRoomImpl({
  room,
  isHost,
  guestId,
  mode = 'meeting',
  onLeave,
  onRoomChanged,
}: LiveRoomProps) {
  return (
    <div
      data-feature="meeting"
      className="relative flex h-dvh flex-col overflow-hidden"
      style={{ background: '#141E1F' }}
    >
      <ConnectionOverlay />
      <MeetingHeader room={room} mode={mode} />

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
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
    </div>
  );
}

export const LiveRoom = memo(LiveRoomImpl);
