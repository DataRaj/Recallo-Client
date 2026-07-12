/**
 * Chat service for API communication with Recallo Go Backend.
 *
 * Message sending goes over WebSocket (see use-chat-socket.ts).
 * This file handles REST: conversations list, history, conversation create,
 * and GIF search via Tenor public API.
 */

import { apiClient } from '@/libs/api-client';
import { useWsStore } from '@/stores/use-ws-store';
import type { Conversation, ChatMessage, MessageType } from '@/types/chat';

interface APIResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data: T;
}

// ── Conversations ────────────────────────────────────────────────────────────

function normaliseConversation(raw: any): Conversation {
  const id = String(raw.id);

  // The backend returns user1/user2 as flat integer ids.
  // It MAY also return user1_name/user2_name when populated.
  const user1Id = Number(raw.user1 ?? raw.user1_id);
  const user2Id = Number(raw.user2 ?? raw.user2_id);
  const participantIds = [user1Id, user2Id].filter((n) => !Number.isNaN(n) && n > 0);

  const resolvedNames: Record<number, string> = {};
  if (raw.user1_name) resolvedNames[user1Id] = String(raw.user1_name);
  if (raw.user2_name) resolvedNames[user2Id] = String(raw.user2_name);
  // Some backends put the names nested: { user1: { id, name } }
  if (typeof raw.user1 === 'object' && raw.user1?.name) resolvedNames[Number(raw.user1.id)] = String(raw.user1.name);
  if (typeof raw.user2 === 'object' && raw.user2?.name) resolvedNames[Number(raw.user2.id)] = String(raw.user2.name);

  // Cache resolved names in the global WsStore so message bubbles can look them up.
  const { setUserName } = useWsStore.getState();
  Object.entries(resolvedNames).forEach(([uid, name]) => setUserName(Number(uid), name));

  const participants = participantIds.map((pid) => ({
    id: pid,
    name: resolvedNames[pid] ?? useWsStore.getState().userNames.get(pid) ?? `User ${pid}`,
    email: `user${pid}@recallo.local`,
  }));

  return {
    id,
    type: 'direct',
    participantIds,
    participants,
    unreadCount: Number(raw.unread_count ?? 0),
    lastMessageAt: raw.last_message_at ? new Date(raw.last_message_at as string) : undefined,
    createdAt: new Date(raw.created_at ?? Date.now()),
    updatedAt: new Date(raw.updated_at ?? raw.created_at ?? Date.now()),
  };
}

export async function getConversations(): Promise<Conversation[]> {
  const response = await apiClient.get<APIResponse<any[]>>('/api/v1/conversations');
  const rawData = response.data.data ?? [];
  return rawData.map(normaliseConversation);
}

export async function getConversation(conversationId: string): Promise<Conversation> {
  const response = await apiClient.get<APIResponse<any>>(
    `/api/v1/conversation/private/${conversationId}`,
  );
  return normaliseConversation(response.data.data);
}

export async function createConversation(receiverId: number): Promise<Conversation> {
  const response = await apiClient.post<APIResponse<any>>(
    '/api/v1/conversation/private/create',
    { receiver_id: receiverId },
  );
  return normaliseConversation(response.data.data);
}

// ── Messages ─────────────────────────────────────────────────────────────────

/** Backend REST shape is uncertain — normalise defensively. */
function normaliseMessage(raw: Record<string, unknown>): ChatMessage {
  const id = String(raw.id ?? raw.message_id ?? Date.now());
  const senderId = Number(raw.from_id ?? raw.sender_id ?? raw.senderId ?? 0);
  const content = String(raw.content ?? raw.text ?? raw.message ?? '');
  const createdAt = new Date(
    (raw.created_at ?? raw.createdAt ?? Date.now()) as string | number,
  );
  const messageType: MessageType =
    raw.message_type === 'gif' ? 'gif' :
    raw.message_type === 'file' ? 'file' : 'text';

  return {
    id,
    conversationId: String(raw.private_id ?? raw.conversation_id ?? raw.conversationId ?? ''),
    senderId,
    content,
    messageType,
    createdAt,
    gifUrl: raw.gif_url as string | undefined,
    attachment: raw.file_name
      ? {
          id,
          filename: String(raw.file_name),
          filesize: Number(raw.file_size ?? 0),
          mimeType: String(raw.file_mime ?? 'application/octet-stream'),
          url: String(raw.file_url ?? raw.content ?? ''),
        }
      : undefined,
  };
}

