'use client';

import type { Room } from '@/types/room';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ROUTES } from '@/lib/routes';

export function formatCountdown(seconds: number | null): string {
  if (seconds === null) {
    return '--:--';
  }
  if (seconds <= 0) {
    return '00:00';
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function useSessionTimer(room: Room | null): number | null {
  const router = useRouter();
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!room) {
      return;
    }

    if (room.status === 'pending') {
      setTimeRemaining((room.session_duration_mins ?? 30) * 60);
      return;
    }
    if (room.status === 'ended') {
      setTimeRemaining(0);
      return;
    }

    const startedTime = room.startedAt
      ? new Date(room.startedAt).getTime()
      : room.createdAt.getTime();
    const durationMins = room.session_duration_mins ?? 30;
    const endTime = startedTime + durationMins * 60 * 1000;

    const tick = () => {
      const remainingMs = endTime - Date.now();
      if (remainingMs <= 0) {
        setTimeRemaining(0);
        clearInterval(interval);
        toast.error('Session expired!');
        router.push(ROUTES.HOME);
      } else {
        setTimeRemaining(Math.floor(remainingMs / 1000));
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [room, router]);

  return timeRemaining;
}
