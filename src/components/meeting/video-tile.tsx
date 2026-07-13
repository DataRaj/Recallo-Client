'use client';

import type { TrackReferenceOrPlaceholder } from '@livekit/components-react';
import {
  isTrackReference,

  useConnectionQualityIndicator,
  useIsSpeaking,
  VideoTrack,
} from '@livekit/components-react';
import { ConnectionQuality } from 'livekit-client';
import { Hand, MicOff, Signal } from 'lucide-react';
import { memo } from 'react';
import { colorFor, initialsFor } from '@/components/meeting/avatar';
import { useMeetingPreferencesStore } from '@/stores/use-meeting-preferences-store';
import { useMeetingStore } from '@/stores/use-meeting-store';

type VideoTileProps = {
  trackRef: TrackReferenceOrPlaceholder;
  isLocal: boolean;
};

function VideoTileImpl({ trackRef, isLocal }: VideoTileProps) {
  const participant = trackRef.participant;
  const isSpeaking = useIsSpeaking(participant);
  const { quality } = useConnectionQualityIndicator({ participant });
  const handRaised = useMeetingStore(s => s.raisedHands[participant.identity] ?? false);
  const mirror = useMeetingPreferencesStore(s => s.mirrorVideo);

  const name = participant.name || participant.identity;
  const color = colorFor(participant.identity);
  const micOn = participant.isMicrophoneEnabled;
  const hasVideo = isTrackReference(trackRef) && !trackRef.publication.isMuted;

  return (
    <div
      className="relative flex h-full min-h-0 min-w-0 items-center justify-center overflow-hidden rounded-[12px] transition-all duration-200"
      style={{
        background: isSpeaking ? 'rgba(156,197,161,0.1)' : '#1E2C2E',
        border: isSpeaking ? '2px solid #9CC5A1' : '1px solid rgba(255,255,255,0.06)',
        boxShadow: isSpeaking ? '0 0 0 1px rgba(156,197,161,0.3)' : 'none',
      }}
    >
      {hasVideo
        ? (
            <VideoTrack
              trackRef={trackRef}
              className={`absolute inset-0 size-full object-cover ${isLocal && mirror ? '-scale-x-100' : ''}`}
            />
          )
        : (
            <div className="flex flex-col items-center gap-2">
              <div
                className="flex size-11 items-center justify-center rounded-full text-sm font-semibold text-white sm:size-12"
                style={{ background: color }}
              >
                {initialsFor(name)}
              </div>
              <div
                className="rounded-full px-2 py-0.5 text-[9px]"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(251,245,221,0.5)' }}
              >
                Camera off
              </div>
            </div>
          )}

      {/* Name */}
      <div
        className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-[7px] px-2 py-1"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
      >
        {isSpeaking && (
          <div className="flex items-end gap-[2px]">
            {[3, 5, 4].map((h, i) => (
              <div key={i} className="w-[2px] rounded-full" style={{ height: h, background: '#9CC5A1' }} />
            ))}
          </div>
        )}
        <span className="text-[10px] font-medium text-white/90 sm:text-[11px]">
          {name}
          {isLocal && ' (You)'}
        </span>
      </div>

      {/* Hand raised */}
      {handRaised && (
        <div
          className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full"
          style={{ background: '#E5B567' }}
          title={`${name} raised their hand`}
        >
          <Hand size={12} className="text-[#141E1F]" />
        </div>
      )}

      {/* Mic muted indicator */}
      {!micOn && (
        <div
          className="absolute right-2 bottom-2 flex size-5 items-center justify-center rounded-full"
          style={{ background: 'rgba(0,0,0,0.5)' }}
        >
          <MicOff size={10} style={{ color: 'rgba(255,255,255,0.5)' }} />
        </div>
      )}

      {/* Poor connection indicator */}
      {(quality === ConnectionQuality.Poor || quality === ConnectionQuality.Lost) && (
        <div
          className="absolute top-2 left-2 flex size-5 items-center justify-center rounded-full"
          style={{ background: 'rgba(186,90,90,0.85)' }}
          title="Weak connection"
        >
          <Signal size={10} className="text-white" />
        </div>
      )}
    </div>
  );
}

export const VideoTile = memo(VideoTileImpl);
