'use client';

import { memo, useMemo } from 'react';
import { VideoTrack, useTracks, type TrackReference, type TrackReferenceOrPlaceholder } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { VideoTile } from '@/components/meeting/video-tile';

interface FocusViewProps {
  screenTrack: TrackReference;
}

function trackKey(ref: TrackReferenceOrPlaceholder): string {
  const source = ref.publication?.source ?? ref.source ?? 'camera';
  return `${ref.participant.identity}_${source}`;
}

function FocusViewImpl({ screenTrack }: FocusViewProps) {
  const cameraTracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    { onlySubscribed: false },
  );

  const ordered = useMemo(
    () =>
      [...cameraTracks].sort((a, b) => {
        const al = a.participant.isLocal ? 1 : 0;
        const bl = b.participant.isLocal ? 1 : 0;
        return al - bl;
      }),
    [cameraTracks],
  );

  const sharerName = screenTrack.participant.name || screenTrack.participant.identity;

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-2.5">
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[12px]" style={{ background: '#000' }}>
        <VideoTrack trackRef={screenTrack} className="h-full w-full object-contain" />
        <div
          className="absolute bottom-2 left-2 rounded-[7px] px-2 py-1 text-[11px] font-medium text-white/90"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
        >
          {sharerName}
          {screenTrack.participant.isLocal ? ' (You) — Sharing' : ' is sharing'}
        </div>
      </div>

      {/* Camera filmstrip */}
      <div className="flex h-[84px] shrink-0 gap-2 overflow-x-auto sm:h-[96px]" style={{ scrollbarWidth: 'thin' }}>
        {ordered.map(ref => (
          <div key={trackKey(ref)} className="aspect-video h-full shrink-0">
            <VideoTile trackRef={ref} isLocal={ref.participant.isLocal} />
          </div>
        ))}
      </div>
    </section>
  );
}

export const FocusView = memo(FocusViewImpl);
