'use client';

/**
 * useWsStore — lightweight client-side WS state store.
 *
 * Stores:
 *  - connectionState        — current WS lifecycle phase
 *  - onlineUserIds          — Set of currently-online user ids
 *  - lastSeenByUser         — Map<userId, Date> — last offline timestamp
 *  - messagesByConversation — ChatMessage[] keyed by conversation private_id
 *  - typingByConversation   — typing user-id set per conversation
 *
 * The actual WebSocket lifecycle is managed in use-chat-socket.ts.
 * This store is purely reactive state so components can subscribe without
 * importing the socket hook directly.
 */

import type { ChatMessage } from '@/types/chat';
import type { WsConnectionState } from '@/types/realtime';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type WsState = {
  connectionState: WsConnectionState;
  /** User ids that are currently online (from 'online'/'offline' events). */
  onlineUserIds: Set<number>;
  /** Last time a user was seen online (recorded when they go offline). */
  lastSeenByUser: Map<number, Date>;
  /** Live messages received via WS, keyed by conversation private_id. */
  messagesByConversation: Map<string, ChatMessage[]>;
  /** Typing user-id set, keyed by conversation private_id. */
  typingByConversation: Map<string, Set<number>>;
  /** Known user names fetched from REST — id → name. */
  userNames: Map<number, string>;
};

type WsActions = {
  setConnectionState: (state: WsConnectionState) => void;
  setOnline: (userId: number) => void;
  setOffline: (userId: number) => void;
  pushMessage: (privateId: string, message: ChatMessage) => void;
  /** Replace messages for a conversation (e.g. after REST history load). */
  setMessages: (privateId: string, messages: ChatMessage[]) => void;
  /** Merge WS live message into existing REST history — deduplicates by id. */
  mergeMessage: (privateId: string, message: ChatMessage) => void;
  setTyping: (privateId: string, userId: number, isTyping: boolean) => void;
  /** Cache a user's display name so it's available for message rendering. */
  setUserName: (userId: number, name: string) => void;
  /** Remove all optimistic (pending-*) messages for a conversation on server confirm. */
  flushPending: (privateId: string) => void;
  markDelivered: (messageId: string) => void;
  markRead: (messageId: string) => void;
  reset: () => void;
};

const initial: WsState = {
  connectionState: 'idle',
  onlineUserIds: new Set(),
  lastSeenByUser: new Map(),
  messagesByConversation: new Map(),
  typingByConversation: new Map(),
  userNames: new Map(),
};

export const useWsStore = create<WsState & WsActions>()(
  devtools(
    set => ({
      ...initial,

      setConnectionState: connectionState => set({ connectionState }),

      setOnline: userId =>
        set((s) => {
          const next = new Set(s.onlineUserIds);
          next.add(userId);
          return { onlineUserIds: next };
        }),

      setOffline: userId =>
        set((s) => {
          const nextOnline = new Set(s.onlineUserIds);
          nextOnline.delete(userId);
          const nextSeen = new Map(s.lastSeenByUser);
          nextSeen.set(userId, new Date());
          return { onlineUserIds: nextOnline, lastSeenByUser: nextSeen };
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
          const hasDup = existing.some(m => m.id === message.id);
          if (hasDup) {
            return {};
          }
          map.set(privateId, [...existing, message]);
          return { messagesByConversation: map };
        }),

      setTyping: (privateId, userId, isTyping) =>
        set((s) => {
          const map = new Map(s.typingByConversation);
          const conv = new Set(map.get(privateId) ?? []);
          if (isTyping) {
            conv.add(userId);
          } else {
            conv.delete(userId);
          }
          map.set(privateId, conv);
          return { typingByConversation: map };
        }),

      setUserName: (userId, name) =>
        set((s) => {
          const next = new Map(s.userNames);
          next.set(userId, name);
          return { userNames: next };
        }),

      flushPending: privateId =>
        set((s) => {
          const map = new Map(s.messagesByConversation);
          const existing = map.get(privateId);
          if (!existing) {
            return {};
          }
          map.set(privateId, existing.filter(m => !m.id.startsWith('pending-')));
          return { messagesByConversation: map };
        }),

      markDelivered: messageId =>
        set((s) => {
          const map = new Map(s.messagesByConversation);
          for (const [privId, msgs] of map.entries()) {
            const idx = msgs.findIndex(m => m.id === messageId);
            const msg = msgs[idx];
            if (idx !== -1 && msg) {
              if (msg.updatedAt) {
                return {};
              }
              const newMsgs = [...msgs];
              newMsgs[idx] = { ...msg, updatedAt: new Date() };
              map.set(privId, newMsgs);
              return { messagesByConversation: map };
            }
          }
          return {};
        }),

      markRead: messageId =>
        set((s) => {
          const map = new Map(s.messagesByConversation);
          for (const [privId, msgs] of map.entries()) {
            const idx = msgs.findIndex(m => m.id === messageId);
            const msg = msgs[idx];
            if (idx !== -1 && msg) {
              const newMsgs = [...msgs];
              newMsgs[idx] = { ...msg, readAt: new Date() };
              map.set(privId, newMsgs);
              return { messagesByConversation: map };
            }
          }
          return {};
        }),

      reset: () => set(initial),
    }),
    { name: 'WsStore' },
  ),
);
