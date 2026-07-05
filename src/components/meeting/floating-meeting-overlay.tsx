'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  VideoTrack,
  useTracks,
  useLocalParticipant,
  isTrackReference,
  type TrackReferenceOrPlaceholder,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { Mic, MicOff, Video, VideoOff, Maximize2, PhoneOff } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { colorFor, initialsFor } from '@/components/meeting/avatar';
import { useMediaToggles } from '@/hooks/use-media-toggles';
import { useMeetingPreferencesStore } from '@/stores/use-meeting-preferences-store';
import { useActiveMeeting } from '@/components/providers/active-meeting-provider';

const PIP_WIDTH = 320;
const PIP_HEIGHT = 180;
const MARGIN = 20;

/** Strip the leading locale segment so we can compare against ROUTES paths. */
function stripLocale(pathname: string): string {
  return pathname.replace(/^\/[a-z]{2}(-[a-z]{2})?(?=\/|$)/i, '') || '/';
}

/** Pick the most interesting camera track: a speaker, else a remote, else local. */
function pickFeatured(tracks: TrackReferenceOrPlaceholder[], localIdentity: string) {
  const withVideo = tracks.filter(t => isTrackReference(t) && !t.publication.isMuted);
  const speaking = withVideo.find(t => t.participant.isSpeaking);
  const remote = withVideo.find(t => t.participant.identity !== localIdentity);
  return speaking ?? remote ?? withVideo[0] ?? tracks[0] ?? null;
}

export function FloatingMeetingOverlay() {
  const pathname = usePathname();
  const { session, leave, returnToRoom } = useActiveMeeting();
  const { localParticipant } = useLocalParticipant();
  const {
    micEnabled, camEnabled, micBusy, camBusy, toggleMic, toggleCam,
  } = useMediaToggles();
  const mirror = useMeetingPreferencesStore(s => s.mirrorVideo);

  const tracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    { onlySubscribed: false },
  );

  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{ dx: number; dy: number } | null>(null);

  // Default to the bottom-right corner once we know the viewport size.
  useEffect(() => {
    if (pos || typeof window === 'undefined') return;
    setPos({
      x: window.innerWidth - PIP_WIDTH - MARGIN,
      y: window.innerHeight - PIP_HEIGHT - MARGIN,
    });
  }, [pos]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (!pos) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
  }, [pos]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current || typeof window === 'undefined') return;
    const x = Math.min(
      Math.max(MARGIN, e.clientX - dragRef.current.dx),
      window.innerWidth - PIP_WIDTH - MARGIN,
    );
    const y = Math.min(
      Math.max(MARGIN, e.clientY - dragRef.current.dy),
      window.innerHeight - PIP_HEIGHT - MARGIN,
    );
    setPos({ x, y });
  }, []);

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  if (!session) return null;

  // Hide while the full-screen meeting for this session is on-screen.
  const path = stripLocale(pathname);
  const roomPath = session.mode === 'webinar'
    ? ROUTES.WEBINAR_DETAIL(session.roomId)
    : ROUTES.MEETING_DETAIL(session.roomId);
  if (path === roomPath) return null;

  const featured = pickFeatured(tracks, localParticipant.identity);
  const showVideo = featured && isTrackReference(featured) && !featured.publication.isMuted;
  const name = featured?.participant.name || featured?.participant.identity || session.displayName;
  const isLocalFeatured = featured?.participant.identity === localParticipant.identity;

  return (
    <div
      className="group fixed z-50 flex flex-col overflow-hidden rounded-[16px] select-none"
      style={{
        left: pos?.x ?? 0,
        top: pos?.y ?? 0,
        width: PIP_WIDTH,
        height: PIP_HEIGHT,
        background: '#141E1F',
        border: '1px solid rgba(156,197,161,0.4)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(156,197,161,0.15)',
        visibility: pos ? 'visible' : 'hidden',
      }}
    >
      {/* Drag handle + title */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="absolute inset-x-0 top-0 z-10 flex cursor-grab items-center gap-2 px-3 py-2 active:cursor-grabbing"
        style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.55), transparent)' }}
      >
        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: '#9CC5A1' }} />
        <span className="truncate text-[11px] font-medium" style={{ color: '#FBF5DD' }}>
          {session.roomMeta.title || 'Meeting'}
        </span>
      </div>

      {/* Media */}
      {showVideo
        ? (
            <VideoTrack
              trackRef={featured}
              className={`h-full w-full object-cover ${isLocalFeatured && mirror ? '-scale-x-100' : ''}`}
            />
          )
        : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="relative flex items-center justify-center">
                <span
                  className="absolute h-16 w-16 animate-ping rounded-full opacity-30"
                  style={{ background: colorFor(name) }}
                />
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full text-base font-semibold text-white"
                  style={{ background: colorFor(name) }}
                >
                  {initialsFor(name)}
                </div>
              </div>
            </div>
          )}

      {/* Hover controls */}
      <div
        className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 px-3 py-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.6), transparent)' }}
      >
        <PipButton label={micEnabled ? 'Mute' : 'Unmute'} active={micEnabled} busy={micBusy} onClick={toggleMic}>
          {micEnabled ? <Mic size={14} /> : <MicOff size={14} />}
        </PipButton>
        <PipButton label={camEnabled ? 'Stop video' : 'Start video'} active={camEnabled} busy={camBusy} onClick={toggleCam}>
          {camEnabled ? <Video size={14} /> : <VideoOff size={14} />}
        </PipButton>
        <PipButton label="Return to full screen" onClick={returnToRoom}>
          <Maximize2 size={14} />
        </PipButton>
        <PipButton label="Leave meeting" danger onClick={leave}>
          <PhoneOff size={14} />
        </PipButton>
      </div>
    </div>
  );
}

interface PipButtonProps {
  label: string;
  active?: boolean;
  busy?: boolean;
  danger?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function PipButton({ label, active, busy, danger, onClick, children }: PipButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={busy}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-full transition-all hover:scale-105 disabled:opacity-50"
      style={{
        background: danger
          ? '#BA5A5A'
          : active
            ? 'rgba(255,255,255,0.16)'
            : '#BA5A5A',
        color: '#FBF5DD',
      }}
    >
      {children}
    </button>
  );
}
