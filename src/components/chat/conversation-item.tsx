/**
 * Conversation item component for displaying in sidebar
 */
'use client';

import type { Conversation } from '@/types/chat';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

type ConversationItemProps = {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
};

export function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
  const firstParticipant = conversation.participants[0];
  const displayName = conversation.name || firstParticipant?.name || 'Unknown';
  const lastMessagePreview = conversation.lastMessage?.content.substring(0, 50) || 'No messages yet';
  const lastMessageTime = conversation.lastMessageAt
    ? dayjs(conversation.lastMessageAt).fromNow()
    : 'Never';

  return (
    <button
      onClick={onClick}
      className="flex w-full items-start gap-2.5 rounded-[10px] p-3 text-left transition-all duration-150"
      style={{
        background: isActive ? 'rgba(251,245,221,0.1)' : 'transparent',
      }}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div
          className="flex size-10 items-center justify-center rounded-full text-sm font-semibold text-white"
          style={{ background: '#BA5A5A' }}
        >
          {displayName.charAt(0).toUpperCase()}
        </div>
        {firstParticipant?.online && (
          <span
            className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2"
            style={{
              background: '#9CC5A1',
              borderColor: '#273338',
            }}
          />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-baseline gap-2">
          <p className="truncate text-[13px] font-medium" style={{ color: '#FBF5DD' }}>
            {displayName}
          </p>
          {conversation.unreadCount > 0 && (
            <span
              className="flex-shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
              style={{
                background: '#BA5A5A',
                color: '#fff',
              }}
            >
              {conversation.unreadCount}
            </span>
          )}
        </div>
        <p className="truncate text-[12px]" style={{ color: 'rgba(251,245,221,0.5)' }}>
          {lastMessagePreview}
        </p>
        <p className="mt-0.5 text-[11px]" style={{ color: 'rgba(251,245,221,0.3)' }}>
          {lastMessageTime}
        </p>
      </div>
    </button>
  );
}
