/**
 * Message list component for displaying chat messages
 */
'use client';

import type { ChatMessage } from '@/types/chat';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useEffect, useRef } from 'react';

dayjs.extend(relativeTime);

type MessageListProps = {
  messages: ChatMessage[];
  currentUserId: number;
  isLoading?: boolean;
};

export function MessageList({ messages, currentUserId, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 space-y-3 overflow-y-auto p-4">
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="size-8 animate-spin rounded-full border-4 border-[var(--color-chat-accent)] border-t-transparent" />
        </div>
      )}

      {messages.length === 0 && !isLoading && (
        <div className="flex h-full flex-col items-center justify-center text-center">
          <p style={{ color: 'rgba(251,245,221,0.4)' }} className="text-sm">
            No messages yet. Start the conversation!
          </p>
        </div>
      )}

      {messages.map(message => (
        <div
          key={message.id}
          className={`flex flex-col gap-1 ${message.senderId === currentUserId ? 'items-end' : 'items-start'}`}
        >
          <div
            className="max-w-[78%] px-3.5 py-2.5 text-[13px] leading-relaxed break-words"
            style={{
              borderRadius: message.senderId === currentUserId
                ? '14px 14px 4px 14px'
                : '14px 14px 14px 4px',
              background: message.senderId === currentUserId ? 'var(--color-text-accent)' : 'var(--color-chat-bubble)',
              color: message.senderId === currentUserId ? '#fff' : 'var(--color-chat-text)',
            }}
          >
            {message.content}
          </div>
          <span className="text-[10px]" style={{ color: 'rgba(251,245,221,0.25)' }}>
            {dayjs(message.createdAt).fromNow()}
          </span>
        </div>
      ))}

      <div ref={messagesEndRef} />
    </div>
  );
}
