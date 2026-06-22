/**
 * POST /api/auth/logout
 *
 * Clears the httpOnly refresh_token cookie. The client should also call
 * useAuthStore.clearAuth() to wipe the in-memory access token.
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('refresh_token');
  return NextResponse.json({ success: true });
}
