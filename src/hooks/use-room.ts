'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';
import { ROUTES } from '@/lib/routes';
import type { Room, CreateRoomInput, JoinRoomInput } from '@/types/room';
import { getMeetingIdentity } from '@/utils/identity';
import { recordRecentRoom } from '@/utils/recent-rooms';
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
  const locale = useLocale();

  const createRoom = useCallback(async (input: CreateRoomInput): Promise<Room> => {
    setIsLoading(true);
    setError(null);
    try {
      const guestId = getMeetingIdentity();
      const newRoom = await apiCreateRoom(input.title, guestId);
      setRoom(newRoom);
      // recordRecentRoom dispatches RECENT_ROOMS_EVENT, so the originating tab's
      // recent list refreshes even though we don't navigate away from it.
      recordRecentRoom({
        id: newRoom.id,
        title: newRoom.title,
        type: input.type === 'webinar' ? 'webinar' : 'meeting',
        role: 'host',
      });
      toast.success('Room created successfully');
      // Open the meeting in a new tab so the dashboard tab stays put.
      const path = input.type === 'webinar'
        ? ROUTES.WEBINAR_DETAIL(newRoom.id)
        : ROUTES.MEETING_DETAIL(newRoom.id);
      if (typeof window !== 'undefined') {
        window.open(`/${locale}${path}`, '_blank', 'noopener,noreferrer');
      }
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
  }, [locale]);

  const joinRoom = useCallback(async (input: JoinRoomInput): Promise<Room> => {
    setIsLoading(true);
    setError(null);
    try {
      const existingRoom = await apiGetRoom(input.roomId);
      setRoom(existingRoom);
      recordRecentRoom({
        id: existingRoom.id,
        title: existingRoom.title,
        type: existingRoom.type === 'webinar' ? 'webinar' : 'meeting',
        role: 'guest',
      });

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
      const guestId = getMeetingIdentity();
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
