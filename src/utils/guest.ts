/**
 * Guest ID utility for managing client-side persistent guest UUIDs
 */

export function getOrCreateGuestId(): string {
  if (typeof window === 'undefined') return '';
  
  let guestId = localStorage.getItem('recallo_guest_id');
  if (!guestId) {
    guestId = crypto.randomUUID();
    localStorage.setItem('recallo_guest_id', guestId);
  }
  
  return guestId;
}
