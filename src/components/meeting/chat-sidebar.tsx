'use client';

import { Send, X } from 'lucide-react';
import { memo, useCallback, useDeferredValue, useLayoutEffect, useRef, useState } from 'react';
import { useChatSender } from '@/hooks/use-meeting-chat';
import { useMeetingStore } from '@/stores/use-meeting-store';

function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
}

function ChatSidebarImpl() {
  const messages = useMeetingStore(s => s.messages);
  const setSidebar = useMeetingStore(s => s.setSidebar);
  const { send } = useChatSender();

  const [input, setInput] = useState('');
  const deferredInput = useDeferredValue(input);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom on new messages.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length]);

  const handleSend = useCallback(() => {
    if (!input.trim()) {
      return;
    }
    void send(input);
    setInput('');
  }, [input, send]);

  return (
    <aside
      className="flex min-h-0 w-[290px] shrink-0 flex-col sm:w-[310px]"
      style={{ background: '#1C2A2C', borderLeft: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div
        className="flex shrink-0 items-center justify-between px-3 py-2.5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <p className="text-[12px] font-medium" style={{ color: 'var(--color-chat-text)' }}>In-meeting Chat</p>
        <button
          type="button"
          onClick={() => setSidebar('none')}
          className="rounded-[6px] p-1.5 hover:bg-white/10"
          style={{ color: 'rgba(251,245,221,0.45)' }}
          title="Close chat"
        >
          <X size={14} />
        </button>
      </div>

      <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3">
        {messages.length === 0 && (
          <p className="mt-4 text-center text-[11px]" style={{ color: 'rgba(251,245,221,0.3)' }}>
            No messages yet. Say hello 👋
          </p>
        )}
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex gap-2.5 ${message.direction === 'outgoing' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
              style={{ background: message.color }}
            >
              {message.initials}
            </div>
            <div className={`min-w-0 ${message.direction === 'outgoing' ? 'text-right' : ''}`}>
              <div
                className={`flex items-baseline gap-1.5 ${message.direction === 'outgoing' ? 'flex-row-reverse' : ''}`}
              >
                <span className="text-[11px] font-semibold" style={{ color: message.color }}>
                  {message.direction === 'outgoing' ? 'You' : message.senderName}
                </span>
                <span className="text-[10px]" style={{ color: 'rgba(251,245,221,0.3)' }}>
                  {formatTime(message.sentAt)}
                </span>
              </div>
              <p
                className="mt-0.5 inline-block rounded-[8px] px-2.5 py-1.5 text-[12px] leading-relaxed break-words"
                style={{
                  color: 'var(--color-chat-text)',
                  background: message.direction === 'outgoing' ? 'rgba(156,197,161,0.15)' : 'rgba(255,255,255,0.05)',
                  textAlign: 'left',
                }}
              >
                {message.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="shrink-0 p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 rounded-[9px] px-3 py-2" style={{ background: 'var(--color-chat-bg)' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSend();
              }
            }}
            placeholder="Send a message..."
            className="min-w-0 flex-1 bg-transparent text-[12px] placeholder:opacity-40 focus:outline-none"
            style={{ color: 'var(--color-chat-text)' }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!deferredInput.trim()}
            className="shrink-0 rounded-[6px] p-1 disabled:opacity-40"
            style={{ color: 'var(--color-chat-accent)' }}
            title="Send message"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export const ChatSidebar = memo(ChatSidebarImpl);
