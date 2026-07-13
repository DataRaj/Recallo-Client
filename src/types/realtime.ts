/**
 * Realtime WebSocket types — mirrors the Go Recallo-Server WS hub protocol.
 * Connection: GET /api/v1/ws?token=<access_token>
 *
 * Inbound event_types (server → client):
 *   current_user | online | offline | message | delivered | read | typing | heartbeat | error | shutdown
 *
 * Outbound payloads (client → server, JSON):
 *   message | typing | delivered | read
 */

// ── Connection state ─────────────────────────────────────────────────────────

export type WsConnectionState
  = | 'idle'
    | 'connecting'
    | 'open'
    | 'reconnecting'
    | 'closed';

// ── Inbound ──────────────────────────────────────────────────────────────────

export type InboundEventType
  = | 'current_user'
    | 'online'
    | 'offline'
    | 'message'
    | 'delivered'
    | 'read'
    | 'typing'
    | 'heartbeat'
    | 'error'
    | 'shutdown';

/** Raw server message envelope. */
export type WsInboundEvent<P = unknown> = {
  event_type: InboundEventType;
  payload: P;
};

/** Payload for event_type = 'current_user'. */
export type WsCurrentUserPayload = {
  user_id: number;
};

/** Payload for event_type = 'online' | 'offline'. */
export type WsPresencePayload = {
  user_id: number;
};

/** Wire shape of an inbound chat message (event_type = 'message'). */
export type WsMessagePayload = {
  message: WsMessageData;
};

export type WsMessageData = {
  id: number;
  from_id: number;
  private_id: string;
  message_type: 'text' | 'gif' | 'file';
  content: string;
  /** Base64-encoded file bytes when message_type === 'file'. */
  file_data?: string;
  file_name?: string;
  file_size?: number;
  file_mime?: string;
  /** Tenor GIF URL when message_type === 'gif'. */
  gif_url?: string;
  delivered: boolean;
  read: boolean;
  created_at: string; // ISO-8601
};

/** Payload for event_type = 'delivered' | 'read'. */
export type WsReceiptPayload = {
  message_id: number;
};

/** Payload for event_type = 'typing'. */
export type WsTypingPayload = {
  private_id: string;
  user_id: number;
  is_typing: boolean;
};

/** Payload for event_type = 'error'. */
export type WsErrorPayload = {
  code: string;
  message: string;
};

// ── Outbound ─────────────────────────────────────────────────────────────────

/** Send a text message. */
export type WsSendMessage = {
  private_id: number;
  receiver_id: number;
  message_type: 'text' | 'gif' | 'file';
  content: string;
  /** Base64-encoded bytes when message_type === 'file'. */
  file_data?: string;
  file_name?: string;
  file_size?: number;
  file_mime?: string;
  /** Tenor URL when message_type === 'gif'. */
  gif_url?: string;
};

/** Notify that you are (or stopped) typing. */
export type WsSendTyping = {
  private_id: number;
  receiver_id: number;
  is_typing: boolean;
};

/** Acknowledge delivery of a message. */
export type WsSendDelivered = {
  message_id: number;
};

/** Acknowledge that the user has read a message. */
export type WsSendRead = {
  message_id: number;
};
