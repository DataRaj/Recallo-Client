/**
 * Participant list component for meeting room
 */
'use client';

import type { RoomParticipant } from '@/types/room';

interface ParticipantListProps {
  participants: RoomParticipant[];
  hostId: number;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function ParticipantList({ participants, hostId, isExpanded = true, onToggle }: ParticipantListProps) {
  return (
    <div
      className="rounded-[12px] overflow-hidden"
      style={{ background: '#324147' }}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-opacity-80 transition-all"
        style={{ background: '#3C4C52' }}
      >
        <h3 className="font-semibold text-sm" style={{ color: '#FBF5DD' }}>
          Participants ({participants.length})
        </h3>
        <span style={{ color: 'rgba(251,245,221,0.5)' }}>
          {isExpanded ? '−' : '+'}
        </span>
      </button>

      {/* List */}
      {isExpanded && (
        <div className="max-h-80 overflow-y-auto divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          {participants.map(p => (
            <div key={p.id} className="px-4 py-3 flex items-center gap-2.5">
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                style={{
                  background: p.isOnline ? '#9CC5A1' : '#8D7A7A',
                  color: '#fff',
                }}
              >
                {p.name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-sm truncate" style={{ color: '#FBF5DD' }}>
                    {p.name}
                  </p>
                  {p.role === 'host' && (
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-semibold flex-shrink-0"
                      style={{
                        background: '#BA5A5A',
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
              <div className="flex items-center gap-1 flex-shrink-0">
                {p.isMuted && (
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                    title="Muted"
                  >
                    🔇
                  </div>
                )}
                {p.isCameraOff && (
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center"
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
