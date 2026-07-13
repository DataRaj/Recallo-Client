/**
 * Room types for meetings, webinars, and video calls
 */

export type RoomType = 'meeting' | 'webinar' | 'private-meeting';
export type RoomStatus = 'pending' | 'active' | 'ended' | 'cancelled';

export type RoomParticipant = {
  id: number;
  userId: number;
  name: string;
  email: string;
  avatar?: string;
  joinedAt: Date;
  leftAt?: Date;
  role: 'host' | 'moderator' | 'participant' | 'guest';
  isOnline: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
};

export type Room = {
  id: string;
  type: RoomType;
  title: string;
  description?: string;
  hostId: number;
  status: RoomStatus;
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  scheduledFor?: Date;
  participants: RoomParticipant[];
  participantCount: number;
  maxParticipants?: number;
  isRecording: boolean;
  recordingUrl?: string;
  settings: RoomSettings;
  // Go backend fields
  livekit_room_name: string;
  host_guest_id: string;
  extend_used: boolean;
  tier: 'guest' | 'standard' | 'pro';
  session_duration_mins?: number;
};

export type RoomSettings = {
  allowGuests: boolean;
  requireApproval: boolean;
  allowChat: boolean;
  allowScreenShare: boolean;
  allowRecording: boolean;
  allowParticipantRecording: boolean;
  muteOnJoin: boolean;
  cameraOffOnJoin: boolean;
};

export type CreateRoomInput = {
  type: RoomType;
  title: string;
  description?: string;
  scheduledFor?: Date;
  maxParticipants?: number;
  settings?: Partial<RoomSettings>;
};

export type JoinRoomInput = {
  roomId: string;
  name?: string;
  email?: string;
  displayName?: string;
};

export type RoomInvite = {
  id: string;
  roomId: string;
  inviteLink: string;
  expiresAt?: Date;
  maxUses?: number;
  usesRemaining?: number;
};
