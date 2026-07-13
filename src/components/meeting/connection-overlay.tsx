'use client';

import { useConnectionState } from '@livekit/components-react';
import { ConnectionState } from 'livekit-client';
import { Loader2 } from 'lucide-react';

export function ConnectionOverlay() {
  const state = useConnectionState();

  if (state === ConnectionState.Connected) {
    return null;
  }

  const label
    = state === ConnectionState.Reconnecting
      ? 'Reconnecting…'
      : state === ConnectionState.Connecting
        ? 'Connecting…'
        : state === ConnectionState.Disconnected
          ? 'Disconnected'
          : 'Connecting…';

  const showSpinner
    = state === ConnectionState.Connecting || state === ConnectionState.Reconnecting;

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3"
      style={{ background: 'rgba(20,30,31,0.82)', backdropFilter: 'blur(4px)' }}
    >
      {showSpinner && <Loader2 className="size-7 animate-spin" style={{ color: '#9CC5A1' }} />}
      <p className="text-sm font-medium" style={{ color: '#FBF5DD' }}>{label}</p>
    </div>
  );
}
