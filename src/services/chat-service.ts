/**
 * Chat service for API communication
 */

import type { Conversation, ChatMessage } from '@/types/chat';

export async function getConversations(): Promise<Conversation[]> {
  const response = await fetch('/api/chat/conversations', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch conversations');
  }

  const data = await response.json() as { data: Conversation[] };
  return data.data;
}

export async function getConversation(conversationId: string): Promise<Conversation> {
  const response = await fetch(`/api/chat/${conversationId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch conversation');
  }

  const data = await response.json() as { data: Conversation };
  return data.data;
}

export async function getMessages(conversationId: string, limit = 50, offset = 0): Promise<ChatMessage[]> {
  const response = await fetch(
    `/api/chat/${conversationId}/messages?limit=${limit}&offset=${offset}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    },
  );

  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }

  const data = await response.json() as { data: ChatMessage[] };
  return data.data;
}

export async function sendMessage(conversationId: string, content: string): Promise<ChatMessage> {
  const response = await fetch(`/api/chat/${conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  const data = await response.json() as { data: ChatMessage };
  return data.data;
}

export async function createConversation(participantIds: number[], name?: string): Promise<Conversation> {
  const response = await fetch('/api/chat/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ participantIds, name }),
  });

  if (!response.ok) {
    throw new Error('Failed to create conversation');
  }

  const data = await response.json() as { data: Conversation };
  return data.data;
}

export async function searchMessages(conversationId: string, query: string): Promise<ChatMessage[]> {
  const response = await fetch(`/api/chat/${conversationId}/search?q=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to search messages');
  }

  const data = await response.json() as { data: ChatMessage[] };
  return data.data;
}
