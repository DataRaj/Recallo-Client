/**
 * Room types for meetings, webinars, and video calls
 */

export type RoomType = 'meeting' | 'webinar' | 'private-meeting';
export type RoomStatus = 'pending' | 'active' | 'ended' | 'cancelled';

export interface RoomParticipant {
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
}

export interface Room {
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
}

export interface RoomSettings {
  allowGuests: boolean;
  requireApproval: boolean;
  allowChat: boolean;
  allowScreenShare: boolean;
  allowRecording: boolean;
  allowParticipantRecording: boolean;
  muteOnJoin: boolean;
  cameraOffOnJoin: boolean;
}

export interface CreateRoomInput {
  type: RoomType;
  title: string;
  description?: string;
  scheduledFor?: Date;
  maxParticipants?: number;
  settings?: Partial<RoomSettings>;
}

export interface JoinRoomInput {
  roomId: string;
  name?: string;
  email?: string;
  displayName?: string;
}

export interface RoomInvite {
  id: string;
  roomId: string;
  inviteLink: string;
  expiresAt?: Date;
  maxUses?: number;
  usesRemaining?: number;
}
