/**
 * Create room modal for starting meetings, webinars, or scheduled calls
 */
'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRoom } from '@/hooks/use-room';
import { Modal } from './base-modal';
import type { RoomType, CreateRoomInput } from '@/types/room';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export function CreateRoomModal({ isOpen, onClose }: CreateRoomModalProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledFor, setScheduledFor] = useState<string>('');

  const { createRoom, isLoading } = useRoom();

  const handleCreate = async () => {
    const selectedOption = ROOM_OPTIONS.find(o => o.id === selectedOptionId);
    if (!selectedOption || !title.trim()) return;

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
    }
    catch {
      // Error is handled by useRoom hook
    }
  };

  const resetForm = () => {
    setSelectedOptionId(null);
    setTitle('');
    setDescription('');
    setScheduledFor('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Room" size="md">
      <div className="space-y-4">
        {!selectedOptionId ? (
          <div className="space-y-3">
            {ROOM_OPTIONS.map(option => (
              <button
                key={option.id}
                onClick={() => setSelectedOptionId(option.id)}
                className="w-full p-4 rounded-[12px] text-left transition-all duration-200 border hover:border-opacity-50"
                style={{
                  borderColor: 'rgba(255,255,255,0.06)',
                  background: '#324147',
                }}
              >
                <h3 className="font-semibold mb-1" style={{ color: '#FBF5DD' }}>
                  {option.label}
                </h3>
                <p className="text-sm" style={{ color: 'rgba(251,245,221,0.6)' }}>
                  {option.description}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Back button */}
            <button
              onClick={() => setSelectedOptionId(null)}
              className="text-sm font-medium"
              style={{ color: '#9CC5A1' }}
            >
              ← Back
            </button>

            {/* Title input */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#FBF5DD' }}>
                Meeting Title
              </label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && title.trim()) void handleCreate(); }}
                placeholder="e.g., Team Standup"
                className="w-full px-3 py-2 rounded-[8px] border text-sm focus:outline-none"
                style={{
                  borderColor: 'rgba(255,255,255,0.06)',
                  background: '#3C4C52',
                  color: '#FBF5DD',
                }}
              />
            </div>

            {/* Description input */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#FBF5DD' }}>
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Add a description..."
                rows={3}
                className="w-full px-3 py-2 rounded-[8px] border text-sm focus:outline-none resize-none"
                style={{
                  borderColor: 'rgba(255,255,255,0.06)',
                  background: '#3C4C52',
                  color: '#FBF5DD',
                }}
              />
            </div>

            {/* Schedule date (optional) */}
            {(selectedOptionId === 'scheduled' || selectedOptionId === 'webinar') && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#FBF5DD' }}>
                  Schedule For (optional)
                </label>
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={e => setScheduledFor(e.target.value)}
                  className="w-full px-3 py-2 rounded-[8px] border text-sm focus:outline-none"
                  style={{
                    borderColor: 'rgba(255,255,255,0.06)',
                    background: '#3C4C52',
                    color: '#FBF5DD',
                  }}
                />
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-2 pt-4">
              <button
                onClick={() => {
                  setSelectedOptionId(null);
                  resetForm();
                }}
                disabled={isLoading}
                className="flex-1 px-4 py-2 rounded-[8px] font-medium transition-all duration-200 disabled:opacity-50"
                style={{
                  background: '#3C4C52',
                  color: '#FBF5DD',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={isLoading || !title.trim()}
                className="flex-1 px-4 py-2 rounded-[8px] font-medium transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{
                  background: '#BA5A5A',
                  color: '#fff',
                }}
              >
                {isLoading && <Loader2 size={16} className="animate-spin" />}
                Create
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
