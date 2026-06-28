'use client';

import { memo, useCallback, useState } from 'react';
import {
  Mic, MicOff, Video, VideoOff, MonitorUp, MessageSquare, Users,
  Settings, PhoneOff, Hand, Disc3, FileText, Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { ControlButton } from '@/components/meeting/control-button';
import { useMediaToggles } from '@/hooks/use-media-toggles';
import { useHandRaiseControl } from '@/hooks/use-hand-raise';
import { useMeetingStore } from '@/stores/use-meeting-store';
import { extendRoomSession, endRoom } from '@/services/room-service';
import type { Room } from '@/types/room';

interface ControlsDockProps {
  room: Room;
  isHost: boolean;
  guestId: string;
  mode?: 'meeting' | 'webinar';
  onLeave: () => void;
  onRoomChanged: () => void;
}

function errorMessage(err: unknown, fallback: string): string {
  const maybe = err as { response?: { data?: { error?: string } }; message?: string };
  return maybe?.response?.data?.error ?? maybe?.message ?? fallback;
}

function ControlsDockImpl({ room, isHost, guestId, mode: _mode = 'meeting', onLeave, onRoomChanged }: ControlsDockProps) {
  const {
    micEnabled, camEnabled, screenShareEnabled,
    micBusy, camBusy, screenBusy,
    toggleMic, toggleCam, toggleScreenShare,
  } = useMediaToggles();
  const { raised: handRaised, toggle: toggleHand } = useHandRaiseControl();
  const sidebar = useMeetingStore(s => s.sidebar);
  const unreadChat = useMeetingStore(s => s.unreadChat);
  const toggleSidebar = useMeetingStore(s => s.toggleSidebar);

  const [extending, setExtending] = useState(false);
  const [ending, setEnding] = useState(false);

  const handleExtend = useCallback(async () => {
    if (extending) return;
    setExtending(true);
    try {
      const result = await extendRoomSession(room.id, guestId);
      toast.success(result.message || 'Session extended');
      onRoomChanged();
    }
    catch (err) {
      toast.error(errorMessage(err, 'Failed to extend session'));
    }
    finally {
      setExtending(false);
    }
  }, [extending, room.id, guestId, onRoomChanged]);

  const handleEnd = useCallback(async () => {
    if (ending) return;
    if (!window.confirm('Are you sure you want to end this meeting for everyone?')) return;
    setEnding(true);
    try {
      await endRoom(room.id, guestId);
      toast.success('Room ended');
      onLeave();
    }
    catch (err) {
      toast.error(errorMessage(err, 'Failed to end room'));
      setEnding(false);
    }
  }, [ending, room.id, guestId, onLeave]);

  return (
    <section className="flex shrink-0 justify-center">
      <div className="max-w-full overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <div
          className="flex min-w-max items-center gap-2 rounded-[16px] px-3 py-2"
          style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0px 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          <ControlButton
            icon={micEnabled ? Mic : MicOff}
            label={micEnabled ? 'Mute' : 'Unmute'}
            active={micEnabled}
            busy={micBusy}
            onClick={toggleMic}
          />
          <ControlButton
            icon={camEnabled ? Video : VideoOff}
            label={camEnabled ? 'Stop Video' : 'Start Video'}
            active={camEnabled}
            busy={camBusy}
            onClick={toggleCam}
          />

          <Divider />

          <ControlButton
            icon={MonitorUp}
            label={screenShareEnabled ? 'Stop Share' : 'Share'}
            active={screenShareEnabled}
            busy={screenBusy}
            onClick={toggleScreenShare}
          />

          {isHost && !room.extend_used && (
            <ControlButton
              icon={Zap}
              label={extending ? 'Extending…' : 'Extend'}
              busy={extending}
              onClick={handleExtend}
            />
          )}

          <ControlButton icon={Disc3} label="Record" comingSoon />
          <ControlButton icon={FileText} label="Transcript" comingSoon />
          <ControlButton icon={Zap} label="Summary" comingSoon />
          <ControlButton
            icon={Hand}
            label={handRaised ? 'Lower' : 'Raise'}
            active={handRaised}
            onClick={toggleHand}
          />

          <Divider />

          <div className="relative">
            <ControlButton
              icon={MessageSquare}
              label="Chat"
              active={sidebar === 'chat'}
              onClick={() => toggleSidebar('chat')}
            />
            {unreadChat > 0 && (
              <span
                className="absolute right-1 top-0 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-semibold text-white"
                style={{ background: '#BA5A5A' }}
              >
                {unreadChat > 9 ? '9+' : unreadChat}
              </span>
            )}
          </div>

          <div className="hidden sm:block">
            <ControlButton
              icon={Users}
              label="People"
              active={sidebar === 'people'}
              onClick={() => toggleSidebar('people')}
            />
          </div>

          <div className="hidden md:block">
            <ControlButton icon={Settings} label="Settings" comingSoon />
          </div>

          <Divider />

          {isHost
            ? <ControlButton icon={PhoneOff} label="End Room" danger busy={ending} onClick={handleEnd} />
            : <ControlButton icon={PhoneOff} label="Leave" danger onClick={onLeave} />}
        </div>
      </div>
    </section>
  );
}

function Divider() {
  return <div className="mx-0.5 h-7 w-px" style={{ background: 'rgba(255,255,255,0.08)' }} />;
}

export const ControlsDock = memo(ControlsDockImpl);
