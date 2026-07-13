'use client';

import type { Room } from '@/types/room';
import {
  Disc3,
  FileText,
  Hand,
  MessageSquare,
  Mic,
  MicOff,
  MonitorUp,
  MoreHorizontal,
  PhoneOff,
  Settings,
  Users,
  Video,
  VideoOff,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ControlButton } from '@/components/meeting/control-button';
import { useHandRaiseControl } from '@/hooks/use-hand-raise';
import { useMediaToggles } from '@/hooks/use-media-toggles';
import { ROUTES } from '@/lib/routes';
import { endRoom, extendRoomSession } from '@/services/room-service';
import { useMeetingStore } from '@/stores/use-meeting-store';

type ControlsDockProps = {
  room: Room;
  isHost: boolean;
  guestId: string;
  mode?: 'meeting' | 'webinar';
  onLeave: () => void;
  onRoomChanged: () => void;
};

function errorMessage(err: unknown, fallback: string): string {
  const maybe = err as {
    response?: { data?: { error?: string } };
    message?: string;
  };
  return maybe?.response?.data?.error ?? maybe?.message ?? fallback;
}

function ControlsDockImpl({
  room,
  isHost,
  guestId,
  mode: _mode = 'meeting',
  onLeave,
  onRoomChanged,
}: ControlsDockProps) {
  const router = useRouter();
  const {
    micEnabled,
    camEnabled,
    screenShareEnabled,
    micBusy,
    camBusy,
    screenBusy,
    toggleMic,
    toggleCam,
    toggleScreenShare,
  } = useMediaToggles();
  const { raised: handRaised, toggle: toggleHand } = useHandRaiseControl();
  const sidebar = useMeetingStore(s => s.sidebar);
  const unreadChat = useMeetingStore(s => s.unreadChat);
  const toggleSidebar = useMeetingStore(s => s.toggleSidebar);

  const [extending, setExtending] = useState(false);
  const [ending, setEnding] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Cmd/Ctrl+D = toggle mic, Cmd/Ctrl+E = toggle camera
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) {
        return;
      }
      if (e.key === 'd') {
        e.preventDefault();
        void toggleMic();
      }
      if (e.key === 'e') {
        e.preventDefault();
        void toggleCam();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleMic, toggleCam]);

  // Close "more" menu on outside click
  useEffect(() => {
    if (!moreOpen) {
      return;
    }
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [moreOpen]);

  const handleExtend = useCallback(async () => {
    if (extending) {
      return;
    }
    setExtending(true);
    try {
      const result = await extendRoomSession(room.id, guestId);
      toast.success(result.message || 'Session extended');
      onRoomChanged();
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to extend session'));
    } finally {
      setExtending(false);
    }
  }, [extending, room.id, guestId, onRoomChanged]);

  const handleEnd = useCallback(async () => {
    if (ending) {
      return;
    }
    if (
      !window.confirm('Are you sure you want to end this meeting for everyone?')
    ) {
      return;
    }
    setEnding(true);
    try {
      await endRoom(room.id, guestId);
      toast.success('Room ended');
      onLeave();
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to end room'));
      setEnding(false);
    }
  }, [ending, room.id, guestId, onLeave]);

  const leaveButton = isHost
    ? (
        <ControlButton
          icon={PhoneOff}
          label="End"
          danger
          busy={ending}
          onClick={handleEnd}
        />
      )
    : (
        <ControlButton icon={PhoneOff} label="Leave" danger onClick={onLeave} />
      );

  return (
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
          {/* Always-visible primary controls */}
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

          <div className="relative">
            <ControlButton
              icon={MessageSquare}
              label="Chat"
              active={sidebar === 'chat'}
              onClick={() => toggleSidebar('chat')}
            />
            {unreadChat > 0 && (
              <span
                className="absolute top-0 right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-semibold text-white"
                style={{ background: 'var(--color-text-accent)' }}
              >
                {unreadChat > 9 ? '9+' : unreadChat}
              </span>
            )}
          </div>

          <ControlButton
            icon={Hand}
            label={handRaised ? 'Lower' : 'Raise'}
            active={handRaised}
            onClick={toggleHand}
          />

          {/* Secondary controls: visible on sm+ inline, hidden on mobile */}
          <Divider className="hidden sm:block" />

          <div className="hidden sm:block">
            <ControlButton
              icon={MonitorUp}
              label={screenShareEnabled ? 'Stop Share' : 'Share'}
              active={screenShareEnabled}
              busy={screenBusy}
              onClick={toggleScreenShare}
            />
          </div>

          {isHost && !room.extend_used && (
            <div className="hidden sm:block">
              <ControlButton
                icon={Zap}
                label={extending ? 'Extending…' : 'Extend'}
                busy={extending}
                onClick={handleExtend}
              />
            </div>
          )}

          <div className="hidden sm:block">
            <ControlButton
              icon={Disc3}
              label="Record"
              onClick={() =>
                toast.info(
                  'Recording starts automatically when the meeting ends via LiveKit Egress.',
                )}
            />
          </div>
          <div className="hidden sm:block">
            <ControlButton
              icon={FileText}
              label="Transcript"
              onClick={() =>
                router.push(ROUTES.TRANSCRIPT_DETAIL(room.livekit_room_name))}
            />
          </div>
          <div className="hidden sm:block">
            <ControlButton
              icon={Zap}
              label="Summary"
              onClick={() =>
                router.push(ROUTES.SUMMARY_DETAIL(room.livekit_room_name))}
            />
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

          {/* 3-dots More menu: mobile only */}
          <div ref={moreRef} className="relative sm:hidden">
            <ControlButton
              icon={MoreHorizontal}
              label="More"
              active={moreOpen}
              onClick={() => setMoreOpen(!moreOpen)}
            />
            {moreOpen && (
              <div
                className="absolute bottom-full left-1/2 z-50 mb-3 w-48 -translate-x-1/2 overflow-hidden rounded-[14px] shadow-2xl"
                style={{
                  background: 'rgba(30,42,44,0.97)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.10)',
                }}
              >
                <MobileMenuItem
                  icon={MonitorUp}
                  label={screenShareEnabled ? 'Stop Share' : 'Share Screen'}
                  active={screenShareEnabled}
                  onClick={() => {
                    void toggleScreenShare();
                    setMoreOpen(false);
                  }}
                />
                {isHost && !room.extend_used && (
                  <MobileMenuItem
                    icon={Zap}
                    label={extending ? 'Extending…' : 'Extend Session'}
                    onClick={() => {
                      void handleExtend();
                      setMoreOpen(false);
                    }}
                  />
                )}
                <MobileMenuItem
                  icon={Disc3}
                  label="Recording Info"
                  onClick={() => {
                    toast.info(
                      'Recording starts automatically when the meeting ends via LiveKit Egress.',
                    );
                    setMoreOpen(false);
                  }}
                />
                <MobileMenuItem
                  icon={FileText}
                  label="View Transcript"
                  onClick={() => {
                    router.push(
                      ROUTES.TRANSCRIPT_DETAIL(room.livekit_room_name),
                    );
                    setMoreOpen(false);
                  }}
                />
                <MobileMenuItem
                  icon={Zap}
                  label="AI Summary"
                  onClick={() => {
                    router.push(ROUTES.SUMMARY_DETAIL(room.livekit_room_name));
                    setMoreOpen(false);
                  }}
                />
                <MobileMenuItem
                  icon={Users}
                  label="Participants"
                  active={sidebar === 'people'}
                  onClick={() => {
                    toggleSidebar('people');
                    setMoreOpen(false);
                  }}
                />
                <MobileMenuItem
                  icon={Settings}
                  label="Settings"
                  onClick={() => {
                    toast.info('Settings coming soon.');
                    setMoreOpen(false);
                  }}
                />
              </div>
            )}
          </div>

          <Divider />

          {leaveButton}
        </div>
      </div>
    </section>
  );
}

function Divider({ className }: { className?: string }) {
  return (
    <div
      className={`mx-0.5 h-7 w-px ${className ?? ''}`}
      style={{ background: 'rgba(255,255,255,0.08)' }}
    />
  );
}

type MobileMenuItemProps = {
  icon: React.ComponentType<{ size: number }>;
  label: string;
  active?: boolean;
  onClick: () => void;
};

function MobileMenuItem({
  icon: Icon,
  label,
  active,
  onClick,
}: MobileMenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3 text-left text-[13px] font-medium transition-colors"
      style={{
        color: active ? '#9CC5A1' : 'rgba(251,245,221,0.8)',
        background: active ? 'rgba(156,197,161,0.08)' : 'transparent',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget).style.background
          = 'rgba(255,255,255,0.06)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget).style.background = active
          ? 'rgba(156,197,161,0.08)'
          : 'transparent';
      }}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}

export const ControlsDock = memo(ControlsDockImpl);
