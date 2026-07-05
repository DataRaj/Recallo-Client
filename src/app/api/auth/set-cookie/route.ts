/**
 * POST /api/auth/set-cookie
 *
 * Called by the OAuth success page after capturing tokens from the redirect URL.
 * Stores the refresh_token in an httpOnly cookie so it's never accessible from JS.
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  // Use safe text-based parse to avoid unhandled SyntaxError if body is malformed.
  const text = await req.text();
  let body: { refresh_token?: string } = {};
  try {
    body = JSON.parse(text) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.refresh_token) {
    return NextResponse.json({ error: 'Missing refresh_token' }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set('refresh_token', body.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    // 30 days — same lifetime as Go backend refresh token
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({ success: true });
}
