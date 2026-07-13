/** Data-channel topic used to namespace in-meeting chat traffic. */
export const CHAT_TOPIC = 'recallo-chat' as const;

/** Data-channel topic for ephemeral signaling (hand-raise, etc.). */
export const SIGNAL_TOPIC = 'recallo-signal' as const;

/** Hand-raise signal broadcast over the data channel. */
export type HandSignal = {
  v: 1;
  type: 'hand';
  raised: boolean;
};

/** Wire format published over the LiveKit data channel (JSON → Uint8Array). */
export type ChatEnvelope = {
  v: 1;
  type: 'chat';
  id: string;
  text: string;
  senderName: string;
  /** Epoch milliseconds when the sender created the message. */
  sentAt: number;
};

/** UI-side chat message, derived from an envelope plus local direction. */
export type ChatMessage = {
  id: string;
  text: string;
  senderName: string;
  senderIdentity: string;
  direction: 'incoming' | 'outgoing';
  sentAt: number;
  initials: string;
  color: string;
};

/** Lobby config the user confirms before connecting. */
export type LobbyConfig = {
  displayName: string;
  micEnabled: boolean;
  camEnabled: boolean;
  /** Selected microphone device ID (empty/undefined = system default). */
  audioDeviceId?: string;
  /** Selected camera device ID (empty/undefined = system default). */
  videoDeviceId?: string;
  /** Selected speaker/output device ID (empty/undefined = system default). */
  audioOutputDeviceId?: string;
};

/** Everything the gate resolves before showing the lobby / connecting. */
export type MeetingConnection = {
  token: string;
  /** wss:// URL passed to LiveKitRoom's serverUrl. */
  serverUrl: string;
  displayName: string;
};
