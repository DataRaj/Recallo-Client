/** Data-channel topic used to namespace in-meeting chat traffic. */
export const CHAT_TOPIC = 'recallo-chat' as const;

/** Data-channel topic for ephemeral signaling (hand-raise, etc.). */
export const SIGNAL_TOPIC = 'recallo-signal' as const;

/** Hand-raise signal broadcast over the data channel. */
export interface HandSignal {
  v: 1;
  type: 'hand';
  raised: boolean;
}

/** Wire format published over the LiveKit data channel (JSON → Uint8Array). */
export interface ChatEnvelope {
  v: 1;
  type: 'chat';
  id: string;
  text: string;
  senderName: string;
  /** Epoch milliseconds when the sender created the message. */
  sentAt: number;
}

/** UI-side chat message, derived from an envelope plus local direction. */
export interface ChatMessage {
  id: string;
  text: string;
  senderName: string;
  senderIdentity: string;
  direction: 'incoming' | 'outgoing';
  sentAt: number;
  initials: string;
  color: string;
}

/** Lobby config the user confirms before connecting. */
export interface LobbyConfig {
  displayName: string;
  micEnabled: boolean;
  camEnabled: boolean;
}

/** Everything the gate resolves before showing the lobby / connecting. */
export interface MeetingConnection {
  token: string;
  /** wss:// URL passed to LiveKitRoom's serverUrl. */
  serverUrl: string;
  displayName: string;
}
