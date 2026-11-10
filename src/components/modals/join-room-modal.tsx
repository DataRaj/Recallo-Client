/**
 * Join room modal for connecting to existing meetings
 */
'use client';

import { Loader2 } from 'lucide-react';
import { useId, useState } from 'react';
import { useRoom } from '@/hooks/use-room';
import { Modal } from './base-modal';

type JoinRoomModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function JoinRoomModal({ isOpen, onClose }: JoinRoomModalProps) {
  const fieldId = useId();
  const [joinMethod, setJoinMethod] = useState<'id' | 'link' | null>(null);
  const [roomId, setRoomId] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [displayName, setDisplayName] = useState('');

  const { joinRoom, isLoading, error } = useRoom();

  const resetForm = () => {
    setJoinMethod(null);
    setRoomId('');
    setInviteLink('');
    setDisplayName('');
  };

  const extractRoomIdFromLink = (link: string): string => {
    // Extract room ID from various URL formats
    try {
      const url = new URL(link);
      const path = url.pathname;
      const match = path.match(/\/(?:meeting|webinar)\/([a-zA-Z0-9-]+)/);
      return match?.[1] ?? '';
    } catch {
      return '';
    }
  };

  const canJoin = (joinMethod === 'id' ? roomId.trim() : extractRoomIdFromLink(inviteLink)).length > 0;

  const handleJoin = async () => {
    if (isLoading) {
      return;
    }
    const id = joinMethod === 'id' ? roomId.trim() : extractRoomIdFromLink(inviteLink);
    if (id === '') {
      return;
    }
    try {
      await joinRoom({ roomId: id, displayName: displayName.trim() || undefined });
      onClose();
      resetForm();
    } catch {
      // The hook retains the error and entered values for retry.
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join Room" size="md">
      <div className="space-y-4">
        {joinMethod === null && (
          <div className="space-y-3">
            <button
              onClick={() => setJoinMethod('id')}
              className="w-full rounded-[12px] border p-4 text-left transition-all duration-200"
              style={{
                borderColor: 'rgba(255,255,255,0.06)',
                background: 'var(--color-chat-surface)',
              }}
            >
              <h3 className="mb-1 font-semibold" style={{ color: 'var(--color-chat-text)' }}>
                Room ID
              </h3>
              <p className="text-sm" style={{ color: 'rgba(251,245,221,0.6)' }}>
                Enter the meeting room ID
              </p>
            </button>

            <button
              onClick={() => setJoinMethod('link')}
              className="w-full rounded-[12px] border p-4 text-left transition-all duration-200"
              style={{
                borderColor: 'rgba(255,255,255,0.06)',
                background: 'var(--color-chat-surface)',
              }}
            >
              <h3 className="mb-1 font-semibold" style={{ color: 'var(--color-chat-text)' }}>
                Invite Link
              </h3>
              <p className="text-sm" style={{ color: 'rgba(251,245,221,0.6)' }}>
                Paste a meeting invite link
              </p>
            </button>

            <button
              onClick={() => setJoinMethod('link')}
              className="w-full rounded-[12px] border p-4 text-left transition-all duration-200"
              style={{
                borderColor: 'rgba(255,255,255,0.06)',
                background: 'var(--color-chat-surface)',
              }}
            >
              <h3 className="mb-1 font-semibold" style={{ color: 'var(--color-chat-text)' }}>
                Webinar Link
              </h3>
              <p className="text-sm" style={{ color: 'rgba(251,245,221,0.6)' }}>
                Paste a webinar registration link
              </p>
            </button>
          </div>
        )}
        {joinMethod !== null && (
          <div className="space-y-4">
            {/* Back button */}
            <button
              onClick={() => setJoinMethod(null)}
              className="text-sm font-medium"
              style={{ color: 'var(--color-chat-accent)' }}
            >
              ← Back
            </button>

            {/* Room ID / Link input */}
            <div>
              <label htmlFor={`${fieldId}-room`} className="mb-2 block text-sm font-medium" style={{ color: 'var(--color-chat-text)' }}>
                {joinMethod === 'id' ? 'Room ID' : 'Invite Link'}
              </label>
              <input
                id={`${fieldId}-room`}
                value={joinMethod === 'id' ? roomId : inviteLink}
                onChange={e => joinMethod === 'id' ? setRoomId(e.target.value) : setInviteLink(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isLoading && canJoin) {
                    void handleJoin();
                  }
                }}
                placeholder={joinMethod === 'id' ? 'e.g., abc123xyz' : 'e.g., https://recallo.app/meeting/abc123'}
                className="w-full rounded-[8px] border px-3 py-2 text-sm focus:outline-none"
                style={{
                  borderColor: 'rgba(255,255,255,0.06)',
                  background: 'var(--color-chat-bubble)',
                  color: 'var(--color-chat-text)',
                }}
              />
            </div>

            {/* Display name */}
            <div>
              <label htmlFor={`${fieldId}-name`} className="mb-2 block text-sm font-medium" style={{ color: 'var(--color-chat-text)' }}>
                Display Name (optional)
              </label>
              <input
                id={`${fieldId}-name`}
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isLoading && canJoin) {
                    void handleJoin();
                  }
                }}
                placeholder="Your name"
                className="w-full rounded-[8px] border px-3 py-2 text-sm focus:outline-none"
                style={{
                  borderColor: 'rgba(255,255,255,0.06)',
                  background: 'var(--color-chat-bubble)',
                  color: 'var(--color-chat-text)',
                }}
              />
            </div>

            {/* Buttons */}
            {error !== null && <p role="alert" className="text-sm" style={{ color: '#f5b8b4' }}>{error}</p>}
            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={() => {
                  setJoinMethod(null);
                  resetForm();
                }}
                disabled={isLoading}
                className="flex-1 rounded-[8px] px-4 py-2 font-medium transition-all duration-200 disabled:opacity-50"
                style={{
                  background: 'var(--color-chat-bubble)',
                  color: 'var(--color-chat-text)',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                data-room-submit
                onClick={() => void handleJoin()}
                disabled={isLoading || !canJoin}
                className="flex flex-1 items-center justify-center gap-2 rounded-[8px] px-4 py-2 font-medium transition-all duration-200 disabled:opacity-50"
                style={{
                  background: 'var(--color-text-accent)',
                  color: '#fff',
                }}
              >
                {isLoading && <Loader2 size={16} className="animate-spin" />}
                {isLoading ? 'Joining…' : 'Join'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
