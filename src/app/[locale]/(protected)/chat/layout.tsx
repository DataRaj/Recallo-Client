'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Search, Plus, MessageSquare, Hash, User } from 'lucide-react';
import { ROUTES } from '@/lib/routes';

const MOCK_CONVERSATIONS = [
  { id: '1', name: 'Design Team', type: 'group', unread: 2, online: true },
  { id: '2', name: 'Alex K.', type: 'direct', unread: 0, online: true },
  { id: '3', name: 'Standup Sync', type: 'meeting', unread: 5, online: false },
];

export default function ChatLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const currentId = params.conversationId as string;

  return (
    <div className="flex h-[calc(100vh-60px)] lg:h-screen bg-[#273338] text-[#FBF5DD] font-sans">
      {/* Sidebar */}
      <div className="w-80 border-r border-white/10 flex flex-col bg-[#273338] shrink-0">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Messages</h2>
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-[#9CC5A1]">
            <Plus size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D9D3BC] w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full bg-[#324147] text-[#FBF5DD] placeholder-[#D9D3BC]/60 rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#9CC5A1] text-sm transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2">
          {MOCK_CONVERSATIONS.map((conv) => (
            <Link 
              key={conv.id} 
              href={ROUTES.CHAT_CONVERSATION(conv.id)}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all mb-1 ${
                currentId === conv.id ? 'bg-[#324147]' : 'hover:bg-white/5'
              }`}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#3C4C52] flex items-center justify-center">
                  {conv.type === 'group' ? <Hash size={18} className="text-[#D9D3BC]" /> : 
                   conv.type === 'meeting' ? <MessageSquare size={18} className="text-[#D9D3BC]" /> :
                   <User size={18} className="text-[#D9D3BC]" />}
                </div>
                {conv.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-2 border-[#273338] rounded-full bg-[#9CC5A1]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium truncate text-[#FBF5DD]">{conv.name}</h3>
                  <span className="text-[10px] text-[#D9D3BC]">12:40 PM</span>
                </div>
                <p className="text-xs text-[#D9D3BC] truncate mt-0.5">Latest message preview...</p>
              </div>
              {conv.unread > 0 && (
                <div className="bg-[#9CC5A1] text-[#273338] text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center">
                  {conv.unread}
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#273338]">
        {children}
      </div>
    </div>
  );
}
