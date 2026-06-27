/**
 * useRoom — Hook for room operations (create, join, list, etc.)
 */
'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ROUTES } from '@/lib/routes';
import type { Room, CreateRoomInput, JoinRoomInput } from '@/types/room';
import { getOrCreateGuestId } from '@/utils/guest';
import { createRoom as apiCreateRoom, getRoom as apiGetRoom, endRoom as apiEndRoom } from '@/services/room-service';

interface UseRoomResult {
  room: Room | null;
  isLoading: boolean;
  error: string | null;
  createRoom: (input: CreateRoomInput) => Promise<Room>;
  joinRoom: (input: JoinRoomInput) => Promise<Room>;
  leaveRoom: (roomId: string) => Promise<void>;
  endRoom: (roomId: string) => Promise<void>;
}

export function useRoom(): UseRoomResult {
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const createRoom = useCallback(async (input: CreateRoomInput): Promise<Room> => {
    setIsLoading(true);
    setError(null);
    try {
      const guestId = getOrCreateGuestId();
      const newRoom = await apiCreateRoom(input.title, guestId);
      setRoom(newRoom);
      toast.success('Room created successfully');
      router.push(ROUTES.MEETING_DETAIL(newRoom.id));
      return newRoom;
    }
    catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create room';
      setError(message);
      toast.error(message);
      throw err;
    }
    finally {
      setIsLoading(false);
    }
  }, [router]);

  const joinRoom = useCallback(async (input: JoinRoomInput): Promise<Room> => {
    setIsLoading(true);
    setError(null);
    try {
      const existingRoom = await apiGetRoom(input.roomId);
      setRoom(existingRoom);
      
      // Store displayName in localStorage to use in the meeting page when fetching token
      if (input.displayName) {
        localStorage.setItem('recallo_display_name', input.displayName);
      }
      
      toast.success('Room found, connecting...');
      router.push(ROUTES.MEETING_DETAIL(existingRoom.id));
      return existingRoom;
    }
    catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to find room';
      setError(message);
      toast.error(message);
      throw err;
    }
    finally {
      setIsLoading(false);
    }
  }, [router]);

  const leaveRoom = useCallback(async (_roomId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      setRoom(null);
      toast.success('Left room');
      router.push(ROUTES.HOME);
    }
    catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to leave room';
      setError(message);
      toast.error(message);
    }
    finally {
      setIsLoading(false);
    }
  }, [router]);

  const endRoom = useCallback(async (roomId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const guestId = getOrCreateGuestId();
      await apiEndRoom(roomId, guestId);
      setRoom(null);
      toast.success('Room ended successfully');
      router.push(ROUTES.HOME);
    }
    catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to end room';
      setError(message);
      toast.error(message);
    }
    finally {
      setIsLoading(false);
    }
  }, [router]);

  return {
    room,
    isLoading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    endRoom,
  };
}
