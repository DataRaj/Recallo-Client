'use client';

/**
 * useChatSocket — WebSocket lifecycle hook.
 *
 * Connects to: `${API_URL}/api/v1/ws?token=<accessToken>`
 * Auth: access token in query param (degrades gracefully until server adds ?token= support).
 *
 * Features:
 *  - Exponential-backoff reconnect (max 30 s).
 *  - Outbound queue — messages sent while disconnected are flushed on reconnect.
 *  - Maps all inbound events to WsStore actions.
 *  - Heartbeat ack (sends empty JSON back for keepalive if server sends heartbeat).
 *  - Typing debounce helpers returned for components.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/use-auth-store';
import { useWsStore } from '@/stores/use-ws-store';
import { Env } from '@/libs/Env';
import type {
  WsInboundEvent,
  WsPresencePayload,
  WsMessagePayload,
  WsReceiptPayload,
  WsTypingPayload,
  WsSendMessage,
  WsSendTyping,
  WsSendDelivered,
  WsSendRead,
  WsMessageData,
} from '@/types/realtime';
import type { ChatMessage, MessageType } from '@/types/chat';

// Reconnect schedule: 1 s, 2 s, 4 s, 8 s, 16 s, 30 s (capped).
const BACKOFF_STEPS = [1000, 2000, 4000, 8000, 16000, 30000];

function wsUrl(accessToken: string): string {
  const base = (Env.NEXT_PUBLIC_API_URL ?? '').replace(/^http/, 'ws');
  return `${base}/api/v1/ws?token=${encodeURIComponent(accessToken)}`;
}

/** Normalise a WsMessageData into a ChatMessage stored in the WsStore. */
function normaliseMessage(data: WsMessageData, currentUserId: number): ChatMessage {
  const messageType: MessageType =
    data.message_type === 'gif' ? 'gif' :
    data.message_type === 'file' ? 'file' : 'text';

  return {
    id: String(data.id),
    conversationId: data.private_id,
    senderId: data.from_id,
    content: data.content,
    messageType,
    createdAt: new Date(data.created_at),
    gifUrl: data.gif_url,
    attachment: data.file_name
      ? {
          id: String(data.id),
          filename: data.file_name,
          filesize: data.file_size ?? 0,
          mimeType: data.file_mime ?? 'application/octet-stream',
          url: data.file_data
            ? `data:${data.file_mime ?? 'application/octet-stream'};base64,${data.file_data}`
            : data.content,
        }
      : undefined,
    readAt: data.read ? new Date() : undefined,
    // Mark outgoing optimistically when from current user
    updatedAt: data.from_id === currentUserId ? new Date() : undefined,
  };
}

