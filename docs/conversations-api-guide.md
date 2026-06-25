# Conversations API Implementation & Integration Guide

**Frontend:** Next.js 16.2.9 | React 19.2.7 | React Query 5.100.14 | Zustand 5.0.14

---

## Table of Contents
1. [API Architecture](#api-architecture)
2. [Type Definitions](#type-definitions)
3. [API Client Setup](#api-client-setup)
4. [React Query Hooks](#react-query-hooks)
5. [Zustand Store (State Management)](#zustand-store)
6. [Integration Example](#integration-example)
7. [Error Handling](#error-handling)
8. [WebSocket Integration (Real-time)](#websocket-integration)
9. [Best Practices](#best-practices)

---

## API Architecture

### Directory Structure
```
src/
├── app/
│   ├── api/
│   │   └── conversations/          # Backend API routes (if needed)
│   └── [locale]/
│       └── (dashboard)/
│           └── meeting/            # Conversations UI
├── lib/
│   └── api/
│       └── conversations/          # Conversations API client
├── hooks/
│   └── use-conversations.ts        # React Query hooks
├── stores/
│   └── use-conversations-store.ts  # Zustand state
├── types/
│   └── conversations.ts            # Type definitions
└── components/
    └── conversations/              # UI components
```

---

## Type Definitions

**File:** `src/types/conversations.ts`

```typescript
// Conversation base types
export interface ConversationParticipant {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  status: 'online' | 'offline' | 'away';
  joinedAt: Date;
  leftAt?: Date;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  sender: ConversationParticipant;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  attachments?: Attachment[];
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
  reactions?: MessageReaction[];
  replyTo?: string; // ID of message being replied to
}

export interface MessageReaction {
  userId: string;
  emoji: string;
  createdAt: Date;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Conversation {
  id: string;
  title: string;
  description?: string;
  type: 'direct' | 'group' | 'channel';
  participants: ConversationParticipant[];
  lastMessage?: ConversationMessage;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  settings: ConversationSettings;
}

export interface ConversationSettings {
  notifications: 'all' | 'mentions' | 'none';
  allowSearch: boolean;
  archiveOldMessages: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pageInfo: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// API request/response types
export interface CreateConversationPayload {
  title: string;
  description?: string;
  type: 'direct' | 'group';
  participantIds: string[];
}

export interface SendMessagePayload {
  content: string;
  type?: 'text' | 'image' | 'file';
  attachments?: string[]; // File IDs
  replyTo?: string;
}

export interface UpdateMessagePayload {
  content: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string>;
}
```

---

## API Client Setup

### File: `src/lib/api/conversations/client.ts`

```typescript
import { api } from '@/lib/api-client';
import type {
  Conversation,
  ConversationMessage,
  PaginatedResponse,
  CreateConversationPayload,
  SendMessagePayload,
  UpdateMessagePayload,
} from '@/types/conversations';

const CONVERSATIONS_BASE_URL = '/conversations';

/**
 * Conversations API Client
 * Handles all communication with the backend conversations service
 */
export const conversationsApi = {
  // Conversations
  listConversations: (params?: { page?: number; pageSize?: number; search?: string }) =>
    api.get<PaginatedResponse<Conversation>>(`${CONVERSATIONS_BASE_URL}`, { params }),

  getConversation: (conversationId: string) =>
    api.get<Conversation>(`${CONVERSATIONS_BASE_URL}/${conversationId}`),

  createConversation: (payload: CreateConversationPayload) =>
    api.post<Conversation>(`${CONVERSATIONS_BASE_URL}`, payload),

  updateConversation: (conversationId: string, payload: Partial<Conversation>) =>
    api.patch<Conversation>(`${CONVERSATIONS_BASE_URL}/${conversationId}`, payload),

  deleteConversation: (conversationId: string) =>
    api.delete<void>(`${CONVERSATIONS_BASE_URL}/${conversationId}`),

  // Messages
  listMessages: (conversationId: string, params?: { page?: number; pageSize?: number }) =>
    api.get<PaginatedResponse<ConversationMessage>>(
      `${CONVERSATIONS_BASE_URL}/${conversationId}/messages`,
      { params }
    ),

  getMessage: (conversationId: string, messageId: string) =>
    api.get<ConversationMessage>(
      `${CONVERSATIONS_BASE_URL}/${conversationId}/messages/${messageId}`
    ),

  sendMessage: (conversationId: string, payload: SendMessagePayload) =>
    api.post<ConversationMessage>(
      `${CONVERSATIONS_BASE_URL}/${conversationId}/messages`,
      payload
    ),

  updateMessage: (conversationId: string, messageId: string, payload: UpdateMessagePayload) =>
    api.patch<ConversationMessage>(
      `${CONVERSATIONS_BASE_URL}/${conversationId}/messages/${messageId}`,
      payload
    ),

  deleteMessage: (conversationId: string, messageId: string) =>
    api.delete<void>(`${CONVERSATIONS_BASE_URL}/${conversationId}/messages/${messageId}`),

  // Reactions
  addReaction: (conversationId: string, messageId: string, emoji: string) =>
    api.post(`${CONVERSATIONS_BASE_URL}/${conversationId}/messages/${messageId}/reactions`, {
      emoji,
    }),

  removeReaction: (conversationId: string, messageId: string, emoji: string) =>
    api.delete(
      `${CONVERSATIONS_BASE_URL}/${conversationId}/messages/${messageId}/reactions/${emoji}`
    ),

  // Participants
  addParticipants: (conversationId: string, userIds: string[]) =>
    api.post(`${CONVERSATIONS_BASE_URL}/${conversationId}/participants`, { userIds }),

  removeParticipant: (conversationId: string, userId: string) =>
    api.delete(`${CONVERSATIONS_BASE_URL}/${conversationId}/participants/${userId}`),

  // File upload
  uploadAttachment: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ id: string; url: string }>(`${CONVERSATIONS_BASE_URL}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
```

---

## React Query Hooks

### File: `src/hooks/use-conversations.ts`

```typescript
import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { conversationsApi } from '@/lib/api/conversations/client';
import type {
  Conversation,
  ConversationMessage,
  CreateConversationPayload,
  SendMessagePayload,
} from '@/types/conversations';

// Query keys factory
export const conversationKeys = {
  all: ['conversations'] as const,
  lists: () => [...conversationKeys.all, 'list'] as const,
  list: (filters?: { search?: string }) => [...conversationKeys.lists(), { filters }] as const,
  details: () => [...conversationKeys.all, 'detail'] as const,
  detail: (id: string) => [...conversationKeys.details(), id] as const,
  messages: () => [...conversationKeys.all, 'messages'] as const,
  messageList: (conversationId: string) =>
    [...conversationKeys.messages(), conversationId] as const,
};

/**
 * List conversations with pagination
 */
export const useConversations = (params?: { search?: string }) => {
  return useQuery({
    queryKey: conversationKeys.list(params),
    queryFn: () => conversationsApi.listConversations({ ...params, pageSize: 20 }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Get single conversation by ID
 */
export const useConversation = (conversationId: string | null) => {
  return useQuery({
    queryKey: conversationKeys.detail(conversationId || ''),
    queryFn: () => conversationsApi.getConversation(conversationId!),
    enabled: !!conversationId,
    staleTime: 1000 * 60 * 1, // 1 minute
  });
};

/**
 * List messages with infinite scroll
 */
export const useInfiniteMessages = (conversationId: string | null) => {
  return useInfiniteQuery({
    queryKey: conversationKeys.messageList(conversationId || ''),
    queryFn: ({ pageParam = 1 }) =>
      conversationsApi.listMessages(conversationId!, {
        page: pageParam,
        pageSize: 20,
      }),
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.pageInfo.hasNextPage ? lastPageParam + 1 : undefined,
    getPreviousPageParam: (firstPage, _allPages, firstPageParam) =>
      firstPage.pageInfo.hasPreviousPage ? firstPageParam - 1 : undefined,
    initialPageParam: 1,
    enabled: !!conversationId,
    staleTime: 1000 * 60 * 1, // 1 minute
  });
};

/**
 * Create conversation
 */
export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateConversationPayload) =>
      conversationsApi.createConversation(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
      queryClient.setQueryData(conversationKeys.detail(data.id), data);
    },
  });
};

/**
 * Send message
 */
export const useSendMessage = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendMessagePayload) =>
      conversationsApi.sendMessage(conversationId, payload),
    onSuccess: (newMessage) => {
      // Update messages list
      queryClient.invalidateQueries({
        queryKey: conversationKeys.messageList(conversationId),
      });

      // Update conversation last message
      queryClient.setQueryData(
        conversationKeys.detail(conversationId),
        (prev: Conversation | undefined) =>
          prev
            ? {
                ...prev,
                lastMessage: newMessage,
                lastMessageAt: new Date(),
              }
            : prev
      );
    },
  });
};

/**
 * Update message
 */
export const useUpdateMessage = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, payload }: { messageId: string; payload: string }) =>
      conversationsApi.updateMessage(conversationId, messageId, { content: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: conversationKeys.messageList(conversationId),
      });
    },
  });
};

