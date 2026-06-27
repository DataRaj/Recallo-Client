/**
 * Chat service for API communication with Recallo Go Backend
 */

import { apiClient } from '@/libs/api-client';
import type { Conversation, ChatMessage } from '@/types/chat';

interface APIResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data: T;
}

export async function getConversations(): Promise<Conversation[]> {
  const response = await apiClient.get<APIResponse<Conversation[]>>('/api/v1/conversations');
  return response.data.data;
}

export async function getConversation(conversationId: string): Promise<Conversation> {
  const response = await apiClient.get<APIResponse<Conversation>>(`/api/v1/conversation/private/${conversationId}`);
  return response.data.data;
}

export async function getMessages(
  conversationId: string,
  page = 1,
  limit = 20
): Promise<ChatMessage[]> {
  const response = await apiClient.get<APIResponse<{ messages: ChatMessage[] }>>(
    `/api/v1/conversation/private/${conversationId}/messages`,
    {
      params: {
        page,
        limit,
      },
    }
  );
  return response.data.data.messages;
}

export async function createConversation(receiverId: number): Promise<Conversation> {
  const response = await apiClient.post<APIResponse<Conversation>>(
    '/api/v1/conversation/private/create',
    {
      receiver_id: receiverId,
    }
  );
  return response.data.data;
}

/**
 * Note: Sending messages in the Recallo backend is designed to go over WebSockets (ws://).
 * This REST function log a warning / mock response or acts as a local fallback.
 */
export async function sendMessage(conversationId: string, content: string): Promise<ChatMessage> {
  console.warn('Recallo Backend uses WebSockets to transmit chat messages. This REST call is mocked.');
  
  const mockMessage: ChatMessage = {
    id: String(Date.now()),
    conversationId,
    senderId: 0, // System/Mock
    content,
    createdAt: new Date(),
  };
  
  return Promise.resolve(mockMessage);
}
