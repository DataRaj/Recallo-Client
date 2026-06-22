/**
 * POST /api/auth/refresh
 *
 * Bridges the httpOnly cookie to the Go backend's JSON-body refresh endpoint.
 * The Go backend expects: POST /api/v1/auth/refresh  { "refresh_token": "..." }
 *
 * On success:
 *  - Returns the new access_token + user object to the client.
 *  - Rotates the httpOnly cookie with the new refresh_token.
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GO_API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
  }

  let goRes: Response;
  try {
    goRes = await fetch(`${GO_API_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Platform': 'web',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }
  catch {
    return NextResponse.json({ error: 'Backend unreachable' }, { status: 503 });
  }

  const data = await goRes.json() as {
    success: boolean;
    data?: { access_token: string; refresh_token: string; user: unknown };
  };

  if (!goRes.ok || !data.success || !data.data) {
    // Clear stale cookie on backend rejection.
    cookieStore.delete('refresh_token');
    return NextResponse.json({ error: 'Token refresh failed' }, { status: 401 });
  }

  // Rotate cookie with the new refresh token.
  const res = NextResponse.json({ success: true, data: data.data });
  res.cookies.set('refresh_token', data.data.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  return res;
}
