'use client';

import type { LoginInput, RegisterInput } from '@/schemas/auth.schema';
import type { GoAuthResponse } from '@/types/auth';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { ROUTES } from '@/lib/routes';
import { useAuthStore } from '@/stores/use-auth-store';

const GO_API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

async function persistRefreshToken(refreshToken: string) {
  await fetch('/api/auth/set-cookie', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

function resolveReturnUrl(): string {
  if (typeof window === 'undefined') {
    return ROUTES.HOME;
  }
  const raw = new URLSearchParams(window.location.search).get('returnUrl');
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) {
    return ROUTES.HOME;
  }
  return raw;
}

export function useAuth() {
  const { setAuth, setLoading, clearAuth } = useAuthStore();
  const router = useRouter();

  const login = useCallback(
    async (input: LoginInput) => {
      setLoading(true);
      try {
        const { data } = await axios.post<GoAuthResponse>(
          `${GO_API_URL}/api/v1/auth/login`,
          input,
          { headers: { 'X-Platform': 'web', 'Content-Type': 'application/json' } },
        );

        if (!data.success) {
          throw new Error(data.message);
        }

        await persistRefreshToken(data.data.refresh_token);
        setAuth(data.data.user, data.data.access_token);
        toast.success(`Welcome back, ${data.data.user.name}!`);
        router.push(resolveReturnUrl());
      } catch (err: unknown) {
        const message
          = axios.isAxiosError(err)
            ? (err.response?.data as { message?: string })?.message ?? 'Login failed'
            : (err as Error).message;
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setAuth, setLoading, router],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      setLoading(true);
      try {
        const { data } = await axios.post<GoAuthResponse>(
          `${GO_API_URL}/api/v1/auth/register`,
          { name: input.name, email: input.email, password: input.password },
          { headers: { 'X-Platform': 'web', 'Content-Type': 'application/json' } },
        );

        if (!data.success) {
          throw new Error(data.message);
        }

        await persistRefreshToken(data.data.refresh_token);
        setAuth(data.data.user, data.data.access_token);
        toast.success(`Welcome to Recallo, ${data.data.user.name}!`);
        router.push(resolveReturnUrl());
      } catch (err: unknown) {
        const message
          = axios.isAxiosError(err)
            ? (err.response?.data as { message?: string })?.message ?? 'Registration failed'
            : (err as Error).message;
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setAuth, setLoading, router],
  );

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      clearAuth();
      router.replace(ROUTES.LOGIN);
    }
  }, [clearAuth, router]);

  return { login, register, logout };
}
