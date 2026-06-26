'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, MoreVertical, Phone, Video, Info } from 'lucide-react';

const INITIAL_MESSAGES = [
  { id: 1, text: "Hey team, how's the new feature coming along?", sender: "Alex K.", isMe: false, time: "10:30 AM" },
  { id: 2, text: "Making good progress. Should have a PR ready by EOD.", sender: "You", isMe: true, time: "10:32 AM" },
  { id: 3, text: "Awesome, let me know if you need any review.", sender: "Alex K.", isMe: false, time: "10:35 AM" }
];

export default function ChatConversationPage() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage = {
      id: Date.now(),
      text: input,
      sender: "You",
      isMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, newMessage]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-[#273338]">
      {/* Header */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#324147]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#9CC5A1] text-[#273338] flex items-center justify-center font-bold">
            D
          </div>
          <div>
            <h2 className="text-[#FBF5DD] font-medium leading-tight">Design Team</h2>
            <p className="text-[#D9D3BC] text-xs">4 members • 2 online</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[#D9D3BC]">
          <button className="hover:text-[#9CC5A1] transition-colors"><Phone size={20} /></button>
          <button className="hover:text-[#9CC5A1] transition-colors"><Video size={20} /></button>
          <button className="hover:text-[#9CC5A1] transition-colors"><Info size={20} /></button>
          <button className="hover:text-[#9CC5A1] transition-colors"><MoreVertical size={20} /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
              {!msg.isMe && (
                <span className="text-[#D9D3BC] text-xs mb-1 ml-1">{msg.sender}</span>
              )}
              <div 
                className={`px-4 py-2.5 rounded-2xl ${
                  msg.isMe 
                    ? 'bg-[#9CC5A1] text-[#273338] rounded-br-sm' 
                    : 'bg-[#3C4C52] text-[#FBF5DD] rounded-bl-sm'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[#D9D3BC]/60 text-[10px] mt-1 mx-1">{msg.time}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-[#324147] border-t border-white/10">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-[#273338] text-[#FBF5DD] rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#9CC5A1] placeholder-[#D9D3BC]/40"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-12 h-12 flex items-center justify-center bg-[#9CC5A1] text-[#273338] rounded-lg hover:bg-[#8AB38F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
