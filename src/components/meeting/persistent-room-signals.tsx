'use client';

import { useHandRaiseSync } from '@/hooks/use-hand-raise';
import { useChatReceiver } from '@/hooks/use-meeting-chat';

/**
 * Mounts room-wide data-channel listeners (chat + hand-raise) exactly once, at
 * the ActiveMeetingProvider level, so incoming messages and hand-raise state
 * keep flowing while the meeting is minimised to Picture-in-Picture and the
 * full-screen meeting UI is unmounted. Renders nothing.
 */
export function PersistentRoomSignals() {
  useChatReceiver();
  useHandRaiseSync();
  return null;
}
