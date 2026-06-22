/**
 * GET /api/auth/me
 *
 * Fetches the current user by exchanging the httpOnly refresh_token
 * with the Go backend's /api/v1/auth/me endpoint.
 *
 * Note: The Go backend's HandleGetCurrentUser expects the refresh_token in the JSON body.
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
    goRes = await fetch(`${GO_API_URL}/api/v1/auth/me`, {
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

  const data = await goRes.json();
  if (!goRes.ok) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  return NextResponse.json(data);
}
