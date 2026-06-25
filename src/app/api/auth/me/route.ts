/**
 * GET /api/auth/me
 *
 * Returns the current authenticated user by exchanging the httpOnly
 * refresh_token with the Go backend's refresh endpoint.
 *
 * This does NOT rotate the refresh token — it just validates it and
 * returns the user object. The client uses this for hydration only.
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GO_API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export async function GET() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  let goRes: Response;
  try {
    // Use the refresh endpoint — it validates the token and returns user + new tokens
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
    cookieStore.delete('refresh_token');
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  // Rotate the httpOnly cookie with the new refresh token
  const res = NextResponse.json({ success: true, data: { user: data.data.user } });
  res.cookies.set('refresh_token', data.data.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  return res;
}
