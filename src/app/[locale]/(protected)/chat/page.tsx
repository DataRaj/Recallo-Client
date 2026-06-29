'use client';

import { MessageSquare } from 'lucide-react';

export default function ChatIndexPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 h-full">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: 'rgba(156,197,161,0.1)' }}
      >
        <MessageSquare size={28} style={{ color: '#9CC5A1' }} />
      </div>
      <p className="text-[14px] font-medium" style={{ color: '#FBF5DD' }}>
        Select a conversation
      </p>
      <p className="text-[12px]" style={{ color: 'rgba(251,245,221,0.4)' }}>
        Or start a new one with the + button
      </p>
    </div>
  );
}
