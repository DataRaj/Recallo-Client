'use client';

import { useRoomContext } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import { useEffect, useState } from 'react';

export function useIsRecording(): boolean {
  const room = useRoomContext();
  const [isRecording, setIsRecording] = useState(room.isRecording);

  useEffect(() => {
    setIsRecording(room.isRecording);
    const onChange = () => setIsRecording(room.isRecording);
    room.on(RoomEvent.RecordingStatusChanged, onChange);
    return () => {
      room.off(RoomEvent.RecordingStatusChanged, onChange);
    };
  }, [room]);

  return isRecording;
}