/**
 * Delete message
 */
export const useDeleteMessage = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) =>
      conversationsApi.deleteMessage(conversationId, messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: conversationKeys.messageList(conversationId),
      });
    },
  });
};

/**
 * Add reaction
 */
export const useAddReaction = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      conversationsApi.addReaction(conversationId, messageId, emoji),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: conversationKeys.messageList(conversationId),
      });
    },
  });
};

/**
 * Update conversation settings
 */
export const useUpdateConversation = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Partial<Conversation>) =>
      conversationsApi.updateConversation(conversationId, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(conversationKeys.detail(conversationId), data);
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
};

/**
 * Upload attachment
 */
export const useUploadAttachment = () => {
  return useMutation({
    mutationFn: (file: File) => conversationsApi.uploadAttachment(file),
  });
};
```

---

## Zustand Store

### File: `src/stores/use-conversations-store.ts`

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Conversation, ConversationMessage } from '@/types/conversations';

interface ConversationsState {
  // UI state
  selectedConversationId: string | null;
  isDrawerOpen: boolean;
  scrolledToBottom: boolean;

  // Real-time updates
  activeConversations: Map<string, Conversation>;
  messageUpdates: Map<string, ConversationMessage>;

  // Optimistic updates
  optimisticMessages: ConversationMessage[];
}

interface ConversationsActions {
  // Setters
  setSelectedConversation: (id: string | null) => void;
  setDrawerOpen: (open: boolean) => void;
  setScrolledToBottom: (scrolled: boolean) => void;

  // Real-time updates
  updateConversation: (conversation: Conversation) => void;
  updateMessage: (message: ConversationMessage) => void;
  addOptimisticMessage: (message: ConversationMessage) => void;
  removeOptimisticMessage: (messageId: string) => void;
  clearOptimisticMessages: () => void;

  // Cleanup
  reset: () => void;
}

const initialState: ConversationsState = {
  selectedConversationId: null,
  isDrawerOpen: false,
  scrolledToBottom: true,
  activeConversations: new Map(),
  messageUpdates: new Map(),
  optimisticMessages: [],
};

export const useConversationsStore = create<ConversationsState & ConversationsActions>()(
  devtools(
    (set) => ({
      ...initialState,

      setSelectedConversation: (id) => set({ selectedConversationId: id }),
      setDrawerOpen: (open) => set({ isDrawerOpen: open }),
      setScrolledToBottom: (scrolled) => set({ scrolledToBottom: scrolled }),

      updateConversation: (conversation) =>
        set((state) => {
          const updated = new Map(state.activeConversations);
          updated.set(conversation.id, conversation);
          return { activeConversations: updated };
        }),

      updateMessage: (message) =>
        set((state) => {
          const updated = new Map(state.messageUpdates);
          updated.set(message.id, message);
          return { messageUpdates: updated };
        }),

      addOptimisticMessage: (message) =>
        set((state) => ({
          optimisticMessages: [...state.optimisticMessages, message],
        })),

      removeOptimisticMessage: (messageId) =>
        set((state) => ({
          optimisticMessages: state.optimisticMessages.filter((m) => m.id !== messageId),
        })),

      clearOptimisticMessages: () => set({ optimisticMessages: [] }),

      reset: () => set(initialState),
    }),
    { name: 'ConversationsStore' }
  )
);
```

