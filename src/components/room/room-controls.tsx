/**
 * Room controls component for meeting actions
 */
'use client';

import { Disc, MessageCircle, Mic, MicOff, Share2, Video, VideoOff, X } from 'lucide-react';

type RoomControlsProps = {
  isMuted: boolean;
  isCameraOff: boolean;
  isRecording: boolean;
  isScreenSharing: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onToggleRecording?: () => void;
  onOpenChat: () => void;
  onLeaveRoom: () => void;
  canRecord?: boolean;
  canScreenShare?: boolean;
};

export function RoomControls({
  isMuted,
  isCameraOff,
  isRecording,
  isScreenSharing,
  onToggleMute,
  onToggleCamera,
  onToggleScreenShare,
  onToggleRecording,
  onOpenChat,
  onLeaveRoom,
  canRecord = true,
  canScreenShare = true,
}: RoomControlsProps) {
  const controlClasses = 'px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-95 cursor-pointer';
  const activeStyle = { background: 'var(--color-text-accent)', color: '#fff' };
  const inactiveStyle = { background: 'var(--color-chat-surface)', color: 'var(--color-chat-text)' };

  return (
    <div
      className="flex flex-wrap gap-2 rounded-[12px] p-4"
      style={{ background: 'var(--color-chat-bg)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Mute */}
      <button
        onClick={onToggleMute}
        className={controlClasses}
        style={isMuted ? activeStyle : inactiveStyle}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
        <span className="text-sm font-medium">{isMuted ? 'Unmute' : 'Mute'}</span>
      </button>

      {/* Camera */}
      <button
        onClick={onToggleCamera}
        className={controlClasses}
        style={isCameraOff ? activeStyle : inactiveStyle}
        title={isCameraOff ? 'Turn on camera' : 'Turn off camera'}
      >
        {isCameraOff ? <VideoOff size={18} /> : <Video size={18} />}
        <span className="text-sm font-medium">{isCameraOff ? 'Camera Off' : 'Camera On'}</span>
      </button>

      {/* Screen Share */}
      {canScreenShare && (
        <button
          onClick={onToggleScreenShare}
          className={controlClasses}
          style={isScreenSharing ? activeStyle : inactiveStyle}
          disabled={!canScreenShare}
          title="Share screen"
        >
          <Share2 size={18} />
          <span className="text-sm font-medium">Share</span>
        </button>
      )}

      {/* Recording */}
      {canRecord && onToggleRecording && (
        <button
          onClick={onToggleRecording}
          className={controlClasses}
          style={isRecording ? activeStyle : inactiveStyle}
          disabled={!canRecord}
          title="Start/Stop recording"
        >
          <Disc size={18} />
          <span className="text-sm font-medium">{isRecording ? 'Stop' : 'Record'}</span>
        </button>
      )}

      {/* Chat */}
      <button
        onClick={onOpenChat}
        className={controlClasses}
        style={inactiveStyle}
        title="Open chat"
      >
        <MessageCircle size={18} />
        <span className="text-sm font-medium">Chat</span>
      </button>

      {/* Leave (red) */}
      <button
        onClick={onLeaveRoom}
        className={controlClasses}
        style={{ background: 'var(--color-text-accent)', color: '#fff' }}
        title="Leave room"
      >
        <X size={18} />
        <span className="text-sm font-medium">Leave</span>
      </button>
    </div>
  );
}
