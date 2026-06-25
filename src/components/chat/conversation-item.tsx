/**
 * Conversation item component for displaying in sidebar
 */
'use client';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { Conversation } from '@/types/chat';

dayjs.extend(relativeTime);

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

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
      className="flex items-start gap-2.5 w-full p-3 rounded-[10px] text-left transition-all duration-150"
      style={{
        background: isActive ? 'rgba(251,245,221,0.1)' : 'transparent',
      }}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
          style={{ background: '#BA5A5A' }}
        >
          {displayName.charAt(0).toUpperCase()}
        </div>
        {firstParticipant?.online && (
          <span
            className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
            style={{
              background: '#9CC5A1',
              borderColor: '#273338',
            }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <p className="text-[13px] font-medium truncate" style={{ color: '#FBF5DD' }}>
            {displayName}
          </p>
          {conversation.unreadCount > 0 && (
            <span
              className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0"
              style={{
                background: '#BA5A5A',
                color: '#fff',
              }}
            >
              {conversation.unreadCount}
            </span>
          )}
        </div>
        <p className="text-[12px] truncate" style={{ color: 'rgba(251,245,221,0.5)' }}>
          {lastMessagePreview}
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: 'rgba(251,245,221,0.3)' }}>
          {lastMessageTime}
        </p>
      </div>
    </button>
  );
}
