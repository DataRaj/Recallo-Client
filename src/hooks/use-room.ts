/**
 * useRoom — Hook for room operations (create, join, list, etc.)
 */
'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ROUTES } from '@/lib/routes';
import type { Room, CreateRoomInput, JoinRoomInput } from '@/types/room';

interface UseRoomResult {
  room: Room | null;
  isLoading: boolean;
  error: string | null;
  createRoom: (input: CreateRoomInput) => Promise<Room>;
  joinRoom: (input: JoinRoomInput) => Promise<Room>;
  leaveRoom: (roomId: string) => Promise<void>;
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
      const response = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error('Failed to create room');
      }

      const data = await response.json() as { data: Room };
      setRoom(data.data);
      toast.success('Room created successfully');
      router.push(ROUTES.MEETING_DETAIL(data.data.id));
      return data.data;
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
      const response = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error('Failed to join room');
      }

      const data = await response.json() as { data: Room };
      setRoom(data.data);
      toast.success('Joined room successfully');
      router.push(ROUTES.MEETING_DETAIL(data.data.id));
      return data.data;
    }
    catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join room';
      setError(message);
      toast.error(message);
      throw err;
    }
    finally {
      setIsLoading(false);
    }
  }, [router]);

  const leaveRoom = useCallback(async (roomId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/rooms/${roomId}/leave`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to leave room');
      }

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

  return {
    room,
    isLoading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
  };
}
