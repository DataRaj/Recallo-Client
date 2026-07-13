import { cookies } from 'next/headers';
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
  } catch {
    return NextResponse.json({ error: 'Backend unreachable' }, { status: 503 });
  }

  const raw = await safeJson(goRes);

  // Type-narrow the expected shape.
  const data = raw as null | {
    success?: boolean;
    data?: { access_token: string; refresh_token: string; user: unknown };
    message?: string;
  };

  if (!goRes.ok || !data?.success || !data.data?.access_token || !data.data?.refresh_token) {
    // Clear stale cookie on backend rejection.
    cookieStore.delete('refresh_token');
    const message = data?.message ?? 'Token refresh failed';
    return NextResponse.json({ error: message }, { status: 401 });
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
