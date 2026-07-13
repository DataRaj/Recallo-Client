'use client';

import type { RemoteParticipant } from 'livekit-client';
import type { ChatEnvelope, ChatMessage } from '@/types/meeting';
import { useRoomContext } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import { useCallback, useEffect } from 'react';
import { colorFor, initialsFor } from '@/components/meeting/avatar';
import { useMeetingStore } from '@/stores/use-meeting-store';
import { CHAT_TOPIC } from '@/types/meeting';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function isChatEnvelope(value: unknown): value is ChatEnvelope {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const e = value as Record<string, unknown>;
  return e.v === 1 && e.type === 'chat' && typeof e.text === 'string'
    && typeof e.id === 'string' && typeof e.senderName === 'string'
    && typeof e.sentAt === 'number';
}

export function useChatReceiver() {
  const room = useRoomContext();
  const addMessage = useMeetingStore(s => s.addMessage);

  useEffect(() => {
    const onData = (
      payload: Uint8Array,
      participant?: RemoteParticipant,
      _kind?: unknown,
      topic?: string,
    ) => {
      if (topic !== CHAT_TOPIC) {
        return;
      }
      try {
        const parsed: unknown = JSON.parse(decoder.decode(payload));
        if (!isChatEnvelope(parsed)) {
          return;
        }
        const identity = participant?.identity ?? parsed.id;
        const message: ChatMessage = {
          id: parsed.id,
          text: parsed.text,
          senderName: parsed.senderName,
          senderIdentity: identity,
          direction: 'incoming',
          sentAt: parsed.sentAt,
          initials: initialsFor(parsed.senderName),
          color: colorFor(identity),
        };
        addMessage(message);
      } catch {
        // Ignore malformed payloads.
      }
    };

    room.on(RoomEvent.DataReceived, onData);
    return () => {
      room.off(RoomEvent.DataReceived, onData);
    };
  }, [room, addMessage]);
}

export function useChatSender() {
  const room = useRoomContext();
  const addMessage = useMeetingStore(s => s.addMessage);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) {
        return;
      }

      const local = room.localParticipant;
      const senderName = local.name || 'You';
      const envelope: ChatEnvelope = {
        v: 1,
        type: 'chat',
        id: crypto.randomUUID(),
        text: trimmed,
        senderName,
        sentAt: Date.now(),
      };

      try {
        await local.publishData(encoder.encode(JSON.stringify(envelope)), {
          reliable: true,
          topic: CHAT_TOPIC,
        });
      } catch {
        // Surface failure to the caller's UI if needed; swallow here so the
        // local echo still appears optimistically.
      }

      addMessage({
        id: envelope.id,
        text: envelope.text,
        senderName,
        senderIdentity: local.identity,
        direction: 'outgoing',
        sentAt: envelope.sentAt,
        initials: initialsFor(senderName),
        color: colorFor(local.identity),
      });
    },
    [room, addMessage],
  );

  return { send };
}
