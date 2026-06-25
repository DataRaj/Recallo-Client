/**
 * Chat types for internal messaging system
 */

export interface ChatUser {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  online?: boolean;
  lastSeen?: Date;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: number;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  readAt?: Date;
  attachment?: ChatAttachment;
}

export interface ChatAttachment {
  id: string;
  filename: string;
  filesize: number;
  mimeType: string;
  url: string;
}

export interface Conversation {
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
}

export interface TypingIndicator {
  conversationId: string;
  userId: number;
  userName: string;
  startedAt: Date;
}

export interface ChatState {
  conversations: Map<string, Conversation>;
  currentConversationId: string | null;
  messages: Map<string, ChatMessage[]>;
  typingIndicators: Map<string, TypingIndicator>;
  isLoading: boolean;
  error: string | null;
}
