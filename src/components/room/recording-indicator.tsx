/**
 * Recording indicator component
 */
'use client';

export interface RecordingIndicatorProps {
  isRecording: boolean;
  recordingTime?: number;
}

export function RecordingIndicator({ isRecording, recordingTime = 0 }: RecordingIndicatorProps) {
  if (!isRecording) return null;

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [hours, minutes, secs].map(v => String(v).padStart(2, '0')).join(':');
  };

  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-[8px] animate-pulse" style={{ background: '#BA5A5A' }}>
      <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
      <span className="text-sm font-semibold text-white">
        Recording {recordingTime > 0 ? formatTime(recordingTime) : 'started'}
      </span>
    </div>
  );
}
