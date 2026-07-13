/**
 * Participant list component for meeting room
 */
'use client';

import type { RoomParticipant } from '@/types/room';

type ParticipantListProps = {
  participants: RoomParticipant[];
  hostId: number;
  isExpanded?: boolean;
  onToggle?: () => void;
};

export function ParticipantList({ participants, hostId: _hostId, isExpanded = true, onToggle }: ParticipantListProps) {
  return (
    <div
      className="overflow-hidden rounded-[12px]"
      style={{ background: 'var(--color-chat-surface)' }}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="hover:bg-opacity-80 flex w-full items-center justify-between px-4 py-3 transition-all"
        style={{ background: 'var(--color-chat-bubble)' }}
      >
        <h3 className="text-sm font-semibold" style={{ color: 'var(--color-chat-text)' }}>
          Participants (
          {participants.length}
          )
        </h3>
        <span style={{ color: 'rgba(251,245,221,0.5)' }}>
          {isExpanded ? '−' : '+'}
        </span>
      </button>

      {/* List */}
      {isExpanded && (
        <div className="max-h-80 divide-y overflow-y-auto" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          {participants.map(p => (
            <div key={p.id} className="flex items-center gap-2.5 px-4 py-3">
              {/* Avatar */}
              <div
                className="flex size-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                style={{
                  background: p.isOnline ? 'var(--color-chat-accent)' : 'var(--color-text-secondary)',
                  color: '#fff',
                }}
              >
                {p.name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <p className="truncate text-sm" style={{ color: 'var(--color-chat-text)' }}>
                    {p.name}
                  </p>
                  {p.role === 'host' && (
                    <span
                      className="flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold"
                      style={{
                        background: 'var(--color-text-accent)',
                        color: '#fff',
                      }}
                    >
                      Host
                    </span>
                  )}
                </div>
                <p className="text-xs" style={{ color: 'rgba(251,245,221,0.4)' }}>
                  {p.role === 'host' ? 'Host' : p.role}
                </p>
              </div>

              {/* Status */}
              <div className="flex flex-shrink-0 items-center gap-1">
                {p.isMuted && (
                  <div
                    className="flex size-6 items-center justify-center rounded"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                    title="Muted"
                  >
                    🔇
                  </div>
                )}
                {p.isCameraOff && (
                  <div
                    className="flex size-6 items-center justify-center rounded"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                    title="Camera off"
                  >
                    📹
                  </div>
                )}
              </div>
            </div>
          ))}

          {participants.length === 0 && (
            <div className="px-4 py-6 text-center">
              <p className="text-sm" style={{ color: 'rgba(251,245,221,0.4)' }}>
                No participants
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
