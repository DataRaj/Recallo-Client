'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Mic, MicOff, Video, VideoOff, Loader2, AlertCircle, Volume2, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { ROUTES } from '@/lib/routes';
import { DisplayNameSchema } from '@/schemas/meeting.schema';
import { initialsFor } from '@/components/meeting/avatar';
import { usePreferencesStore } from '@/stores/use-preferences-store';
import { useMeetingPreferencesStore } from '@/stores/use-meeting-preferences-store';
import type { LobbyConfig } from '@/types/meeting';

interface PreJoinLobbyProps {
  roomTitle: string;
  defaultName: string;
  isHost: boolean;
  mode?: 'meeting' | 'webinar';
  onJoin: (config: LobbyConfig) => Promise<void>;
}

interface DeviceLists {
  audioInput: MediaDeviceInfo[];
  audioOutput: MediaDeviceInfo[];
  videoInput: MediaDeviceInfo[];
}

const EMPTY_DEVICES: DeviceLists = { audioInput: [], audioOutput: [], videoInput: [] };

/** Return the deviceId to actually use: the saved one if still present, else ''. */
function resolveDevice(saved: string, list: MediaDeviceInfo[]): { id: string; missing: boolean } {
  if (!saved) return { id: '', missing: false };
  const found = list.some(d => d.deviceId === saved);
  return { id: found ? saved : '', missing: !found };
}

export function PreJoinLobby({ roomTitle, defaultName, isHost, mode = 'meeting', onJoin }: PreJoinLobbyProps) {
  const muteMicOnJoin = usePreferencesStore(s => s.muteMicOnJoin);
  const cameraOffOnJoin = usePreferencesStore(s => s.cameraOffOnJoin);

  const audioInputId = useMeetingPreferencesStore(s => s.selectedAudioInputId);
  const audioOutputId = useMeetingPreferencesStore(s => s.selectedAudioOutputId);
  const videoInputId = useMeetingPreferencesStore(s => s.selectedVideoInputId);
  const setPref = useMeetingPreferencesStore(s => s.set);

  const [name, setName] = useState(defaultName);
  const [micEnabled, setMicEnabled] = useState(!muteMicOnJoin);
  const [camEnabled, setCamEnabled] = useState(!cameraOffOnJoin);
  const [nameError, setNameError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [joining, setJoining] = useState(false);
  const [devices, setDevices] = useState<DeviceLists>(EMPTY_DEVICES);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // Guard so we only warn once per missing device.
  const warnedRef = useRef(false);

  const stopPreview = useCallback(() => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const refreshDevices = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) return;
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      const next: DeviceLists = {
        audioInput: all.filter(d => d.kind === 'audioinput' && d.deviceId),
        audioOutput: all.filter(d => d.kind === 'audiooutput' && d.deviceId),
        videoInput: all.filter(d => d.kind === 'videoinput' && d.deviceId),
      };
      setDevices(next);

      // Fall back to system default if a saved device is no longer present.
      const checks: Array<[string, MediaDeviceInfo[], 'selectedAudioInputId' | 'selectedAudioOutputId' | 'selectedVideoInputId']> = [
        [audioInputId, next.audioInput, 'selectedAudioInputId'],
        [audioOutputId, next.audioOutput, 'selectedAudioOutputId'],
        [videoInputId, next.videoInput, 'selectedVideoInputId'],
      ];
      let anyMissing = false;
      for (const [saved, list, key] of checks) {
        const { missing } = resolveDevice(saved, list);
        if (missing) {
          anyMissing = true;
          setPref(key, '');
        }
      }
      if (anyMissing && !warnedRef.current) {
        warnedRef.current = true;
        toast('A saved device is unavailable — using the system default.');
      }
    }
    catch {
      // enumerateDevices can throw before permission is granted; ignore.
    }
  }, [audioInputId, audioOutputId, videoInputId, setPref]);

  // Acquire / release the camera preview as the toggle or camera selection changes.
  useEffect(() => {
    if (!camEnabled) {
      stopPreview();
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const constraints: MediaStreamConstraints = {
          video: videoInputId ? { deviceId: { exact: videoInputId } } : true,
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setPermissionDenied(false);
        // Labels become available after permission is granted.
        void refreshDevices();
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
  }, [camEnabled, videoInputId, stopPreview, refreshDevices]);

  // Populate the device lists up-front and keep them fresh on hot-plug.
  useEffect(() => {
    void refreshDevices();
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) return;
    const handler = () => void refreshDevices();
    navigator.mediaDevices.addEventListener('devicechange', handler);
    return () => navigator.mediaDevices.removeEventListener('devicechange', handler);
  }, [refreshDevices]);

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
    const isViewer = mode === 'webinar' && !isHost;
    const joinConfig: LobbyConfig = {
      displayName: result.data,
      micEnabled: isViewer ? false : micEnabled,
      camEnabled: isViewer ? false : camEnabled,
      audioDeviceId: audioInputId || undefined,
      videoDeviceId: videoInputId || undefined,
      audioOutputDeviceId: audioOutputId || undefined,
    };

    try {
      await onJoin(joinConfig);
    }
    catch {
      // Parent surfaces the toast; re-enable the form to retry.
      setJoining(false);
    }
  }, [name, micEnabled, camEnabled, onJoin, stopPreview, mode, isHost, audioInputId, videoInputId, audioOutputId]);

  return (
    <div data-feature="meeting" className="flex h-dvh w-full flex-col items-center justify-center gap-6 px-4" style={{ background: '#141E1F' }}>
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

        {/* Device selection */}
        <div className="flex flex-col gap-2">
          <DeviceSelect
            icon={<Camera size={13} />}
            label="Camera"
            value={videoInputId}
            devices={devices.videoInput}
            fallbackLabel="Default camera"
            onChange={id => setPref('selectedVideoInputId', id)}
          />
          <DeviceSelect
            icon={<Mic size={13} />}
            label="Microphone"
            value={audioInputId}
            devices={devices.audioInput}
            fallbackLabel="Default microphone"
            onChange={id => setPref('selectedAudioInputId', id)}
          />
          <DeviceSelect
            icon={<Volume2 size={13} />}
            label="Speaker"
            value={audioOutputId}
            devices={devices.audioOutput}
            fallbackLabel="Default speaker"
            onChange={id => setPref('selectedAudioOutputId', id)}
          />
        </div>

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

interface DeviceSelectProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  devices: MediaDeviceInfo[];
  fallbackLabel: string;
  onChange: (deviceId: string) => void;
}

function DeviceSelect({ icon, label, value, devices, fallbackLabel, onChange }: DeviceSelectProps) {
  return (
    <div
      className="flex items-center gap-2 rounded-[10px] px-3 py-2"
      style={{ background: '#273338', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <span className="shrink-0" style={{ color: 'rgba(251,245,221,0.6)' }}>{icon}</span>
      <select
        aria-label={label}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="min-w-0 flex-1 bg-transparent text-xs focus:outline-none"
        style={{ color: '#FBF5DD' }}
      >
        <option value="" style={{ color: '#141E1F' }}>{fallbackLabel}</option>
        {devices.map((d, i) => (
          <option key={d.deviceId} value={d.deviceId} style={{ color: '#141E1F' }}>
            {d.label || `${label} ${i + 1}`}
          </option>
        ))}
      </select>
    </div>
  );
}
