'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Mic, MicOff, Video, VideoOff, Loader2, AlertCircle } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { DisplayNameSchema } from '@/schemas/meeting.schema';
import { initialsFor } from '@/components/meeting/avatar';
import type { LobbyConfig } from '@/types/meeting';

interface PreJoinLobbyProps {
  roomTitle: string;
  defaultName: string;
  isHost: boolean;
  mode?: 'meeting' | 'webinar';
  onJoin: (config: LobbyConfig) => Promise<void>;
}

export function PreJoinLobby({ roomTitle, defaultName, isHost, mode = 'meeting', onJoin }: PreJoinLobbyProps) {
  const [name, setName] = useState(defaultName);
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [nameError, setNameError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [joining, setJoining] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopPreview = useCallback(() => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  // Acquire / release the camera preview as the toggle changes.
  useEffect(() => {
    if (!camEnabled) {
      stopPreview();
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setPermissionDenied(false);
      }
      catch (err) {
        const denied = (err as { name?: string })?.name === 'NotAllowedError';
        if (!cancelled && denied) {
          setPermissionDenied(true);
          setCamEnabled(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [camEnabled, stopPreview]);

  useEffect(() => stopPreview, [stopPreview]);

  const handleJoin = useCallback(async () => {
    const result = DisplayNameSchema.safeParse(name);
    if (!result.success) {
      setNameError(result.error.issues[0]?.message ?? 'Invalid name');
      return;
    }
    setNameError(null);
    setJoining(true);
    stopPreview(); // release devices so LiveKit can re-acquire cleanly

    // Webinar viewers join with audio/video off.
    const joinConfig: LobbyConfig = mode === 'webinar' && !isHost
      ? { displayName: result.data, micEnabled: false, camEnabled: false }
      : { displayName: result.data, micEnabled, camEnabled };

    try {
      await onJoin(joinConfig);
    }
    catch {
      // Parent surfaces the toast; re-enable the form to retry.
      setJoining(false);
    }
  }, [name, micEnabled, camEnabled, onJoin, stopPreview, mode, isHost]);

  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center gap-6 px-4" style={{ background: '#141E1F' }}>
      <div className="flex w-full max-w-md flex-col gap-5">
        <div className="text-center">
          <h1 className="text-lg font-semibold" style={{ color: '#FBF5DD' }}>{roomTitle}</h1>
          <p className="mt-1 text-sm" style={{ color: 'rgba(251,245,221,0.5)' }}>
            Ready to join? Check your camera and mic first.
          </p>
        </div>

        {/* Preview */}
        <div
          className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-[14px]"
          style={{ background: '#1E2C2E', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {camEnabled
            ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full -scale-x-100 object-cover"
                />
              )
            : (
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full text-lg font-semibold text-white"
                  style={{ background: '#9CC5A1' }}
                >
                  {initialsFor(name || 'Guest')}
                </div>
              )}

          {/* Device toggles */}
          <div className="absolute bottom-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMicEnabled(v => !v)}
              title={micEnabled ? 'Mic on' : 'Mic off'}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:scale-105"
              style={{
                background: micEnabled ? 'rgba(255,255,255,0.15)' : '#BA5A5A',
                color: '#FBF5DD',
              }}
            >
              {micEnabled ? <Mic size={16} /> : <MicOff size={16} />}
            </button>
            <button
              type="button"
              onClick={() => setCamEnabled(v => !v)}
              title={camEnabled ? 'Camera on' : 'Camera off'}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:scale-105"
              style={{
                background: camEnabled ? 'rgba(255,255,255,0.15)' : '#BA5A5A',
                color: '#FBF5DD',
              }}
            >
              {camEnabled ? <Video size={16} /> : <VideoOff size={16} />}
            </button>
          </div>
        </div>

        {permissionDenied && (
          <div
            className="flex items-start gap-2 rounded-[10px] p-3 text-xs"
            style={{ background: 'rgba(186,90,90,0.1)', color: '#BA5A5A', border: '1px solid rgba(186,90,90,0.2)' }}
          >
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            Camera permission was blocked. You can still join with your camera off, or allow access in your browser settings.
          </div>
        )}

        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="lobby-name" className="text-xs font-medium" style={{ color: 'rgba(251,245,221,0.6)' }}>
            Your display name
          </label>
          <input
            id="lobby-name"
            value={name}
            maxLength={50}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleJoin();
            }}
            placeholder="e.g. Alex Kim"
            className="rounded-[10px] px-3 py-2.5 text-sm focus:outline-none"
            style={{ background: '#273338', color: '#FBF5DD', border: '1px solid rgba(255,255,255,0.08)' }}
          />
          {nameError && <p className="text-xs" style={{ color: '#BA5A5A' }}>{nameError}</p>}
        </div>

        <button
          type="button"
          onClick={handleJoin}
          disabled={joining}
          className="flex h-11 items-center justify-center gap-2 rounded-[12px] text-sm font-semibold transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-60"
          style={{ background: '#9CC5A1', color: '#141E1F' }}
        >
          {joining && <Loader2 size={16} className="animate-spin" />}
          {joining
            ? 'Joining…'
            : mode === 'webinar'
              ? isHost ? 'Start webinar' : 'Join webinar'
              : isHost ? 'Start meeting' : 'Join meeting'}
        </button>

        <Link href={ROUTES.HOME} className="text-center text-xs hover:underline" style={{ color: 'rgba(251,245,221,0.4)' }}>
          Cancel
        </Link>
      </div>
    </div>
  );
}
