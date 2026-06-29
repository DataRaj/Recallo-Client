'use client';

/**
 * WsProvider — mounts the WebSocket connection once per chat layout.
 *
 * Wraps children in a React context that exposes the send helpers so any
 * component in the chat tree can send messages without re-connecting.
 *
 * Mount in: src/app/[locale]/(protected)/chat/layout.tsx
 */

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useChatSocket } from '@/hooks/use-chat-socket';
import type { WsSendMessage, WsSendTyping } from '@/types/realtime';

interface WsContextValue {
  sendMessage: (payload: WsSendMessage) => void;
  sendTyping: (payload: WsSendTyping) => void;
  sendDelivered: (messageId: number) => void;
  sendRead: (messageId: number) => void;
}

const WsContext = createContext<WsContextValue | null>(null);

export function WsProvider({ children }: { children: ReactNode }) {
  const { sendMessage, sendTyping, sendDelivered, sendRead } = useChatSocket();

  const value = useMemo(
    () => ({ sendMessage, sendTyping, sendDelivered, sendRead }),
    [sendMessage, sendTyping, sendDelivered, sendRead],
  );

  return <WsContext.Provider value={value}>{children}</WsContext.Provider>;
}

export function useWs(): WsContextValue {
  const ctx = useContext(WsContext);
  if (!ctx) throw new Error('useWs must be used inside <WsProvider>');
  return ctx;
}
