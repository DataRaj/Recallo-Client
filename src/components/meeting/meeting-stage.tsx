'use client';

import { isTrackReference, useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { Grid3x3, Monitor, MonitorX } from 'lucide-react';
import { memo, useEffect } from 'react';
import { FocusView } from '@/components/meeting/focus-view';
import { VideoGrid } from '@/components/meeting/video-grid';
import { useMediaToggles } from '@/hooks/use-media-toggles';
import { useMeetingStore } from '@/stores/use-meeting-store';

function StageFab({ focused, onToggleView }: { focused: boolean; onToggleView: () => void }) {
  const { screenShareEnabled, screenBusy, toggleScreenShare } = useMediaToggles();

  return (
    <div className="absolute top-3 right-3 z-10 flex gap-2">
      {screenShareEnabled && (
        <button
          type="button"
          onClick={toggleScreenShare}
          disabled={screenBusy}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium text-white shadow-lg transition-all hover:opacity-95 disabled:opacity-60"
          style={{ background: '#BA5A5A' }}
        >
          <MonitorX size={13} />
          Stop sharing
        </button>
      )}
      <button
        type="button"
        onClick={onToggleView}
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium shadow-lg transition-all hover:opacity-95"
        style={{ background: 'rgba(255,255,255,0.12)', color: '#FBF5DD', backdropFilter: 'blur(8px)' }}
      >
        {focused ? <Grid3x3 size={13} /> : <Monitor size={13} />}
        {focused ? 'Grid view' : 'Focus screen'}
      </button>
    </div>
  );
}

function MeetingStageImpl() {
  const screenTracks = useTracks(
    [{ source: Track.Source.ScreenShare, withPlaceholder: false }],
    { onlySubscribed: false },
  ).filter(isTrackReference);

  const forceGrid = useMeetingStore(s => s.forceGrid);
  const setForceGrid = useMeetingStore(s => s.setForceGrid);

  const hasScreen = screenTracks.length > 0;
  const focused = hasScreen && !forceGrid;

  // Reset the grid override once sharing stops, so the next share auto-focuses.
  useEffect(() => {
    if (!hasScreen && forceGrid) {
      setForceGrid(false);
    }
  }, [hasScreen, forceGrid, setForceGrid]);

  const primary = screenTracks[screenTracks.length - 1];

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {focused && primary
        ? <FocusView screenTrack={primary} />
        : <VideoGrid />}
      {hasScreen && (
        <StageFab focused={focused} onToggleView={() => setForceGrid(!forceGrid)} />
      )}
    </div>
  );
}

export const MeetingStage = memo(MeetingStageImpl);