---

## Integration Example

### File: `src/app/[locale]/(dashboard)/meeting/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useConversations, useSendMessage, useInfiniteMessages } from '@/hooks/use-conversations';
import { useConversationsStore } from '@/stores/use-conversations-store';
import ConversationsList from '@/components/conversations/conversations-list';
import MessageThread from '@/components/conversations/message-thread';
import MessageInput from '@/components/conversations/message-input';

export default function MeetingPage() {
  const { data: conversationsData, isLoading } = useConversations();
  const selectedConversationId = useConversationsStore((s) => s.selectedConversationId);
  const setSelectedConversation = useConversationsStore((s) => s.setSelectedConversation);

  const { data: messagesData } = useInfiniteMessages(selectedConversationId);
  const { mutate: sendMessage, isPending } = useSendMessage(selectedConversationId!);

  const handleSelectConversation = (id: string) => {
    setSelectedConversation(id);
  };

  const handleSendMessage = (content: string) => {
    sendMessage({
      content,
      type: 'text',
    });
  };

  return (
    <div className="flex h-screen gap-4">
      {/* Conversations sidebar */}
      <aside className="w-80 border-r">
        <ConversationsList
          conversations={conversationsData?.data || []}
          isLoading={isLoading}
          selectedId={selectedConversationId}
          onSelect={handleSelectConversation}
        />
      </aside>

      {/* Messages thread */}
      <main className="flex-1 flex flex-col">
        {selectedConversationId ? (
          <>
            <MessageThread messages={messagesData?.pages.flatMap((p) => p.data) || []} />
            <MessageInput onSend={handleSendMessage} isPending={isPending} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a conversation to start messaging
          </div>
        )}
      </main>
    </div>
  );
}
```

---

## Error Handling

### File: `src/lib/api/conversations/error-handler.ts`

```typescript
import type { ApiError } from '@/types/conversations';