export async function getMessages(
  conversationId: string,
  page = 1,
  limit = 40,
): Promise<ChatMessage[]> {
  const response = await apiClient.get<APIResponse<{ messages: Record<string, unknown>[] }>>(
    `/api/v1/conversation/private/${conversationId}/messages`,
    { params: { page, limit } },
  );
  const raw = response.data.data.messages ?? [];
  return raw.map(normaliseMessage);
}

// ── File upload ──────────────────────────────────────────────────────────────

export interface UploadedFile {
  /** Base64 encoded bytes to embed in the WS payload. */
  base64: string;
  name: string;
  size: number;
  mime: string;
}

/** Convert a browser File to the base64 payload expected by the WS protocol. */
export async function prepareFileUpload(file: File): Promise<UploadedFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data-url prefix so we only send raw base64.
      const base64 = result.split(',')[1] ?? result;
      resolve({
        base64,
        name: file.name,
        size: file.size,
        mime: file.type || 'application/octet-stream',
      });
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// ── User search ─────────────────────────────────────────────────────────────

export interface UserSearchResult {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

export async function searchUsers(query: string): Promise<UserSearchResult[]> {
  if (!query.trim()) return [];
  try {
    const response = await apiClient.get<APIResponse<UserSearchResult[]>>(
      `/api/v1/users/search`,
      { params: { q: query.trim() } },
    );
    return response.data.data ?? [];
  } catch {
    return [];
  }
}

// ── GIF search (Tenor v2 public API) ────────────────────────────────────────

export interface GifResult {
  id: string;
  title: string;
  url: string;          // Tenor share URL
  previewUrl: string;   // Small preview (tinygif)
  fullUrl: string;      // Full GIF (mediumgif / gif)
}

const TENOR_KEY = process.env.NEXT_PUBLIC_TENOR_API_KEY ?? 'AIzaSyAyimkuYQYF_FXVALexPn2Rs-8FnZsI8fg';
const TENOR_CLIENT_KEY = 'recallo';

export async function searchGifs(query: string, limit = 20): Promise<GifResult[]> {
  const params = new URLSearchParams({
    q: query,
    key: TENOR_KEY,
    client_key: TENOR_CLIENT_KEY,
    limit: String(limit),
    media_filter: 'gif,tinygif',
  });

  const res = await fetch(`https://tenor.googleapis.com/v2/search?${params.toString()}`);
  if (!res.ok) throw new Error('GIF search failed');

  const json = await res.json() as {
    results: Array<{
      id: string;
      title: string;
      itemurl: string;
      media_formats: {
        tinygif?: { url: string };
        gif?: { url: string };
        mediumgif?: { url: string };
      };
    }>;
  };

  return json.results.map((r) => ({
    id: r.id,
    title: r.title,
    url: r.itemurl,
    previewUrl: r.media_formats.tinygif?.url ?? r.media_formats.gif?.url ?? '',
    fullUrl: r.media_formats.gif?.url ?? r.media_formats.mediumgif?.url ?? '',
  }));
}

export async function getTrendingGifs(limit = 20): Promise<GifResult[]> {
  const params = new URLSearchParams({
    key: TENOR_KEY,
    client_key: TENOR_CLIENT_KEY,
    limit: String(limit),
    media_filter: 'gif,tinygif',
  });

  const res = await fetch(`https://tenor.googleapis.com/v2/featured?${params.toString()}`);
  if (!res.ok) throw new Error('GIF fetch failed');

  const json = await res.json() as {
    results: Array<{
      id: string;
      title: string;
      itemurl: string;
      media_formats: {
        tinygif?: { url: string };
        gif?: { url: string };
        mediumgif?: { url: string };
      };
    }>;
  };

  return json.results.map((r) => ({
    id: r.id,
    title: r.title,
    url: r.itemurl,
    previewUrl: r.media_formats.tinygif?.url ?? r.media_formats.gif?.url ?? '',
    fullUrl: r.media_formats.gif?.url ?? r.media_formats.mediumgif?.url ?? '',
  }));
}
