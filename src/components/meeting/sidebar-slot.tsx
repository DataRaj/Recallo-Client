'use client';

import { useEffect, useState } from 'react';
import { ChatSidebar } from '@/components/meeting/chat-sidebar';
import { PeopleSidebar } from '@/components/meeting/people-sidebar';
import { useMeetingStore } from '@/stores/use-meeting-store';

/**
 * Right-edge sidebar overlay that slides in/out with the chat/people toggle.
 *
 * It is always mounted and translated off-screen when closed, so both the
 * open and close transitions animate. The last-shown panel stays rendered
 * during the slide-out so it doesn't blink away mid-animation.
 */
export function SidebarSlot() {
  const sidebar = useMeetingStore(s => s.sidebar);
  const open = sidebar !== 'none';

  const [shown, setShown] = useState<'chat' | 'people'>('chat');
  useEffect(() => {
    if (sidebar !== 'none') {
      setShown(sidebar);
    }
  }, [sidebar]);

  return (
    <div
      aria-hidden={!open}
      className={`absolute inset-y-0 right-0 z-20 flex transition-transform duration-300 ease-out ${
        open ? 'translate-x-0' : 'pointer-events-none translate-x-full'
      }`}
      style={{ boxShadow: open ? '-12px 0 32px rgba(0,0,0,0.35)' : 'none' }}
    >
      {shown === 'chat' ? <ChatSidebar /> : <PeopleSidebar />}
    </div>
  );
}
