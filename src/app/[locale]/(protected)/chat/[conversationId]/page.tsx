'use client';

/**
 * Chat Conversation Page — real WS + REST history integration.
 *
 * Data flow:
 *  REST: getMessages()      → WsStore.setMessages() (initial history)
 *  WS:   mergeMessage()     → live messages appended in use-chat-socket
 *  Send: useWs().sendMessage() → queued/sent via WsProvider socket
 *                           + optimistic local insert so sender sees it immediately
 *
 * Features:
 *  - Text, GIF (Tenor), File (base64 WS) messages
 *  - Optimistic message insertion with stable temp-id rollback
 *  - Typing indicator (send + receive)
 *  - Real user names (from conversation participants)
 *  - Accurate online/offline presence with last-seen relative time
 *  - Voice/video call → creates/reuses a private meeting room and navigates
 *  - Auto-scroll to bottom
 *  - Mark as read on open
 */

import {
  useCallback, useEffect, useLayoutEffect, useRef, useState, useMemo,
} from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Phone, Video, Info, MoreVertical, Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useWs } from '@/components/providers/ws-provider';
import { useWsStore } from '@/stores/use-ws-store';
import { getConversation, getMessages } from '@/services/chat-service';
import { createRoom } from '@/services/room-service';
import { getMeetingIdentity } from '@/utils/identity';
import { recordRecentRoom } from '@/utils/recent-rooms';
import { ChatMessageInput } from '@/components/chat/message-input';
import type { PendingFile } from '@/components/chat/message-input';
import type { Conversation, ChatMessage, MessageType } from '@/types/chat';
import type { GifResult } from '@/services/chat-service';
import type { WsSendMessage } from '@/types/realtime';
import { ROUTES } from '@/lib/routes';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
}

function relativeTime(d: Date): string {
  const diff = Date.now() - d.getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function avatarInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const AVATAR_COLORS = [
  '#BA5A5A', '#9CC5A1', '#5A7BA6', '#C4A45A', '#8A5AC4', '#5AC4B8',
];
function avatarColor(id: number): string {
  return AVATAR_COLORS[id % AVATAR_COLORS.length] ?? '#9CC5A1';
}

// ── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble({
  message,
  isMe,
  senderName,
  senderId,
  isPending = false,
}: {
  message: ChatMessage;
  isMe: boolean;
  senderName: string;
  senderId: number;
  isPending?: boolean;
}) {
  const color = avatarColor(senderId);

  const contentNode = (() => {
    if (message.messageType === 'gif' && message.gifUrl) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={message.gifUrl}
          alt="GIF"
          className="max-w-[220px] rounded-[10px]"
          style={{ display: 'block' }}
        />
      );
    }
    if (message.messageType === 'file' && message.attachment) {
      const { filename, mimeType, url } = message.attachment;
      if (mimeType.startsWith('image/')) {
        return (
          <a href={url} target="_blank" rel="noopener noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={filename}
              className="max-w-[220px] rounded-[10px] transition-opacity hover:opacity-90"
            />
          </a>
        );
      }
      return (
        <a
          href={url}
          download={filename}
          className="flex items-center gap-2 rounded-[10px] px-3 py-2 transition-opacity hover:opacity-80"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg text-[9px] font-bold" style={{ background: color }}>
            {mimeType.split('/')[1]?.toUpperCase().slice(0, 4) ?? 'FILE'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[12px] font-medium text-[#FBF5DD]">{filename}</p>
            <p className="text-[10px]" style={{ color: 'rgba(251,245,221,0.4)' }}>
              {(message.attachment.filesize / 1024).toFixed(1)} KB
            </p>
          </div>
        </a>
      );
    }
    return (
      <p
        className="break-words px-3 py-2 text-[13px] leading-relaxed"
        style={{
          background: isMe ? '#9CC5A1' : 'rgba(255,255,255,0.06)',
          color: isMe ? '#1C2A2C' : '#FBF5DD',
          borderRadius: isMe ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
          opacity: isPending ? 0.6 : 1,
        }}
      >
        {message.content}
      </p>
    );
  })();

  return (
    <div className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
      <div
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
        style={{ background: color }}
      >
        {avatarInitials(senderName)}
      </div>
      <div className={`flex max-w-[70%] flex-col ${isMe ? 'items-end' : 'items-start'}`}>
        {!isMe && (
          <span className="mb-0.5 ml-1 text-[10px] font-medium" style={{ color }}>
            {senderName}
          </span>
        )}
        {contentNode}
        <span className="mt-0.5 mx-1 text-[10px]" style={{ color: 'rgba(251,245,221,0.3)' }}>
          {formatTime(message.createdAt)}
          {isPending && ' · Sending…'}
        </span>
      </div>
    </div>
  );
}

