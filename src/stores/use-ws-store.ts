'use client';

/**
 * useWsStore — lightweight client-side WS state store.
 *
 * Stores:
 *  - connectionState   — current WS lifecycle phase
 *  - onlineUserIds     — Set of currently-online user ids (from presence events)
 *  - messagesByConversation — ChatMessage[] keyed by conversation private_id
 *  - typingByConversation   — typing user-id set per conversation
 *
 * The actual WebSocket lifecycle is managed in use-chat-socket.ts.
 * This store is purely reactive state so components can subscribe without
 * importing the socket hook directly.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { WsConnectionState } from '@/types/realtime';
import type { ChatMessage } from '@/types/chat';

interface WsState {
  connectionState: WsConnectionState;
  /** User ids that are currently online (from 'online'/'offline' events). */
  onlineUserIds: Set<number>;
  /** Live messages received via WS, keyed by conversation private_id. */
  messagesByConversation: Map<string, ChatMessage[]>;
  /** Typing user-id set, keyed by conversation private_id. */
  typingByConversation: Map<string, Set<number>>;
}

interface WsActions {
  setConnectionState: (state: WsConnectionState) => void;
  setOnline: (userId: number) => void;
  setOffline: (userId: number) => void;
  pushMessage: (privateId: string, message: ChatMessage) => void;
  /** Replace messages for a conversation (e.g. after REST history load). */
  setMessages: (privateId: string, messages: ChatMessage[]) => void;
  /** Merge WS live message into existing REST history — deduplicates by id. */
  mergeMessage: (privateId: string, message: ChatMessage) => void;
  setTyping: (privateId: string, userId: number, isTyping: boolean) => void;
  reset: () => void;
}

const initial: WsState = {
  connectionState: 'idle',
  onlineUserIds: new Set(),
  messagesByConversation: new Map(),
  typingByConversation: new Map(),
};

export const useWsStore = create<WsState & WsActions>()(
  devtools(
    (set) => ({
      ...initial,

      setConnectionState: (connectionState) => set({ connectionState }),

      setOnline: (userId) =>
        set((s) => {
          const next = new Set(s.onlineUserIds);
          next.add(userId);
          return { onlineUserIds: next };
        }),

      setOffline: (userId) =>
        set((s) => {
          const next = new Set(s.onlineUserIds);
          next.delete(userId);
          return { onlineUserIds: next };
        }),

      pushMessage: (privateId, message) =>
        set((s) => {
          const map = new Map(s.messagesByConversation);
          const existing = map.get(privateId) ?? [];
          map.set(privateId, [...existing, message]);
          return { messagesByConversation: map };
        }),

      setMessages: (privateId, messages) =>
        set((s) => {
          const map = new Map(s.messagesByConversation);
          map.set(privateId, messages);
          return { messagesByConversation: map };
        }),

      mergeMessage: (privateId, message) =>
        set((s) => {
          const map = new Map(s.messagesByConversation);
          const existing = map.get(privateId) ?? [];
          const hasDup = existing.some((m) => m.id === message.id);
          if (hasDup) return {};
          map.set(privateId, [...existing, message]);
          return { messagesByConversation: map };
        }),

      setTyping: (privateId, userId, isTyping) =>
        set((s) => {
          const map = new Map(s.typingByConversation);
          const conv = new Set(map.get(privateId) ?? []);
          if (isTyping) conv.add(userId);
          else conv.delete(userId);
          map.set(privateId, conv);
          return { typingByConversation: map };
        }),

      reset: () => set(initial),
    }),
    { name: 'WsStore' },
  ),
);
