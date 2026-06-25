/**
 * Room service for API communication
 */

import type { Room, CreateRoomInput, JoinRoomInput } from '@/types/room';

export async function createRoom(input: CreateRoomInput): Promise<Room> {
  const response = await fetch('/api/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error('Failed to create room');
  }

  const data = await response.json() as { data: Room };
  return data.data;
}

export async function joinRoom(input: JoinRoomInput): Promise<Room> {
  const response = await fetch(`/api/rooms/${input.roomId}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error('Failed to join room');
  }

  const data = await response.json() as { data: Room };
  return data.data;
}

export async function leaveRoom(roomId: string): Promise<void> {
  const response = await fetch(`/api/rooms/${roomId}/leave`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to leave room');
  }
}

export async function getRoom(roomId: string): Promise<Room> {
  const response = await fetch(`/api/rooms/${roomId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch room');
  }

  const data = await response.json() as { data: Room };
  return data.data;
}

export async function getUserRooms(): Promise<Room[]> {
  const response = await fetch('/api/rooms', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch rooms');
  }

  const data = await response.json() as { data: Room[] };
  return data.data;
}

export async function getRoomParticipants(roomId: string) {
  const response = await fetch(`/api/rooms/${roomId}/participants`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch participants');
  }

  const data = await response.json() as { data: unknown[] };
  return data.data;
}
