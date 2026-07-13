/**
 * Authenticated Axios client for the Recallo API.
 *
 * Architecture:
 *  - Request interceptor attaches the in-memory access token + X-Platform header.
 *  - Response interceptor catches 401s, calls /api/auth/refresh (Next.js internal
 *    API route) which reads the httpOnly cookie and calls the Go backend, then
 *    retries the original request transparently.
 *  - On unrecoverable 401, clears the auth store and redirects to /login.
 */
import axios from 'axios';
import { Env } from '@/libs/Env';
import { useAuthStore } from '@/stores/use-auth-store';

export const apiClient = axios.create({
  baseURL: Env.NEXT_PUBLIC_API_URL ?? '',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

// ── Request interceptor ──────────────────────────────────────────────────────

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Go backend requires this header for session endpoints.
  config.headers['X-Platform'] = 'web';
  return config;
});

// ── Response interceptor (silent token refresh) ──────────────────────────────

let isRefreshing = false;
let pendingQueue: Array<(token: string) => void> = [];

function drainQueue(token: string) {
  pendingQueue.forEach(cb => cb(token));
  pendingQueue = [];
}

apiClient.interceptors.response.use(
  res => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (isRefreshing) {
      // Queue requests until the ongoing refresh finishes.
      return new Promise<unknown>((resolve) => {
        pendingQueue.push((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(original));
        });
      });
    }

    isRefreshing = true;
    try {
      // Next.js internal proxy reads httpOnly cookie and forwards to Go backend.
      const { data } = await axios.post<{
        success?: boolean;
        data?: { access_token: string; refresh_token: string; user: import('@/types/auth').AuthUser };
        error?: string;
      }>('/api/auth/refresh');

      // Validate the response before trusting it.
      if (!data?.data?.access_token || !data.data.user) {
        throw new Error(data?.error ?? 'Token refresh failed');
      }

      const newToken = data.data.access_token;
      useAuthStore.getState().setAuth(data.data.user, newToken);
      drainQueue(newToken);

      original.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(original);
    } catch {
      useAuthStore.getState().clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);

export default apiClient;
