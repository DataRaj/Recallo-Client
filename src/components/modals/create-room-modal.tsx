/**
 * Create room modal for starting meetings, webinars, or scheduled calls
 */
'use client';

import type { CreateRoomInput, RoomType } from '@/types/room';
import { Loader2 } from 'lucide-react';
import { useId, useState } from 'react';
import { useRoom } from '@/hooks/use-room';
import { Modal } from './base-modal';

type CreateRoomModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Marketing only offers the title field supported by the creation endpoint. */
  instantOnly?: boolean;
};

const ROOM_OPTIONS: { id: string; type: RoomType; label: string; description: string }[] = [
  {
    id: 'instant',
    type: 'meeting',
    label: 'Instant Meeting',
    description: 'Start a video call right now',
  },
  {
    id: 'scheduled',
    type: 'meeting',
    label: 'Scheduled Meeting',
    description: 'Plan a future meeting',
  },
  {
    id: 'private',
    type: 'private-meeting',
    label: 'Private Meeting',
    description: 'Create a private meeting room',
  },
  {
    id: 'webinar',
    type: 'webinar',
    label: 'Webinar',
    description: 'Broadcast to your audience',
  },
];

export function CreateRoomModal({ isOpen, onClose, instantOnly = false }: CreateRoomModalProps) {
  const fieldId = useId();
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(instantOnly ? 'instant' : null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledFor, setScheduledFor] = useState<string>('');

  const { createRoom, isLoading, error } = useRoom();

  const resetForm = () => {
    setSelectedOptionId(instantOnly ? 'instant' : null);
    setTitle('');
    setDescription('');
    setScheduledFor('');
  };

  const handleCreate = async () => {
    const selectedOption = ROOM_OPTIONS.find(o => o.id === selectedOptionId);
    if (isLoading || !selectedOption || !title.trim()) {
      return;
    }

    const input: CreateRoomInput = {
      type: selectedOption.type,
      title,
      description: description.trim() || undefined,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
    };

    try {
      await createRoom(input);
      onClose();
      resetForm();
    } catch {
      // Error is handled by useRoom hook
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Room" size="md">
      <div className="space-y-4">
        {selectedOptionId === null && (
          <div className="space-y-3">
            {ROOM_OPTIONS.map(option => (
              <button
                key={option.id}
                onClick={() => setSelectedOptionId(option.id)}
                className="w-full rounded-[12px] border p-4 text-left transition-all duration-200"
                style={{
                  borderColor: 'rgba(255,255,255,0.06)',
                  background: 'var(--color-chat-surface)',
                }}
              >
                <h3 className="mb-1 font-semibold" style={{ color: 'var(--color-chat-text)' }}>
                  {option.label}
                </h3>
                <p className="text-sm" style={{ color: 'rgba(251,245,221,0.6)' }}>
                  {option.description}
                </p>
              </button>
            ))}
          </div>
        )}
        {selectedOptionId !== null && (
          <div className="space-y-4">
            {/* Back button */}
            {!instantOnly && (
              <button
                onClick={() => setSelectedOptionId(null)}
                className="text-sm font-medium"
                style={{ color: 'var(--color-chat-accent)' }}
              >
                ← Back
              </button>
            )}

            {/* Title input */}
            <div>
              <label htmlFor={`${fieldId}-title`} className="mb-2 block text-sm font-medium" style={{ color: 'var(--color-chat-text)' }}>
                Meeting Title
              </label>
              <input
                id={`${fieldId}-title`}
                value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isLoading && title.trim()) {
                    void handleCreate();
                  }
                }}
                placeholder="e.g., Team Standup"
                className="w-full rounded-[8px] border px-3 py-2 text-sm focus:outline-none"
                style={{
                  borderColor: 'rgba(255,255,255,0.06)',
                  background: 'var(--color-chat-bubble)',
                  color: 'var(--color-chat-text)',
                }}
              />
            </div>

            {/* Description input */}
            {!instantOnly && (
              <div>
                <label htmlFor={`${fieldId}-description`} className="mb-2 block text-sm font-medium" style={{ color: 'var(--color-chat-text)' }}>
                  Description (optional)
                </label>
                <textarea
                  id={`${fieldId}-description`}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Add a description..."
                  rows={3}
                  className="w-full resize-none rounded-[8px] border px-3 py-2 text-sm focus:outline-none"
                  style={{
                    borderColor: 'rgba(255,255,255,0.06)',
                    background: 'var(--color-chat-bubble)',
                    color: 'var(--color-chat-text)',
                  }}
                />
              </div>
            )}

            {/* Schedule date (optional) */}
            {(selectedOptionId === 'scheduled' || selectedOptionId === 'webinar') && (
              <div>
                <label htmlFor={`${fieldId}-schedule`} className="mb-2 block text-sm font-medium" style={{ color: 'var(--color-chat-text)' }}>
                  Schedule For (optional)
                </label>
                <input
                  id={`${fieldId}-schedule`}
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={e => setScheduledFor(e.target.value)}
                  className="w-full rounded-[8px] border px-3 py-2 text-sm focus:outline-none"
                  style={{
                    borderColor: 'rgba(255,255,255,0.06)',
                    background: 'var(--color-chat-bubble)',
                    color: 'var(--color-chat-text)',
                  }}
                />
              </div>
            )}

            {/* Buttons */}
            {error !== null && <p role="alert" className="text-sm" style={{ color: '#f5b8b4' }}>{error}</p>}
            <div className="flex gap-2 pt-4">
              <button
                onClick={() => {
                  if (instantOnly) {
                    onClose();
                  }
                  setSelectedOptionId(null);
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
                onClick={() => void handleCreate()}
                disabled={isLoading || !title.trim()}
                className="flex flex-1 items-center justify-center gap-2 rounded-[8px] px-4 py-2 font-medium transition-all duration-200 disabled:opacity-50"
                style={{
                  background: 'var(--color-text-accent)',
                  color: '#fff',
                }}
              >
                {isLoading && <Loader2 size={16} className="animate-spin" />}
                {isLoading ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