export function useChatSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backoffIdx = useRef(0);
  const outboundQueue = useRef<string[]>([]);
  const mountedRef = useRef(true);

  const {
    setConnectionState,
    setOnline,
    setOffline,
    mergeMessage,
    setTyping,
    flushPending,
    markDelivered,
    markRead,
  } = useWsStore.getState();

  const flushQueue = useCallback(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    while (outboundQueue.current.length > 0) {
      const msg = outboundQueue.current.shift()!;
      ws.send(msg);
    }
  }, []);

  const sendRaw = useCallback((payload: unknown) => {
    const json = JSON.stringify(payload);
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(json);
    } else {
      outboundQueue.current.push(json);
    }
  }, []);

  const connect = useCallback(() => {
    const { accessToken, user } = useAuthStore.getState();
    if (!accessToken || !user) {
      // Not authenticated — stay idle.
      setConnectionState('idle');
      return;
    }

    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
    }

    setConnectionState('connecting');
    const ws = new WebSocket(wsUrl(accessToken));
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) { ws.close(); return; }
      backoffIdx.current = 0;
      setConnectionState('open');
      flushQueue();
    };

    ws.onmessage = (evt) => {
      if (!mountedRef.current) return;
      try {
        const event = JSON.parse(evt.data as string) as WsInboundEvent;
        const { user: currentUser } = useAuthStore.getState();
        const currentUserId = currentUser?.id ?? -1;

        switch (event.event_type) {
          case 'current_user': {
            const users = event.payload as Array<{ id: number }>;
            if (Array.isArray(users)) {
              users.forEach((u) => {
                if (u && u.id) setOnline(u.id);
              });
            }
            break;
          }
          case 'online':
            setOnline((event.payload as { id: number }).id);
            break;
          case 'offline':
            setOffline((event.payload as { id: number }).id);
            break;
          case 'message': {
            const { message } = event.payload as WsMessagePayload;
            const msg = normaliseMessage(message, currentUserId);
            
            // Remove optimistic pending messages before merging confirmed server echo
            flushPending(String(message.private_id));
            mergeMessage(String(message.private_id), msg);
            
            // Auto-send delivered receipt only for incoming (not our own echo).
            if (message.from_id !== currentUserId) {
              const ack: WsSendDelivered = { message_id: Number(message.id) };
              sendRaw({ event_type: 'delivered', payload: ack });
            }
            break;
          }
          case 'typing':
            setTyping(
              String((event.payload as WsTypingPayload).private_id),
              (event.payload as WsTypingPayload).user_id,
              (event.payload as WsTypingPayload).is_typing,
            );
            break;
          case 'heartbeat':
            // The browser's native WebSocket automatically responds to the server's
            // Ping control frame (Opcode 9) with a Pong (Opcode 10).
            // We do NOT need to send an application-level JSON response here,
            // otherwise the server rejects it as an invalid event format.
            break;
          case 'delivered':
            markDelivered(String((event.payload as WsReceiptPayload).message_id));
            break;
          case 'read':
            markRead(String((event.payload as WsReceiptPayload).message_id));
            break;
          case 'error':
          case 'shutdown':
          default:
            break;
        }
      } catch {
        // Ignore non-JSON or malformed frames.
      }
    };

    ws.onerror = () => {
      // onclose fires right after, so let that drive reconnect logic.
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      setConnectionState('reconnecting');
      const delay = BACKOFF_STEPS[Math.min(backoffIdx.current, BACKOFF_STEPS.length - 1)];
      backoffIdx.current = Math.min(backoffIdx.current + 1, BACKOFF_STEPS.length - 1);
      reconnectTimer.current = setTimeout(connect, delay);
    };
  }, [flushQueue, flushPending, mergeMessage, sendRaw, setConnectionState, setOffline, setOnline, setTyping, markDelivered, markRead]);

  // ── Effect 1: subscribe to auth store ────────────────────────────────────
  // The WsProvider mounts inside the protected layout before useCurrentUser
  // has resolved the /api/auth/refresh call, so accessToken is null on the
  // first render.  We subscribe to the store and call connect() the moment a
  // real token lands — this covers both the initial hydration case and any
  // future token-refresh events.
  useEffect(() => {
    mountedRef.current = true;

    // If auth is already hydrated (e.g. user just logged in this session),
    // start immediately with a small StrictMode-safe delay.
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      const t = setTimeout(() => { if (mountedRef.current) connect(); }, 100);
      // Store timer ref so cleanup can cancel it.
      reconnectTimer.current = t;
    }

    // Subscribe for future token arrivals (covers the common page-reload path
    // where the token arrives async via /api/auth/refresh).
    const unsub = useAuthStore.subscribe((state, prev) => {
      if (state.accessToken && !prev.accessToken && mountedRef.current) {
        // Token just became available — establish the WS connection.
        connect();
      }
      if (!state.accessToken && prev.accessToken) {
        // User logged out — tear down the socket gracefully.
        if (wsRef.current) {
          wsRef.current.onclose = null;
          wsRef.current.close();
          wsRef.current = null;
        }
        if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
        useWsStore.getState().setConnectionState('closed');
      }
    });

    return () => {
      mountedRef.current = false;
      unsub();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
      useWsStore.getState().setConnectionState('closed');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty — subscribe handles all auth state changes.

  // ── Public send helpers ──────────────────────────────────────────────────

  const sendMessage = useCallback((payload: WsSendMessage) => {
    sendRaw({ event_type: 'message', payload });
  }, [sendRaw]);

  const sendTyping = useCallback((payload: WsSendTyping) => {
    sendRaw({ event_type: 'typing', payload });
  }, [sendRaw]);

  const sendDelivered = useCallback((messageId: number) => {
    const payload: WsSendDelivered = { message_id: messageId };
    sendRaw({ event_type: 'delivered', payload });
  }, [sendRaw]);

  const sendRead = useCallback((messageId: number) => {
    const payload: WsSendRead = { message_id: messageId };
    sendRaw({ event_type: 'read', payload });
  }, [sendRaw]);

  return { sendMessage, sendTyping, sendDelivered, sendRead };
}
