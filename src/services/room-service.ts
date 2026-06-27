/**
 * Room service for API communication with Recallo Go Backend
 */

import { apiClient } from '@/libs/api-client';
import type { Room } from '@/types/room';

export interface BackendRoom {
  id: number;
  host_guest_id: string;
  livekit_room_name: string;
  title: string;
  status: 'draft' | 'live' | 'ended';
  tier: 'guest' | 'standard' | 'pro';
  extend_used: boolean;
  started_at?: string;
  ended_at?: string;
  created_at: string;
  session_duration_mins: number;
}

export interface TokenResponse {
  token: string;
  livekit_host: string;
}

// Map the backend structure to client-side Room structure
export function mapBackendRoom(r: BackendRoom): Room {
  return {
    id: String(r.id),
    type: 'meeting',
    title: r.title,
    hostId: 0,
    status: r.status === 'live' ? 'active' : r.status === 'ended' ? 'ended' : 'pending',
    createdAt: new Date(r.created_at),
    startedAt: r.started_at ? new Date(r.started_at) : undefined,
    endedAt: r.ended_at ? new Date(r.ended_at) : undefined,
    participants: [],
    participantCount: 0,
    isRecording: false,
    settings: {
      allowGuests: true,
      requireApproval: false,
      allowChat: true,
      allowScreenShare: true,
      allowRecording: true,
      allowParticipantRecording: false,
      muteOnJoin: false,
      cameraOffOnJoin: false,
    },
    livekit_room_name: r.livekit_room_name,
    host_guest_id: r.host_guest_id,
    extend_used: r.extend_used,
    tier: r.tier,
    session_duration_mins: r.session_duration_mins,
  };
}

export async function createRoom(title: string, hostGuestId: string): Promise<Room> {
  const response = await apiClient.post<BackendRoom>('/api/v1/rooms', {
    title,
    host_guest_id: hostGuestId,
  });
  return mapBackendRoom(response.data);
}

export async function getRoom(roomId: string): Promise<Room> {
  const response = await apiClient.get<BackendRoom>(`/api/v1/rooms/${roomId}`);
  return mapBackendRoom(response.data);
}

export async function endRoom(roomId: string, guestId: string): Promise<void> {
  await apiClient.delete(`/api/v1/rooms/${roomId}`, {
    params: { guest_id: guestId },
  });
}

export async function getRoomToken(
  roomId: string,
  guestId: string,
  displayName: string,
  isHost: boolean
): Promise<TokenResponse> {
  const response = await apiClient.get<TokenResponse>(`/api/v1/rooms/${roomId}/token`, {
    params: {
      guest_id: guestId,
      display_name: displayName,
      is_host: isHost ? 'true' : 'false',
    },
  });
  return response.data;
}

export async function extendRoomSession(
  roomId: string,
  guestId: string
): Promise<{ extended: boolean; message: string }> {
  const response = await apiClient.post<{ extended: boolean; message: string }>(
    `/api/v1/rooms/${roomId}/extend`,
    { guest_id: guestId }
  );
  return response.data;
}
