'use client';

import type { ChatMessage } from '@/types/meeting';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type SidebarTab = 'none' | 'chat' | 'people';

type MeetingState = {
  sidebar: SidebarTab;
  unreadChat: number;
  messages: ChatMessage[];
  /** identity → hand-raised, kept in sync over the signal data channel. */
  raisedHands: Record<string, boolean>;
  /** User override to stay on the grid even while a screen share is active. */
  forceGrid: boolean;
};

type MeetingActions = {
  setSidebar: (tab: SidebarTab) => void;
  toggleSidebar: (tab: Exclude<SidebarTab, 'none'>) => void;
  addMessage: (message: ChatMessage) => void;
  markChatRead: () => void;
  setHandRaised: (identity: string, raised: boolean) => void;
  clearHand: (identity: string) => void;
  setForceGrid: (forceGrid: boolean) => void;
  reset: () => void;
};

const initialState: MeetingState = {
  sidebar: 'none',
  unreadChat: 0,
  messages: [],
  raisedHands: {},
  forceGrid: false,
};

export const useMeetingStore = create<MeetingState & MeetingActions>()(
  devtools(
    set => ({
      ...initialState,

      setSidebar: sidebar =>
        set(state => ({
          sidebar,
          unreadChat: sidebar === 'chat' ? 0 : state.unreadChat,
        })),

      toggleSidebar: tab =>
        set((state) => {
          const next = state.sidebar === tab ? 'none' : tab;
          return {
            sidebar: next,
            unreadChat: next === 'chat' ? 0 : state.unreadChat,
          };
        }),

      addMessage: message =>
        set(state => ({
          messages: [...state.messages, message],
          unreadChat:
            state.sidebar === 'chat' || message.direction === 'outgoing'
              ? state.unreadChat
              : state.unreadChat + 1,
        })),

      markChatRead: () => set({ unreadChat: 0 }),

      setHandRaised: (identity, raised) =>
        set((state) => {
          if ((state.raisedHands[identity] ?? false) === raised) {
            return state;
          }
          return { raisedHands: { ...state.raisedHands, [identity]: raised } };
        }),

      clearHand: identity =>
        set((state) => {
          if (!(identity in state.raisedHands)) {
            return state;
          }
          const next = { ...state.raisedHands };
          delete next[identity];
          return { raisedHands: next };
        }),

      setForceGrid: forceGrid => set({ forceGrid }),

      reset: () => set(initialState),
    }),
    { name: 'MeetingStore' },
  ),
);
