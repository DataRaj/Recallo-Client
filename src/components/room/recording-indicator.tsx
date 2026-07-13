/**
 * Recording indicator component
 */
'use client';

export type RecordingIndicatorProps = {
  isRecording: boolean;
  recordingTime?: number;
};

export function RecordingIndicator({ isRecording, recordingTime = 0 }: RecordingIndicatorProps) {
  if (!isRecording) {
    return null;
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [hours, minutes, secs].map(v => String(v).padStart(2, '0')).join(':');
  };

  return (
    <div className="fixed top-6 right-6 z-50 flex animate-pulse items-center gap-2 rounded-[8px] px-4 py-2.5" style={{ background: 'var(--color-text-accent)' }}>
      <div className="size-2.5 animate-pulse rounded-full bg-white" />
      <span className="text-sm font-semibold text-white">
        Recording
        {' '}
        {recordingTime > 0 ? formatTime(recordingTime) : 'started'}
      </span>
    </div>
  );
}