export class ConversationApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public details?: Record<string, string>
  ) {
    super(message);
    this.name = 'ConversationApiError';
  }
}

export const handleConversationError = (error: unknown): ConversationApiError => {
  if (error instanceof ConversationApiError) {
    return error;
  }

  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as any).response;
    const data = response?.data as ApiError;

    return new ConversationApiError(
      data?.code || 'UNKNOWN_ERROR',
      data?.message || 'An unexpected error occurred',
      data?.details
    );
  }

  return new ConversationApiError(
    'UNKNOWN_ERROR',
    error instanceof Error ? error.message : 'An unexpected error occurred'
  );
};

// Usage in hooks
export const useConversationsWithErrorHandling = () => {
  const { data, error, isLoading } = useConversations();

  const handledError = error ? handleConversationError(error) : null;

  return { data, error: handledError, isLoading };
};
```

---

## WebSocket Integration (Real-time)

### File: `src/lib/api/conversations/websocket.ts`

```typescript
import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useConversationsStore } from '@/stores/use-conversations-store';
import { conversationKeys } from '@/hooks/use-conversations';
import type { ConversationMessage, Conversation } from '@/types/conversations';

interface WebSocketMessage {
  type:
    | 'message:new'
    | 'message:updated'
    | 'message:deleted'
    | 'conversation:updated'
    | 'typing:start'
    | 'typing:stop'
    | 'user:status';
  payload: any;
}

