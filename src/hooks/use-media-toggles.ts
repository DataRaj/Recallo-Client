'use client';

import { useCallback, useState } from 'react';
import { useLocalParticipant } from '@livekit/components-react';
import { toast } from 'sonner';

function mediaErrorMessage(err: unknown): string {
  const name = (err as { name?: string })?.name;
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    return 'Permission denied. Allow access in your browser settings.';
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return 'No device found.';
  }
  if (name === 'NotReadableError') {
    return 'Device is already in use by another app.';
  }
  return (err as Error)?.message ?? 'Could not toggle device';
}

export function useMediaToggles() {
  const { localParticipant } = useLocalParticipant();
  const [micBusy, setMicBusy] = useState(false);
  const [camBusy, setCamBusy] = useState(false);
  const [screenBusy, setScreenBusy] = useState(false);

  const micEnabled = localParticipant.isMicrophoneEnabled;
  const camEnabled = localParticipant.isCameraEnabled;
  const screenShareEnabled = localParticipant.isScreenShareEnabled;

  const toggleMic = useCallback(async () => {
    if (micBusy) return;
    setMicBusy(true);
    try {
      await localParticipant.setMicrophoneEnabled(!localParticipant.isMicrophoneEnabled);
    }
    catch (err) {
      toast.error(mediaErrorMessage(err));
    }
    finally {
      setMicBusy(false);
    }
  }, [localParticipant, micBusy]);

  const toggleCam = useCallback(async () => {
    if (camBusy) return;
    setCamBusy(true);
    try {
      await localParticipant.setCameraEnabled(!localParticipant.isCameraEnabled);
    }
    catch (err) {
      toast.error(mediaErrorMessage(err));
    }
    finally {
      setCamBusy(false);
    }
  }, [localParticipant, camBusy]);

  const toggleScreenShare = useCallback(async () => {
    if (screenBusy) return;
    setScreenBusy(true);
    try {
      await localParticipant.setScreenShareEnabled(!localParticipant.isScreenShareEnabled);
    }
    catch (err) {
      // The browser picker throws NotAllowedError when the user cancels — that
      // isn't an error worth surfacing.
      const name = (err as { name?: string })?.name;
      if (name !== 'NotAllowedError' && name !== 'AbortError') {
        toast.error(mediaErrorMessage(err));
      }
    }
    finally {
      setScreenBusy(false);
    }
  }, [localParticipant, screenBusy]);

  return {
    micEnabled,
    camEnabled,
    screenShareEnabled,
    micBusy,
    camBusy,
    screenBusy,
    toggleMic,
    toggleCam,
    toggleScreenShare,
  };
}
