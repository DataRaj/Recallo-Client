/**
 * Represents a user as returned by the Go backend.
 * Note: The backend uses integer IDs. RBAC roles are not yet in the DB schema.
 */
export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  /** True once the initial hydration attempt (via /api/auth/me) has completed. */
  isHydrated: boolean;
}

/** Shape of a successful Go backend auth response (login / register / refresh). */
export interface GoAuthResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    access_token: string;
    refresh_token: string;
  };
}