// ── Date divider ──────────────────────────────────────────────────────────────

function DateDivider({ label }: { label: string }) {
  return (
    <div className="my-3 flex items-center gap-2">
      <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
      <span className="text-[10px] font-medium" style={{ color: 'rgba(251,245,221,0.35)' }}>
        {label}
      </span>
      <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
    </div>
  );
}

// ── Typing indicator UI ───────────────────────────────────────────────────────

function TypingDots({ names }: { names: string[] }) {
  if (names.length === 0) return null;
  const label =
    names.length === 1
      ? `${names[0]} is typing…`
      : `${names.slice(0, 2).join(', ')} are typing…`;
  return (
    <div className="flex items-center gap-1.5 px-2 pb-1">
      <div className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full"
            style={{ background: '#9CC5A1', animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <span className="text-[11px]" style={{ color: 'rgba(251,245,221,0.4)' }}>{label}</span>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const EMPTY_MESSAGES: ChatMessage[] = [];
const EMPTY_TYPING = new Set<number>();

let _pendingCounter = 0;
function nextPendingId() {
  _pendingCounter += 1;
  return `pending-${_pendingCounter}`;
}

export default function ChatConversationPage() {
  const params = useParams();
  const conversationId = params.conversationId as string;
  const { user } = useCurrentUser();
  const router = useRouter();
  const locale = useLocale();

  const { sendMessage, sendTyping, sendRead } = useWs();

  // Stable selectors — never returns inline fallbacks so useSyncExternalStore doesn't loop.
  const wsMessages = useWsStore((s) => s.messagesByConversation.get(conversationId) ?? EMPTY_MESSAGES);
  const typingUserIds = useWsStore((s) => s.typingByConversation.get(conversationId) ?? EMPTY_TYPING);
  const onlineUserIds = useWsStore((s) => s.onlineUserIds);
  const lastSeenByUser = useWsStore((s) => s.lastSeenByUser);
  const setMessages = useWsStore((s) => s.setMessages);
  const mergeMessage = useWsStore((s) => s.mergeMessage);

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [receiverId, setReceiverId] = useState<number | null>(null);
  const [callingType, setCallingType] = useState<'voice' | 'video' | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Load conversation + history ──────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      setLoadingHistory(true);
      try {
        const [convo, history] = await Promise.all([
          getConversation(conversationId),
          getMessages(conversationId),
        ]);
        if (cancelled) return;
        setConversation(convo);
        const other = convo.participants.find((p) => p.id !== user?.id);
        setReceiverId(other?.id ?? null);
        setMessages(conversationId, history);
      } catch {
        // History unavailable; WS messages still arrive live.
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    }

    void loadAll();
    return () => { cancelled = true; };
  }, [conversationId, user?.id, setMessages]);

  // ── Mark read on open ────────────────────────────────────────────────────

  useEffect(() => {
    const last = wsMessages.at(-1);
    if (last && last.senderId !== user?.id) {
      sendRead(Number(last.id));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsMessages.length]);

  // ── Auto-scroll ──────────────────────────────────────────────────────────

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [wsMessages.length]);

  // ── Typing indicator helper ──────────────────────────────────────────────

  const handleTyping = useCallback((isTyping: boolean) => {
    if (!receiverId || !conversation) return;
    sendTyping({ private_id: Number(conversationId), receiver_id: receiverId, is_typing: isTyping });
  }, [conversationId, receiverId, conversation, sendTyping]);

  // ── Build typing names ───────────────────────────────────────────────────

  const typingNames = useMemo(() => {
    if (!conversation) return [];
    return [...typingUserIds]
      .filter((id) => id !== user?.id)
      .map((id) => {
        const p = conversation.participants.find((x) => x.id === id);
        return p?.name ?? `User ${id}`;
      });
  }, [typingUserIds, conversation, user?.id]);

  // ── Send helpers ─────────────────────────────────────────────────────────

  const makeWsPayload = useCallback(
    (overrides: Partial<WsSendMessage>): WsSendMessage | null => {
      if (!receiverId || !conversation) return null;
      return {
        private_id: Number(conversationId),
        receiver_id: receiverId,
        message_type: 'text',
        content: '',
        ...overrides,
      };
    },
    [conversationId, receiverId, conversation],
  );

  /**
   * Optimistically insert a message into the WS store so the sender sees it
   * immediately — the real message will be merged from the WS echo (deduped by id).
   */
  const optimisticInsert = useCallback((
    content: string,
    messageType: MessageType,
    extras?: { gifUrl?: string; attachment?: ChatMessage['attachment'] },
  ) => {
    if (!user) return;
    const tempMsg: ChatMessage = {
      id: nextPendingId(),
      conversationId,
      senderId: user.id,
      content,
      messageType,
      createdAt: new Date(),
      gifUrl: extras?.gifUrl,
      attachment: extras?.attachment,
    };
    mergeMessage(conversationId, tempMsg);
  }, [conversationId, user, mergeMessage]);

  const handleSendText = useCallback((text: string) => {
    const payload = makeWsPayload({ message_type: 'text', content: text });
    if (!payload) return;
    optimisticInsert(text, 'text');
    sendMessage(payload);
  }, [makeWsPayload, sendMessage, optimisticInsert]);

  const handleSendGif = useCallback((gif: GifResult) => {
    const payload = makeWsPayload({
      message_type: 'gif',
      content: gif.url,
      gif_url: gif.fullUrl,
    });
    if (!payload) return;
    optimisticInsert(gif.url, 'gif', { gifUrl: gif.fullUrl });
    sendMessage(payload);
  }, [makeWsPayload, sendMessage, optimisticInsert]);

  const handleSendFile = useCallback((file: PendingFile) => {
    const payload = makeWsPayload({
      message_type: 'file',
      content: file.name,
      file_data: file.base64,
      file_name: file.name,
      file_size: file.size,
      file_mime: file.mime,
    });
    if (!payload) return;
    optimisticInsert(file.name, 'file', {
      attachment: {
        id: 'pending',
        filename: file.name,
        filesize: file.size,
        mimeType: file.mime,
        url: file.previewUrl ?? '',
      },
    });
    sendMessage(payload);
  }, [makeWsPayload, sendMessage, optimisticInsert]);

  // ── Voice / Video calling ────────────────────────────────────────────────
  // Creates a private meeting room and redirects both users via the WS channel.

  const handleCallPress = useCallback(async (type: 'voice' | 'video') => {
    if (callingType) return; // already initiating
    setCallingType(type);
    try {
      const guestId = getMeetingIdentity();
      const title = `Call with ${otherParticipant?.name ?? `User ${receiverId}`}`;
      const room = await createRoom(title, guestId);
      recordRecentRoom({
        id: room.id,
        title: room.title,
        type: 'meeting',
        role: 'host',
      });
      router.push(`/${locale}${ROUTES.MEETING_DETAIL(room.id)}`);
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast.error(e?.message ?? 'Failed to start call');
    } finally {
      setCallingType(null);
    }
  }, [callingType, locale, router, receiverId]); // otherParticipant resolved below

  // ── Conversation header data ─────────────────────────────────────────────

  const otherParticipant = conversation?.participants.find((p) => p.id !== user?.id);
  const convoName = conversation?.name ?? otherParticipant?.name ?? `Chat ${conversationId}`;
  const isOtherOnline = otherParticipant ? onlineUserIds.has(otherParticipant.id) : false;
  const otherLastSeen = otherParticipant ? lastSeenByUser.get(otherParticipant.id) : undefined;
  const otherColor = avatarColor(otherParticipant?.id ?? 0);

  const presenceLabel = isOtherOnline
    ? 'Online'
    : otherLastSeen
      ? `Last seen ${relativeTime(otherLastSeen)}`
      : 'Offline';

  // ── Render messages with date dividers ───────────────────────────────────

  const renderedMessages = useMemo(() => {
    const elements: React.ReactNode[] = [];
    let lastDateStr = '';
    wsMessages.forEach((msg) => {
      const dateStr = formatDate(msg.createdAt);
      if (dateStr !== lastDateStr) {
        lastDateStr = dateStr;
        elements.push(<DateDivider key={`d-${dateStr}`} label={dateStr} />);
      }
      const isMe = msg.senderId === user?.id;
      const sender = conversation?.participants.find((p) => p.id === msg.senderId);
      const senderName = isMe
        ? (user?.name ?? 'You')
        : (sender?.name ?? `User ${msg.senderId}`);
      const isPending = msg.id.startsWith('pending-');
      elements.push(
        <MessageBubble
          key={msg.id}
          message={msg}
          isMe={isMe}
          senderName={senderName}
          senderId={msg.senderId}
          isPending={isPending}
        />,
      );
    });
    return elements;
  }, [wsMessages, user, conversation]);

  // Input is only disabled while actively reconnecting, not during normal connected or idle state.
  const connectionState = useWsStore((s) => s.connectionState);
  const inputDisabled = connectionState === 'reconnecting' || connectionState === 'connecting';

  return (
    <div className="flex h-full flex-col" style={{ background: '#273338' }}>
      {/* Header */}
      <div
        className="flex h-16 shrink-0 items-center justify-between px-5"
        style={{ background: '#324147', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ background: otherColor }}
            >
              {avatarInitials(convoName)}
            </div>
            {isOtherOnline && (
              <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#324147] bg-[#9CC5A1]" />
            )}
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-[#FBF5DD]">{convoName}</h2>
            <p className="text-[11px]" style={{ color: isOtherOnline ? '#9CC5A1' : 'rgba(251,245,221,0.4)' }}>
              {presenceLabel}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3" style={{ color: 'rgba(251,245,221,0.5)' }}>
          <button
            onClick={() => void handleCallPress('voice')}
            disabled={!!callingType}
            className="transition-colors hover:text-[#9CC5A1] disabled:opacity-40"
            title="Voice call"
          >
            {callingType === 'voice' ? <Loader2 size={18} className="animate-spin" /> : <Phone size={18} />}
          </button>
          <button
            onClick={() => void handleCallPress('video')}
            disabled={!!callingType}
            className="transition-colors hover:text-[#9CC5A1] disabled:opacity-40"
            title="Video call"
          >
            {callingType === 'video' ? <Loader2 size={18} className="animate-spin" /> : <Video size={18} />}
          </button>
          <button className="transition-colors hover:text-[#9CC5A1]" title="Info">
            <Info size={18} />
          </button>
          <button className="transition-colors hover:text-[#9CC5A1]" title="More">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
        {loadingHistory && (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={22} className="animate-spin text-[#9CC5A1]" />
          </div>
        )}
        {!loadingHistory && wsMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: 'rgba(156,197,161,0.1)' }}
            >
              <MessageSquare size={26} style={{ color: '#9CC5A1' }} />
            </div>
            <p className="text-[13px]" style={{ color: 'rgba(251,245,221,0.4)' }}>
              No messages yet — say hello!
            </p>
          </div>
        )}
        {renderedMessages}
        <TypingDots names={typingNames} />
        <div />
      </div>

      {/* Input */}
      <div
        className="shrink-0 px-4 pb-4 pt-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <ChatMessageInput
          disabled={inputDisabled}
          onSendText={handleSendText}
          onSendGif={handleSendGif}
          onSendFile={handleSendFile}
          onTyping={handleTyping}
        />
        {inputDisabled && (
          <p className="mt-1.5 text-center text-[10px]" style={{ color: '#E5B567' }}>
            Reconnecting to chat…
          </p>
        )}
      </div>
    </div>
  );
}
