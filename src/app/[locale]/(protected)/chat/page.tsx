'use client';

import { MessageSquare } from 'lucide-react';

export default function ChatIndexPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#273338] text-[#D9D3BC] h-full">
      <div className="w-16 h-16 rounded-full bg-[#324147] flex items-center justify-center mb-4">
        <MessageSquare size={32} className="text-[#9CC5A1]" />
      </div>
      <h2 className="text-xl font-medium text-[#FBF5DD] mb-2">Your Messages</h2>
      <p className="text-sm">Select a conversation from the sidebar to start chatting.</p>
    </div>
  );
}
