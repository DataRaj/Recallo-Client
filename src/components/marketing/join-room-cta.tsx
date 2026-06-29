'use client';

import { useState } from 'react';
import { JoinRoomModal } from '@/components/modals/join-room-modal';

/**
 * Marketing hero "Join a Room" button. The marketing page is a server
 * component, so this client wrapper owns the modal open state. The modal is
 * self-contained (isOpen/onClose) and only needs the global QueryProvider +
 * Toaster, both mounted at the locale root layout.
 */
export function JoinRoomCTA({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className} style={style}>
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 3h6v6M10 14L21 3M9 21H3v-6M3 21l8-8" />
        </svg>
        Join a Room
      </button>
      <JoinRoomModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
