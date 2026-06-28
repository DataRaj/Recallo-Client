'use client';

import { memo, useMemo } from 'react';
import { useTracks, type TrackReferenceOrPlaceholder } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { VideoTile } from '@/components/meeting/video-tile';

function columnsFor(count: number): number {
  if (count <= 1) return 1;
  if (count <= 4) return 2;
  if (count <= 9) return 3;
  return 4;
}

function trackKey(ref: TrackReferenceOrPlaceholder): string {
  const source = ref.publication?.source ?? ref.source ?? 'camera';
  return `${ref.participant.identity}_${source}`;
}

function VideoGridImpl() {
  const tracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    { onlySubscribed: false },
  );

  // Sort the local participant last so "You" sits in a stable position.
  const ordered = useMemo(
    () =>
      [...tracks].sort((a, b) => {
        const al = a.participant.isLocal ? 1 : 0;
        const bl = b.participant.isLocal ? 1 : 0;
        return al - bl;
      }),
    [tracks],
  );

  const columns = columnsFor(ordered.length);
  const rows = Math.max(1, Math.ceil(ordered.length / columns));
  const alone = ordered.length <= 1;

  return (
    <section className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
      <div
        className="grid h-full w-full max-w-6xl gap-2.5"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        {ordered.map(ref => (
          <VideoTile key={trackKey(ref)} trackRef={ref} isLocal={ref.participant.isLocal} />
        ))}
      </div>

      {alone && (
        <div
          className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-full px-3 py-1 text-[11px]"
          style={{ background: 'rgba(0,0,0,0.4)', color: 'rgba(251,245,221,0.6)' }}
        >
          Waiting for others to join…
        </div>
      )}
    </section>
  );
}

export const VideoGrid = memo(VideoGridImpl);
