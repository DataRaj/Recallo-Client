"use client";

/**
 * WsProvider — mounts the WebSocket connection once per chat layout.
 *
 * Wraps children in a React context that exposes the send helpers so any
 * component in the chat tree can send messages without re-connecting.
 *
 * Mount in: src/app/[locale]/(protected)/chat/layout.tsx
 */

import type { ReactNode } from "react";
import type { WsSendMessage, WsSendTyping } from "@/types/realtime";
import { createContext, use, useMemo } from "react";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { useTokenRefresh } from "@/hooks/use-token-refresh";

type WsContextValue = {
  sendMessage: (payload: WsSendMessage) => void;
  sendTyping: (payload: WsSendTyping) => void;
  sendDelivered: (messageId: number) => void;
  sendRead: (messageId: number) => void;
};

const WsContext = createContext<WsContextValue | null>(null);

export function WsProvider({ children }: { children: ReactNode }) {
  const { sendMessage, sendTyping, sendDelivered, sendRead } = useChatSocket();
  useTokenRefresh();

  const value = useMemo(
    () => ({ sendMessage, sendTyping, sendDelivered, sendRead }),
    [sendMessage, sendTyping, sendDelivered, sendRead],
  );

  return <WsContext value={value}>{children}</WsContext>;
}

export function useWs(): WsContextValue {
  const ctx = use(WsContext);
  if (!ctx) {
    throw new Error("useWs must be used inside <WsProvider>");
  }
  return ctx;
}
