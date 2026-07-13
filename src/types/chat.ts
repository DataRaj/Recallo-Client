/**
 * Chat types for internal messaging system.
 * These model the REST history shape; the live WS shape is in types/realtime.ts.
 */

export type ChatUser = {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  online?: boolean;
  lastSeen?: Date;
};

export type MessageType = 'text' | 'gif' | 'file';

export type ChatAttachment = {
  id: string;
  filename: string;
  filesize: number;
  mimeType: string;
  url: string;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: number;
  content: string;
  messageType: MessageType;
  createdAt: Date;
  updatedAt?: Date;
  readAt?: Date;
  /** Present when messageType === 'file'. */
  attachment?: ChatAttachment;
  /** Tenor GIF URL when messageType === 'gif'. */
  gifUrl?: string;
};

export type Conversation = {
  id: string;
  type: 'direct' | 'group' | 'meeting';
  participantIds: number[];
  participants: ChatUser[];
  lastMessage?: ChatMessage;
  lastMessageAt?: Date;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  name?: string;
  avatar?: string;
};

export type TypingIndicator = {
  conversationId: string;
  userId: number;
  userName: string;
  startedAt: Date;
};

export type ChatState = {
  conversations: Map<string, Conversation>;
  currentConversationId: string | null;
  messages: Map<string, ChatMessage[]>;
  typingIndicators: Map<string, TypingIndicator>;
  isLoading: boolean;
  error: string | null;
};