export const useConversationWebSocket = (conversationId: string | null) => {
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();
  const updateMessage = useConversationsStore((s) => s.updateMessage);

  const connect = useCallback(() => {
    if (!conversationId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/conversations/${conversationId}`;

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onmessage = (event) => {
        const message: WebSocketMessage = JSON.parse(event.data);

        switch (message.type) {
          case 'message:new': {
            const newMessage = message.payload as ConversationMessage;
            queryClient.setQueryData(
              conversationKeys.messageList(conversationId),
              (old: any) => ({
                ...old,
                pages: old.pages.map((page: any, idx: number) =>
                  idx === 0 ? { ...page, data: [newMessage, ...page.data] } : page
                ),
              })
            );
            break;
          }

          case 'message:updated': {
            const updatedMessage = message.payload as ConversationMessage;
            updateMessage(updatedMessage);
            break;
          }

          case 'conversation:updated': {
            const updatedConversation = message.payload as Conversation;
            queryClient.setQueryData(
              conversationKeys.detail(conversationId),
              updatedConversation
            );
            break;
          }
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      wsRef.current.onclose = () => {
        // Attempt reconnection
        setTimeout(connect, 3000);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }, [conversationId, queryClient, updateMessage]);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return wsRef;
};
```

---

## Best Practices

### 1. **Query Key Management**
- Use query key factory pattern for consistency
- Namespace keys hierarchically: `['conversations', 'detail', 'conv-id']`
- Invalidate intelligently based on mutation scope

### 2. **Optimistic Updates**
```typescript
const { mutate } = useMutation({
  mutationFn: sendMessage,
  onMutate: async (newMessage) => {
    // Cancel ongoing queries
    await queryClient.cancelQueries({
      queryKey: conversationKeys.messageList(conversationId),
    });

    // Snapshot previous data
    const previousData = queryClient.getQueryData(
      conversationKeys.messageList(conversationId)
    );

    // Optimistically update
    addOptimisticMessage(newMessage);

    return { previousData };
  },
  onError: (err, newMessage, context) => {
    // Revert on error
    queryClient.setQueryData(
      conversationKeys.messageList(conversationId),
      context?.previousData
    );
    removeOptimisticMessage(newMessage.id);
  },
  onSuccess: () => {
    clearOptimisticMessages();
    queryClient.invalidateQueries({
      queryKey: conversationKeys.messageList(conversationId),
    });
  },
});
```

### 3. **Pagination**
- Use `useInfiniteQuery` for message history
- Implement virtual scrolling for performance
- Load older messages as user scrolls up

### 4. **File Upload**
```typescript
const { mutate: uploadFile } = useUploadAttachment();

const handleFileSelect = async (file: File) => {
  uploadFile(file, {
    onSuccess: (data) => {
      sendMessage({
        content: `Shared file: ${file.name}`,
        attachments: [data.id],
      });
    },
  });
};
```

### 5. **Error Boundaries**
```typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <ConversationThread />
</ErrorBoundary>
```

### 6. **Performance Optimization**
- Memoize components with `memo()` to prevent re-renders
- Use `useCallback` for event handlers
- Implement message virtualization for large lists
- Debounce typing indicators

---

## Project Structure Summary

```
src/
├── app/
│   ├── api/conversations/        # Backend routes (if needed)
│   └── [locale]/meeting/         # Conversations UI page
├── components/
│   └── conversations/
│       ├── conversations-list.tsx
│       ├── message-thread.tsx
│       └── message-input.tsx
├── hooks/
│   └── use-conversations.ts
├── lib/
│   ├── api-client.ts             # Axios setup
│   └── api/conversations/
│       ├── client.ts
│       ├── error-handler.ts
│       └── websocket.ts
├── stores/
│   └── use-conversations-store.ts
└── types/
    └── conversations.ts
```

---

## Quick Start Checklist

- [x] Define types (`types/conversations.ts`)
- [x] Setup API client (`lib/api/conversations/client.ts`)
- [x] Create React Query hooks (`hooks/use-conversations.ts`)
- [x] Setup Zustand store (`stores/use-conversations-store.ts`)
- [x] Configure WebSocket (`lib/api/conversations/websocket.ts`)
- [x] Build UI components (`components/conversations/*`)
- [x] Implement page (`app/[locale]/meeting/page.tsx`)
- [x] Handle errors (`lib/api/conversations/error-handler.ts`)
- [x] Add to QueryProvider (`components/providers/query-provider.tsx`)

