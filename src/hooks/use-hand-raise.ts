'use client';

import type { RemoteParticipant } from 'livekit-client';
import type { HandSignal } from '@/types/meeting';
import { useLocalParticipant, useRoomContext } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import { useCallback, useEffect } from 'react';
import { useMeetingStore } from '@/stores/use-meeting-store';
import { SIGNAL_TOPIC } from '@/types/meeting';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function isHandSignal(value: unknown): value is HandSignal {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const s = value as Record<string, unknown>;
  return s.v === 1 && s.type === 'hand' && typeof s.raised === 'boolean';
}

function encodeHand(raised: boolean): Uint8Array {
  const signal: HandSignal = { v: 1, type: 'hand', raised };
  return encoder.encode(JSON.stringify(signal));
}

export function useHandRaiseSync() {
  const room = useRoomContext();
  const setHandRaised = useMeetingStore(s => s.setHandRaised);
  const clearHand = useMeetingStore(s => s.clearHand);

  useEffect(() => {
    const onData = (
      payload: Uint8Array,
      participant?: RemoteParticipant,
      _kind?: unknown,
      topic?: string,
    ) => {
      if (topic !== SIGNAL_TOPIC || !participant) {
        return;
      }
      try {
        const parsed: unknown = JSON.parse(decoder.decode(payload));
        if (isHandSignal(parsed)) {
          setHandRaised(participant.identity, parsed.raised);
        }
      } catch {
        // Ignore malformed signals.
      }
    };

    const onDisconnected = (participant: RemoteParticipant) => {
      clearHand(participant.identity);
    };

    const onConnected = (participant: RemoteParticipant) => {
      // Tell the newcomer whether our hand is currently up.
      const raised = useMeetingStore.getState().raisedHands[room.localParticipant.identity];
      if (raised) {
        void room.localParticipant.publishData(encodeHand(true), {
          reliable: true,
          topic: SIGNAL_TOPIC,
          destinationIdentities: [participant.identity],
        });
      }
    };

    room.on(RoomEvent.DataReceived, onData);
    room.on(RoomEvent.ParticipantDisconnected, onDisconnected);
    room.on(RoomEvent.ParticipantConnected, onConnected);
    return () => {
      room.off(RoomEvent.DataReceived, onData);
      room.off(RoomEvent.ParticipantDisconnected, onDisconnected);
      room.off(RoomEvent.ParticipantConnected, onConnected);
    };
  }, [room, setHandRaised, clearHand]);
}

export function useHandRaiseControl() {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const identity = localParticipant.identity;
  const raised = useMeetingStore(s => s.raisedHands[identity] ?? false);
  const setHandRaised = useMeetingStore(s => s.setHandRaised);

  const toggle = useCallback(async () => {
    const next = !useMeetingStore.getState().raisedHands[identity];
    setHandRaised(identity, next); // optimistic
    try {
      await room.localParticipant.publishData(encodeHand(next), {
        reliable: true,
        topic: SIGNAL_TOPIC,
      });
    } catch {
      setHandRaised(identity, !next); // revert on failure
    }
  }, [room, identity, setHandRaised]);

  return { raised, toggle };
}
