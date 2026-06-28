'use client';

import { useMeetingStore } from '@/stores/use-meeting-store';
import { ChatSidebar } from '@/components/meeting/chat-sidebar';
import { PeopleSidebar } from '@/components/meeting/people-sidebar';

export function SidebarSlot() {
  const sidebar = useMeetingStore(s => s.sidebar);

  if (sidebar === 'chat') return <ChatSidebar />;
  if (sidebar === 'people') return <PeopleSidebar />;
  return null;
}
