/**
 * useChatStore — Client-side chat state management
 * Handles conversations, messages, and typing indicators
 */
'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ChatState, Conversation, ChatMessage, TypingIndicator } from '@/types/chat';

interface ChatActions {
  setConversations: (conversations: Conversation[]) => void;
  setCurrentConversation: (conversationId: string | null) => void;
  setMessages: (conversationId: string, messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  setTypingIndicators: (indicators: TypingIndicator[]) => void;
  addTypingIndicator: (indicator: TypingIndicator) => void;
  removeTypingIndicator: (conversationId: string, userId: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: ChatState = {
  conversations: new Map(),
  currentConversationId: null,
  messages: new Map(),
  typingIndicators: new Map(),
  isLoading: false,
  error: null,
};

export const useChatStore = create<ChatState & ChatActions>()(
  devtools(
    set => ({
      ...initialState,
      setConversations: conversations => {
        const map = new Map(conversations.map(c => [c.id, c]));
        set({ conversations: map });
      },
      setCurrentConversation: conversationId => set({ currentConversationId: conversationId }),
      setMessages: (conversationId, messages) => {
        set(state => {
          const newMessages = new Map(state.messages);
          newMessages.set(conversationId, messages);
          return { messages: newMessages };
        });
      },
      addMessage: message => {
        set(state => {
          const messages = new Map(state.messages);
          const convMessages = messages.get(message.conversationId) || [];
          messages.set(message.conversationId, [...convMessages, message]);
          return { messages };
        });
      },
      setTypingIndicators: indicators => {
        const map = new Map(indicators.map(ind => [`${ind.conversationId}:${ind.userId}`, ind]));
        set({ typingIndicators: map });
      },
      addTypingIndicator: indicator => {
        set(state => {
          const newMap = new Map(state.typingIndicators);
          newMap.set(`${indicator.conversationId}:${indicator.userId}`, indicator);
          return { typingIndicators: newMap };
        });
      },
      removeTypingIndicator: (conversationId, userId) => {
        set(state => {
          const newMap = new Map(state.typingIndicators);
          newMap.delete(`${conversationId}:${userId}`);
          return { typingIndicators: newMap };
        });
      },
      setLoading: loading => set({ isLoading: loading }),
      setError: error => set({ error }),
      reset: () => set(initialState),
    }),
    { name: 'ChatStore' },
  ),
);
