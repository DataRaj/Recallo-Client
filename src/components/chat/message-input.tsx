/**
 * Message input component for sending chat messages
 */
'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSend: (message: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({ onSend, disabled = false, placeholder = 'Message...' }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || isLoading || disabled) return;

    setIsLoading(true);
    try {
      await onSend(message);
      setMessage('');
    }
    finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="p-4 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div
        className="flex items-center gap-2 rounded-[12px] px-3.5 py-2.5"
        style={{ background: '#324147' }}
      >
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className="flex-1 bg-transparent text-[13px] focus:outline-none placeholder:opacity-40 disabled:opacity-50"
          style={{ color: '#FBF5DD' }}
        />
        <button
          onClick={() => void handleSend()}
          disabled={!message.trim() || isLoading || disabled}
          className="p-1.5 rounded-[8px] transition-all duration-200 disabled:opacity-40 active:scale-[0.9] cursor-pointer"
          style={{ background: '#BA5A5A', color: '#fff' }}
          title="Send message (Enter)"
        >
          <Send size={12} />
        </button>
      </div>
    </div>
  );
}
