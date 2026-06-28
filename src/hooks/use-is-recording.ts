'use client';

import { useEffect, useState } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';

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
