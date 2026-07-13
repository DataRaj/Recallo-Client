/**
 * Join room modal for connecting to existing meetings
 */
'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useRoom } from '@/hooks/use-room';
import { Modal } from './base-modal';

type JoinRoomModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function JoinRoomModal({ isOpen, onClose }: JoinRoomModalProps) {
  const [joinMethod, setJoinMethod] = useState<'id' | 'link' | null>(null);
  const [roomId, setRoomId] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [displayName, setDisplayName] = useState('');

  const { joinRoom, isLoading } = useRoom();

  const handleJoin = async () => {
    const id = joinMethod === 'id' ? roomId : extractRoomIdFromLink(inviteLink);

    if (!id) {
      return;
    }

    try {
      await joinRoom({
        roomId: id,
        displayName: displayName.trim() || undefined,
      });
      onClose();
      resetForm();
    } catch {
      // Error is handled by useRoom hook
    }
  };

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
      return match?.[1] || '';
    } catch {
      return '';
    }
  };

  const canJoin = joinMethod === 'id' ? roomId.trim() : extractRoomIdFromLink(inviteLink);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join Room" size="md">
      <div className="space-y-4">
        {!joinMethod ? (
          <div className="space-y-3">
            <button
              onClick={() => setJoinMethod('id')}
              className="hover:border-opacity-50 w-full rounded-[12px] border p-4 text-left transition-all duration-200"
              style={{
                borderColor: 'rgba(255,255,255,0.06)',
                background: '#324147',
              }}
            >
              <h3 className="mb-1 font-semibold" style={{ color: '#FBF5DD' }}>
                Room ID
              </h3>
              <p className="text-sm" style={{ color: 'rgba(251,245,221,0.6)' }}>
                Enter the meeting room ID
              </p>
            </button>

            <button
              onClick={() => setJoinMethod('link')}
              className="hover:border-opacity-50 w-full rounded-[12px] border p-4 text-left transition-all duration-200"
              style={{
                borderColor: 'rgba(255,255,255,0.06)',
                background: '#324147',
              }}
            >
              <h3 className="mb-1 font-semibold" style={{ color: '#FBF5DD' }}>
                Invite Link
              </h3>
              <p className="text-sm" style={{ color: 'rgba(251,245,221,0.6)' }}>
                Paste a meeting invite link
              </p>
            </button>

            <button
              onClick={() => setJoinMethod('link')}
              className="hover:border-opacity-50 w-full rounded-[12px] border p-4 text-left transition-all duration-200"
              style={{
                borderColor: 'rgba(255,255,255,0.06)',
                background: '#324147',
              }}
            >
              <h3 className="mb-1 font-semibold" style={{ color: '#FBF5DD' }}>
                Webinar Link
              </h3>
              <p className="text-sm" style={{ color: 'rgba(251,245,221,0.6)' }}>
                Paste a webinar registration link
              </p>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Back button */}
            <button
              onClick={() => setJoinMethod(null)}
              className="text-sm font-medium"
              style={{ color: '#9CC5A1' }}
            >
              ← Back
            </button>

            {/* Room ID / Link input */}
            <div>
              <label className="mb-2 block text-sm font-medium" style={{ color: '#FBF5DD' }}>
                {joinMethod === 'id' ? 'Room ID' : 'Invite Link'}
              </label>
              <input
                value={joinMethod === 'id' ? roomId : inviteLink}
                onChange={e => joinMethod === 'id' ? setRoomId(e.target.value) : setInviteLink(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && canJoin) {
                    void handleJoin();
                  }
                }}
                placeholder={joinMethod === 'id' ? 'e.g., abc123xyz' : 'e.g., https://recallo.app/meeting/abc123'}
                className="w-full rounded-[8px] border px-3 py-2 text-sm focus:outline-none"
                style={{
                  borderColor: 'rgba(255,255,255,0.06)',
                  background: '#3C4C52',
                  color: '#FBF5DD',
                }}
              />
            </div>

            {/* Display name */}
            <div>
              <label className="mb-2 block text-sm font-medium" style={{ color: '#FBF5DD' }}>
                Display Name (optional)
              </label>
              <input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && canJoin) {
                    void handleJoin();
                  }
                }}
                placeholder="Your name"
                className="w-full rounded-[8px] border px-3 py-2 text-sm focus:outline-none"
                style={{
                  borderColor: 'rgba(255,255,255,0.06)',
                  background: '#3C4C52',
                  color: '#FBF5DD',
                }}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-4">
              <button
                onClick={() => {
                  setJoinMethod(null);
                  resetForm();
                }}
                disabled={isLoading}
                className="flex-1 rounded-[8px] px-4 py-2 font-medium transition-all duration-200 disabled:opacity-50"
                style={{
                  background: '#3C4C52',
                  color: '#FBF5DD',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleJoin}
                disabled={isLoading || !canJoin}
                className="flex flex-1 items-center justify-center gap-2 rounded-[8px] px-4 py-2 font-medium transition-all duration-200 disabled:opacity-50"
                style={{
                  background: '#BA5A5A',
                  color: '#fff',
                }}
              >
                {isLoading && <Loader2 size={16} className="animate-spin" />}
                Join
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
