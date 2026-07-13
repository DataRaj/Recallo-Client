'use client';

import { MessageSquare } from 'lucide-react';

export default function ChatIndexPage() {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center gap-3">
      <div
        className="flex size-14 items-center justify-center rounded-2xl"
        style={{ background: 'rgba(156,197,161,0.1)' }}
      >
        <MessageSquare size={28} style={{ color: 'var(--color-chat-accent)' }} />
      </div>
      <p className="text-[14px] font-medium" style={{ color: 'var(--color-chat-text)' }}>
        Select a conversation
      </p>
      <p className="text-[12px]" style={{ color: 'rgba(251,245,221,0.4)' }}>
        Or start a new one with the + button
      </p>
    </div>
  );
}
