'use client';

import { ReactNode, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Search, Plus, User, Loader2, Wifi, WifiOff } from 'lucide-react';
import { ROUTES } from '@/lib/routes';

import { useWsStore } from '@/stores/use-ws-store';
import { getConversations } from '@/services/chat-service';
import { useCurrentUser } from '@/hooks/use-current-user';
import { NewConversationModal } from '@/components/chat/new-conversation-modal';
import { ChatThemePicker } from '@/components/chat/chat-theme-picker';
import type { Conversation } from '@/types/chat';

function formatTime(d: Date | string | undefined): string {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
}

function ConversationName(convo: Conversation, currentUserId: number): string {
  if (convo.name) return convo.name;
  const other = convo.participants.find((p) => p.id !== currentUserId);
  return other?.name ?? `Conversation ${convo.id}`;
}

function ConversationAvatar({ name, online }: { name: string; online: boolean }) {
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="relative shrink-0">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-chat-bubble)] text-sm font-semibold text-[var(--color-chat-text)]">
        {initials || <User size={16} />}
      </div>
      {online && (
        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[var(--color-chat-bg)] bg-[var(--color-chat-accent)]" />
      )}
    </div>
  );
}

function ConnectionBadge() {
  const state = useWsStore((s) => s.connectionState);
  if (state === 'open') {
    return (
      <div className="flex items-center gap-1" title="Live — connected">
        <Wifi size={11} style={{ color: 'var(--color-chat-accent)' }} />
        <span className="text-[10px]" style={{ color: 'var(--color-chat-accent)' }}>Live</span>
      </div>
    );
  }
  if (state === 'reconnecting' || state === 'connecting') {
    return (
      <div className="flex items-center gap-1" title="Reconnecting…">
        <Loader2 size={11} className="animate-spin" style={{ color: '#E5B567' }} />
        <span className="text-[10px]" style={{ color: '#E5B567' }}>Reconnecting</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1" title="Offline">
      <WifiOff size={11} style={{ color: 'rgba(251,245,221,0.35)' }} />
    </div>
  );
}

function ChatLayoutInner({ children }: { children: ReactNode }) {
  const params = useParams();
  const currentId = params.conversationId as string | undefined;
  const { user } = useCurrentUser();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const onlineUserIds = useWsStore((s) => s.onlineUserIds);

  const load = useCallback(async () => {
    try {
      const data = await getConversations();
      setConversations(data);
    } catch {
      // Silently fall back to empty list — WS messages still work.
    } finally {
      setLoadingConvos(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  // Refresh sidebar list when new messages arrive so last-message preview updates.
  const messagesByConversation = useWsStore((s) => s.messagesByConversation);
  useEffect(() => {
    void load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesByConversation.size]);

  const filtered = conversations.filter((c) => {
    const name = user ? ConversationName(c, user.id) : '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex h-[calc(100vh-60px)] bg-[var(--color-chat-bg)] text-[var(--color-chat-text)] font-sans lg:h-screen">
      {/* Sidebar */}
      <div className="flex w-80 shrink-0 flex-col border-r border-white/10 bg-[var(--color-chat-bg)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <h2 className="text-[15px] font-semibold tracking-tight">Messages</h2>
            <ConnectionBadge />
          </div>
          <div className="flex items-center gap-1">
            <ChatThemePicker />
            <button
              id="new-conversation-btn"
              onClick={() => setShowModal(true)}
              className="rounded-lg p-2 text-[var(--color-chat-accent)] transition-colors hover:bg-white/5"
              title="New conversation"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-chat-text-2)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full rounded-lg bg-[var(--color-chat-surface)] py-2 pl-9 pr-4 text-sm text-[var(--color-chat-text)] placeholder-[var(--color-chat-text-2)]/60 transition-all focus:outline-none focus:ring-1 focus:ring-[var(--color-chat-accent)]"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {loadingConvos && (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={20} className="animate-spin text-[var(--color-chat-accent)]" />
            </div>
          )}
          {!loadingConvos && filtered.length === 0 && (
            <p className="py-8 text-center text-[12px]" style={{ color: 'rgba(251,245,221,0.35)' }}>
              No conversations yet. Start a new one!
            </p>
          )}
          {!loadingConvos && filtered.map((conv) => {
            const name = user ? ConversationName(conv, user.id) : `#${conv.id}`;
            const otherParticipant = conv.participants.find((p) => p.id !== user?.id);
            const isOnline = otherParticipant ? onlineUserIds.has(otherParticipant.id) : false;
            const lastMsgText = conv.lastMessage?.content ?? 'No messages yet';
            const lastAt = conv.lastMessageAt ? formatTime(conv.lastMessageAt) : '';

            return (
              <Link
                key={conv.id}
                href={ROUTES.CHAT_CONVERSATION(conv.id)}
                className={`mb-1 flex items-center gap-3 rounded-xl p-3 transition-all ${
                  currentId === conv.id ? 'bg-[var(--color-chat-surface)]' : 'hover:bg-white/5'
                }`}
              >
                <ConversationAvatar name={name} online={isOnline} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="truncate text-sm font-medium text-[var(--color-chat-text)]">{name}</h3>
                    {lastAt && <span className="shrink-0 text-[10px] text-[var(--color-chat-text-2)]">{lastAt}</span>}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-[var(--color-chat-text-2)]">{lastMsgText}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <div className="min-w-5 shrink-0 rounded-full bg-[var(--color-chat-accent)] px-1.5 py-0.5 text-center text-[10px] font-bold text-[var(--color-chat-bg)]">
                    {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex flex-1 flex-col bg-[var(--color-chat-bg)]">
        {children}
      </div>

      {/* New conversation modal */}
      <NewConversationModal
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}

export default function ChatLayout({ children }: { children: ReactNode }) {
  return <ChatLayoutInner>{children}</ChatLayoutInner>;
}
