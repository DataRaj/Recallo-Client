import { cookies } from 'next/headers';
/**
 * GET /api/auth/me
 *
 * Returns the current authenticated user by exchanging the httpOnly
 * refresh_token with the Go backend's refresh endpoint.
 *
 * This also rotates the refresh token (the Go backend issues a new one on
 * every successful /refresh call). The rotated cookie is written back so the
 * next hydration call does not get a stale token.
 */
import { NextResponse } from 'next/server';

const GO_API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

/** Safely parse a Response as JSON, returning null on any parse error. */
async function safeJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text.trim()) {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
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
  } catch {
    return NextResponse.json({ error: 'Backend unreachable' }, { status: 503 });
  }

  const raw = await safeJson(goRes);

  const data = raw as null | {
    success?: boolean;
    data?: { access_token: string; refresh_token: string; user: unknown };
    message?: string;
  };

  if (!goRes.ok || !data?.success || !data.data?.access_token || !data.data?.refresh_token) {
    cookieStore.delete('refresh_token');
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  // Rotate the httpOnly cookie with the new refresh token.
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
