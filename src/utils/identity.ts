import { useAuthStore } from '@/stores/use-auth-store';
import { getOrCreateGuestId } from '@/utils/guest';

/** Identity used for LiveKit + the rooms backend's `guest_id` param. */
export function getMeetingIdentity(): string {
  const user = useAuthStore.getState().user;
  if (user) {
    return `u${user.id}`;
  }
  return getOrCreateGuestId();
}

/** Parse a Recallo user id out of an identity string, or null if it isn't one. */
export function parseUserId(identity: string): number | null {
  const match = /^u(\d+)$/.exec(identity);
  if (!match) {
    return null;
  }
  return Number(match[1]);
}
